import { FACET_INFO, FACET_ORDER, TYPE_INFO, TYPE_ORDER, type HollandFacet, type HollandType } from '@/lib/holland-data';

export type HollandResultCardData = {
  code: string;
  scores: Record<HollandType, number>;
  breakdown: Record<HollandFacet, Record<HollandType, number>>;
  categories: Array<{ title: string; roles: string[] }>;
  majorLabel: string;
  source?: string;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      if (lines.length >= maxLines) break;
    } else current = next;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.join('').length < text.length && lines.length) lines[lines.length - 1] = `${lines.at(-1)!.replace(/[，。；、]$/, '')}…`;
  return lines;
}

function drawTextLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

function pointAt(index: number, radius: number, centerX: number, centerY: number) {
  const angle = Math.PI * 2 * index / TYPE_ORDER.length - Math.PI / 2;
  return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius };
}

function drawRadar(ctx: CanvasRenderingContext2D, scores: Record<HollandType, number>) {
  const centerX = 300;
  const centerY = 485;
  const radius = 150;
  ctx.save();
  for (const level of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath();
    TYPE_ORDER.forEach((_, index) => {
      const point = pointAt(index, radius * level, centerX, centerY);
      if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.strokeStyle = level === 1 ? '#aebdb7' : '#d6dfda';
    ctx.lineWidth = level === 1 ? 2 : 1;
    ctx.stroke();
  }
  TYPE_ORDER.forEach((_, index) => {
    const point = pointAt(index, radius, centerX, centerY);
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#d6dfda'; ctx.stroke();
  });
  ctx.beginPath();
  TYPE_ORDER.forEach((type, index) => {
    const point = pointAt(index, radius * scores[type] / 30, centerX, centerY);
    if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(26, 119, 94, .18)';
  ctx.strokeStyle = '#19775e';
  ctx.lineWidth = 4;
  ctx.fill(); ctx.stroke();
  TYPE_ORDER.forEach((type, index) => {
    const result = pointAt(index, radius * scores[type] / 30, centerX, centerY);
    ctx.beginPath(); ctx.arc(result.x, result.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = TYPE_INFO[type].color; ctx.fill();
    const label = pointAt(index, radius + 48, centerX, centerY);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#152824';
    ctx.font = '800 25px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`${type} ${TYPE_INFO[type].name}`, label.x, label.y - 5);
    ctx.fillStyle = '#6c7b76';
    ctx.font = '600 22px "DIN Alternate", "PingFang SC", sans-serif';
    ctx.fillText(`${scores[type]}/30`, label.x, label.y + 24);
  });
  ctx.restore();
}

function drawScoreTable(ctx: CanvasRenderingContext2D, data: HollandResultCardData) {
  const x = 80;
  const y = 720;
  const width = 920;
  const labelWidth = 260;
  const cellWidth = (width - labelWidth) / 6;
  const rowHeight = 58;
  const rows = 5;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, x, y, width, rowHeight * rows, 20); ctx.fill();
  ctx.save();
  roundedRect(ctx, x, y, width, rowHeight * rows, 20); ctx.clip();
  ctx.fillStyle = '#e7efeb'; ctx.fillRect(x, y, width, rowHeight);
  ctx.fillStyle = '#edf4f1'; ctx.fillRect(x, y + rowHeight * 4, width, rowHeight);
  ctx.strokeStyle = '#cfdbd6'; ctx.lineWidth = 1;
  for (let row = 1; row < rows; row += 1) { ctx.beginPath(); ctx.moveTo(x, y + row * rowHeight); ctx.lineTo(x + width, y + row * rowHeight); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x + labelWidth, y); ctx.lineTo(x + labelWidth, y + rowHeight * rows); ctx.stroke();
  for (let column = 1; column < 6; column += 1) { ctx.beginPath(); ctx.moveTo(x + labelWidth + column * cellWidth, y); ctx.lineTo(x + labelWidth + column * cellWidth, y + rowHeight * rows); ctx.stroke(); }

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillStyle = '#42514c'; ctx.font = '700 22px "PingFang SC", sans-serif'; ctx.fillText('兴趣・能力・职业反馈', x + 22, y + rowHeight / 2);
  TYPE_ORDER.forEach((type, index) => {
    ctx.textAlign = 'center'; ctx.fillStyle = TYPE_INFO[type].color; ctx.font = '800 23px "DIN Alternate", "PingFang SC", sans-serif';
    ctx.fillText(type, x + labelWidth + cellWidth * (index + .5), y + rowHeight / 2);
  });
  FACET_ORDER.forEach((facet, rowIndex) => {
    ctx.textAlign = 'left'; ctx.fillStyle = '#4d5e58'; ctx.font = '600 21px "PingFang SC", sans-serif';
    ctx.fillText(`${FACET_INFO[facet].shortName}（满分10）`, x + 22, y + rowHeight * (rowIndex + 1.5));
    TYPE_ORDER.forEach((type, columnIndex) => {
      ctx.textAlign = 'center'; ctx.fillStyle = '#13241f'; ctx.font = '700 23px "DIN Alternate", "PingFang SC", sans-serif';
      ctx.fillText(String(data.breakdown[facet][type]), x + labelWidth + cellWidth * (columnIndex + .5), y + rowHeight * (rowIndex + 1.5));
    });
  });
  ctx.textAlign = 'left'; ctx.fillStyle = '#13241f'; ctx.font = '800 22px "PingFang SC", sans-serif'; ctx.fillText('总分（满分30）', x + 22, y + rowHeight * 4.5);
  TYPE_ORDER.forEach((type, index) => { ctx.textAlign = 'center'; ctx.font = '800 25px "DIN Alternate", sans-serif'; ctx.fillText(String(data.scores[type]), x + labelWidth + cellWidth * (index + .5), y + rowHeight * 4.5); });
  ctx.restore();
}

export async function downloadHollandResultCard(data: HollandResultCardData) {
  if (typeof document === 'undefined') return;
  if ('fonts' in document) await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#f3f6f2'; ctx.fillRect(0, 0, 1080, 1440);
  ctx.fillStyle = '#0e2924'; ctx.fillRect(0, 0, 1080, 255);
  ctx.fillStyle = '#8ee0bd'; ctx.font = '700 27px "PingFang SC", "Microsoft YaHei", sans-serif'; ctx.fillText('JOBHOT · 大学生求职探索报告', 80, 72);
  ctx.fillStyle = '#ffffff'; ctx.font = '900 78px "DIN Alternate", "PingFang SC", sans-serif'; ctx.fillText(`霍兰德代码 ${data.code}`, 80, 168);
  const topTypes = data.code.split('') as HollandType[];
  let pillX = 80;
  topTypes.forEach((type) => {
    const label = `${type} ${TYPE_INFO[type].name}`;
    ctx.font = '700 22px "PingFang SC", sans-serif';
    const pillWidth = ctx.measureText(label).width + 44;
    ctx.fillStyle = TYPE_INFO[type].color; roundedRect(ctx, pillX, 192, pillWidth, 42, 21); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(label, pillX + 22, 220); pillX += pillWidth + 14;
  });

  drawRadar(ctx, data.scores);
  ctx.fillStyle = '#ffffff'; roundedRect(ctx, 600, 326, 400, 320, 24); ctx.fill();
  ctx.fillStyle = '#17302a'; ctx.font = '800 27px "PingFang SC", sans-serif'; ctx.fillText('前三项倾向', 636, 374);
  topTypes.forEach((type, index) => {
    const rowY = 422 + index * 70;
    ctx.fillStyle = TYPE_INFO[type].color; roundedRect(ctx, 636, rowY, 44, 44, 13); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 22px "DIN Alternate", sans-serif'; ctx.fillText(type, 658, rowY + 30);
    ctx.textAlign = 'left'; ctx.fillStyle = '#172a25'; ctx.font = '700 24px "PingFang SC", sans-serif'; ctx.fillText(TYPE_INFO[type].name, 700, rowY + 21);
    ctx.fillStyle = '#71807b'; ctx.font = '20px "PingFang SC", sans-serif'; ctx.fillText(TYPE_INFO[type].traits.join(' · '), 700, rowY + 48);
    ctx.textAlign = 'right'; ctx.fillStyle = '#172a25'; ctx.font = '800 25px "DIN Alternate", sans-serif'; ctx.fillText(`${data.scores[type]}/30`, 960, rowY + 30);
  });
  ctx.textAlign = 'left'; ctx.fillStyle = '#65736f'; ctx.font = '20px "PingFang SC", sans-serif';
  drawTextLines(ctx, wrapText(ctx, `专业背景：${data.majorLabel}`, 390, 1), 600, 686, 28);

  drawScoreTable(ctx, data);

  ctx.fillStyle = '#17302a'; ctx.font = '800 28px "PingFang SC", sans-serif'; ctx.fillText('优先探索的岗位大类', 80, 1060);
  ctx.fillStyle = '#65736f'; ctx.font = '20px "PingFang SC", sans-serif'; ctx.fillText('按兴趣代码 × 专业方向 × AI 实践基础生成', 360, 1060);
  data.categories.slice(0, 4).forEach((category, index) => {
    const cardX = 80 + (index % 2) * 470;
    const cardY = 1090 + Math.floor(index / 2) * 124;
    ctx.fillStyle = '#ffffff'; roundedRect(ctx, cardX, cardY, 450, 106, 18); ctx.fill();
    ctx.fillStyle = index === 0 ? '#19775e' : '#263f38'; ctx.font = '800 24px "PingFang SC", sans-serif'; ctx.fillText(`${String(index + 1).padStart(2, '0')}  ${category.title}`, cardX + 22, cardY + 36);
    ctx.fillStyle = '#6b7974'; ctx.font = '19px "PingFang SC", sans-serif';
    drawTextLines(ctx, wrapText(ctx, category.roles.slice(0, 3).join('、'), 405, 2), cardX + 22, cardY + 68, 25);
  });

  ctx.fillStyle = '#52635d'; ctx.font = '19px "PingFang SC", sans-serif';
  ctx.fillText('兴趣分数不是能力等级；请再用专业、技能、经历和真实 JD 验证。', 80, 1370);
  ctx.textAlign = 'right'; ctx.fillText(`jobhot.abcdabcd.cc · 来源：${data.source || '直接访问'}`, 1000, 1405);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `霍兰德-${data.code}-求职探索卡.png`;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
