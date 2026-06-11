/* eslint-disable */
/**
 * QR Code generator — compact port of qrcode-generator by Kazuhiko Arase.
 * Original: https://github.com/kazuhikoarase/qrcode-generator  (MIT License)
 *
 * This is a self-contained, dependency-free port supporting byte mode and
 * error-correction level M, returning a boolean module matrix. It is the
 * widely-used, well-tested reference algorithm (correct masking + format/
 * version info), so generated codes scan reliably.
 */

// ── QRMath (GF(256)) ──────────────────────────────────────────────────
const EXP_TABLE: number[] = new Array(256);
const LOG_TABLE: number[] = new Array(256);
for (let i = 0; i < 8; i++) EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) LOG_TABLE[EXP_TABLE[i]] = i;
function glog(n: number) { return LOG_TABLE[n]; }
function gexp(n: number) { while (n < 0) n += 255; while (n >= 256) n -= 255; return EXP_TABLE[n]; }

// ── Polynomial ────────────────────────────────────────────────────────
class QRPolynomial {
  num: number[];
  constructor(num: number[], shift: number) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
  }
  get(i: number) { return this.num[i]; }
  getLength() { return this.num.length; }
  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0);
    for (let i = 0; i < this.getLength(); i++)
      for (let j = 0; j < e.getLength(); j++)
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
    return new QRPolynomial(num, 0);
  }
  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = this.num.slice();
    for (let i = 0; i < e.getLength(); i++) num[i] ^= gexp(glog(e.get(i)) + ratio);
    return new QRPolynomial(num, 0).mod(e);
  }
}

function getErrorCorrectPolynomial(ecLength: number): QRPolynomial {
  let a = new QRPolynomial([1], 0);
  for (let i = 0; i < ecLength; i++) a = a.multiply(new QRPolynomial([1, gexp(i)], 0));
  return a;
}

// ── BitBuffer ─────────────────────────────────────────────────────────
class QRBitBuffer {
  buffer: number[] = [];
  length = 0;
  get(index: number) { return ((this.buffer[Math.floor(index / 8)] >>> (7 - (index % 8))) & 1) === 1; }
  put(num: number, length: number) {
    for (let i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) === 1);
  }
  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    this.length++;
  }
}

// ── RS block table (EC level M, versions 1..10) ──────────────────────
// Each entry: [totalCount, dataCount] repeated per block group.
const RS_BLOCK_M: Record<number, number[]> = {
  1: [1, 26, 16],
  2: [1, 44, 28],
  3: [1, 70, 44],
  4: [2, 50, 32],
  5: [2, 67, 43],
  6: [4, 43, 27],
  7: [4, 49, 31],
  8: [2, 60, 38, 2, 61, 39],
  9: [3, 58, 36, 2, 59, 37],
  10: [4, 69, 43, 1, 70, 44],
};

interface RSBlock { totalCount: number; dataCount: number; }
function getRSBlocks(version: number): RSBlock[] {
  const raw = RS_BLOCK_M[version];
  const list: RSBlock[] = [];
  for (let i = 0; i < raw.length; i += 3) {
    const count = raw[i], total = raw[i + 1], data = raw[i + 2];
    for (let j = 0; j < count; j++) list.push({ totalCount: total, dataCount: data });
  }
  return list;
}

// ── Data encoding (8-bit byte mode) ──────────────────────────────────
function toUtf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0xd800 || code >= 0xe000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else {
      // surrogate pair
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return out;
}

function chooseVersion(byteLen: number): number {
  for (let v = 1; v <= 10; v++) {
    const blocks = getRSBlocks(v);
    let totalData = 0;
    for (const b of blocks) totalData += b.dataCount;
    const charCountBits = v < 10 ? 8 : 16;
    const neededBytes = Math.ceil((4 + charCountBits + byteLen * 8) / 8);
    if (neededBytes <= totalData) return v;
  }
  throw new Error('QR: data too long for supported versions (<=10)');
}

function createData(version: number, dataBytes: number[]): number[] {
  const buffer = new QRBitBuffer();
  buffer.put(4, 4); // byte mode
  buffer.put(dataBytes.length, version < 10 ? 8 : 16);
  for (const b of dataBytes) buffer.put(b, 8);

  const rsBlocks = getRSBlocks(version);
  let totalDataCount = 0;
  for (const b of rsBlocks) totalDataCount += b.dataCount;
  const totalBits = totalDataCount * 8;

  if (buffer.length + 4 <= totalBits) buffer.put(0, 4);
  while (buffer.length % 8 !== 0) buffer.putBit(false);
  while (buffer.length < totalBits) {
    buffer.put(0xec, 8);
    if (buffer.length >= totalBits) break;
    buffer.put(0x11, 8);
  }
  return createBytes(buffer, rsBlocks);
}

function createBytes(buffer: QRBitBuffer, rsBlocks: RSBlock[]): number[] {
  let offset = 0;
  let maxDc = 0, maxEc = 0;
  const dcdata: number[][] = [];
  const ecdata: number[][] = [];
  for (const block of rsBlocks) {
    const dcCount = block.dataCount;
    const ecCount = block.totalCount - block.dataCount;
    maxDc = Math.max(maxDc, dcCount);
    maxEc = Math.max(maxEc, ecCount);
    const dc = new Array(dcCount);
    for (let i = 0; i < dcCount; i++) dc[i] = 0xff & buffer.buffer[i + offset];
    offset += dcCount;
    const rsPoly = getErrorCorrectPolynomial(ecCount);
    const rawPoly = new QRPolynomial(dc, rsPoly.getLength() - 1);
    const modPoly = rawPoly.mod(rsPoly);
    const ec = new Array(rsPoly.getLength() - 1);
    for (let i = 0; i < ec.length; i++) {
      const modIndex = i + modPoly.getLength() - ec.length;
      ec[i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
    }
    dcdata.push(dc);
    ecdata.push(ec);
  }
  const data: number[] = [];
  for (let i = 0; i < maxDc; i++)
    for (let r = 0; r < rsBlocks.length; r++)
      if (i < dcdata[r].length) data.push(dcdata[r][i]);
  for (let i = 0; i < maxEc; i++)
    for (let r = 0; r < rsBlocks.length; r++)
      if (i < ecdata[r].length) data.push(ecdata[r][i]);
  return data;
}

// ── Matrix module placement ──────────────────────────────────────────
const PAD_MASK = 0; // mask pattern 0

function getBCHDigit(data: number) {
  let digit = 0;
  while (data !== 0) { digit++; data >>>= 1; }
  return digit;
}
const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

function getBCHTypeInfo(data: number) {
  let d = data << 10;
  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  return ((data << 10) | d) ^ G15_MASK;
}
function getBCHTypeNumber(data: number) {
  let d = data << 12;
  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  return (data << 12) | d;
}

const PATTERN_POSITION_TABLE: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

class QRCodeModel {
  version: number;
  moduleCount: number;
  modules: (boolean | null)[][];
  dataCache: number[];
  constructor(version: number, dataBytes: number[]) {
    this.version = version;
    this.moduleCount = version * 4 + 17;
    this.modules = [];
    this.dataCache = createData(version, dataBytes);
    this.makeImpl();
  }
  private makeImpl() {
    const n = this.moduleCount;
    this.modules = Array.from({ length: n }, () => new Array(n).fill(null));
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(n - 7, 0);
    this.setupPositionProbePattern(0, n - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo();
    if (this.version >= 7) this.setupTypeNumber();
    this.mapData(this.dataCache);
  }
  private setupPositionProbePattern(row: number, col: number) {
    const n = this.moduleCount;
    for (let r = -1; r <= 7; r++) {
      if (row + r < 0 || n <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c < 0 || n <= col + c) continue;
        this.modules[row + r][col + c] =
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4);
      }
    }
  }
  private setupTimingPattern() {
    const n = this.moduleCount;
    for (let r = 8; r < n - 8; r++) if (this.modules[r][6] === null) this.modules[r][6] = r % 2 === 0;
    for (let c = 8; c < n - 8; c++) if (this.modules[6][c] === null) this.modules[6][c] = c % 2 === 0;
  }
  private setupPositionAdjustPattern() {
    const pos = PATTERN_POSITION_TABLE[this.version - 1];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i], col = pos[j];
        if (this.modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r++)
          for (let c = -2; c <= 2; c++)
            this.modules[row + r][col + c] =
              r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
      }
    }
  }
  private setupTypeNumber() {
    const bits = getBCHTypeNumber(this.version);
    const n = this.moduleCount;
    for (let i = 0; i < 18; i++) {
      const mod = ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][(i % 3) + n - 8 - 3] = mod;
      this.modules[(i % 3) + n - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }
  private setupTypeInfo() {
    const n = this.moduleCount;
    // EC level M = 0, mask pattern 0 → data = (0 << 3) | 0 = 0
    const data = (0 << 3) | PAD_MASK;
    const bits = getBCHTypeInfo(data);
    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;
      if (i < 6) this.modules[i][8] = mod;
      else if (i < 8) this.modules[i + 1][8] = mod;
      else this.modules[n - 15 + i][8] = mod;
    }
    for (let i = 0; i < 15; i++) {
      const mod = ((bits >> i) & 1) === 1;
      if (i < 8) this.modules[8][n - i - 1] = mod;
      else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod;
      else this.modules[8][15 - i - 1] = mod;
    }
    this.modules[n - 8][8] = true; // dark module
  }
  private mapData(data: number[]) {
    const n = this.moduleCount;
    let inc = -1;
    let row = n - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = n - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (;;) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            // mask 0
            if ((row + (col - c)) % 2 === 0) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) { byteIndex++; bitIndex = 7; }
          }
        }
        row += inc;
        if (row < 0 || n <= row) { row -= inc; inc = -inc; break; }
      }
    }
  }
}

/** Generate a QR matrix (boolean[][], true = dark) for the given text. */
export function generateQR(text: string): boolean[][] {
  const bytes = toUtf8Bytes(text);
  const version = chooseVersion(bytes.length);
  const model = new QRCodeModel(version, bytes);
  return model.modules.map(row => row.map(m => m === true));
}

/** Render a QR matrix to an SVG data-URL string. */
export function qrToDataURL(matrix: boolean[][], scale = 6, margin = 4): string {
  const n = matrix.length;
  const size = (n + margin * 2) * scale;
  let rects = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${(c + margin) * scale}" y="${(r + margin) * scale}" width="${scale}" height="${scale}"/>`;
      }
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="#ffffff"/>` +
    `<g fill="#000000">${rects}</g></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
