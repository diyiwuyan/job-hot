export type ResultCardData = {
  assessmentName: string;
  resultName: string;
  headline: string;
  action: string;
  source?: string;
  accent?: string;
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.join('').length < text.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[，。；、！？]$/, '')}…`;
  }
  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

export async function downloadAssessmentResultCard(data: ResultCardData) {
  if (typeof document === 'undefined') return;
  if ('fonts' in document) await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const accent = data.accent || '#25b880';
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1440);
  gradient.addColorStop(0, '#07120f');
  gradient.addColorStop(1, '#0c1c23');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1440);

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(960, 130, 270, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(70, 1320, 230, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#d9f8ea';
  ctx.font = '600 34px "Microsoft YaHei", sans-serif';
  ctx.fillText('JOBHOT × 职路同行社', 80, 105);
  ctx.fillStyle = '#8fb3a7';
  ctx.font = '28px "Microsoft YaHei", sans-serif';
  ctx.fillText('免费求职诊断 · 结果用于行动参考', 80, 155);

  ctx.fillStyle = accent;
  roundedRect(ctx, 80, 220, 920, 86, 43);
  ctx.fill();
  ctx.fillStyle = '#061612';
  ctx.font = '700 32px "Microsoft YaHei", sans-serif';
  ctx.fillText(data.assessmentName, 122, 275);

  ctx.fillStyle = '#f3fbf7';
  ctx.font = '800 74px "Microsoft YaHei", sans-serif';
  drawLines(ctx, wrapText(ctx, data.resultName, 900, 2), 80, 410, 92);

  ctx.fillStyle = '#c5ddd4';
  ctx.font = '600 40px "Microsoft YaHei", sans-serif';
  drawLines(ctx, wrapText(ctx, data.headline, 900, 4), 80, 620, 64);

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  roundedRect(ctx, 80, 840, 920, 350, 34);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = '700 34px "Microsoft YaHei", sans-serif';
  ctx.fillText('未来72小时，先完成这一件事', 126, 915);
  ctx.fillStyle = '#eef8f3';
  ctx.font = '32px "Microsoft YaHei", sans-serif';
  drawLines(ctx, wrapText(ctx, data.action, 830, 6), 126, 985, 52);

  ctx.fillStyle = '#87a89d';
  ctx.font = '26px "Microsoft YaHei", sans-serif';
  ctx.fillText('jobhot.abcdabcd.cc/tools/assessment/', 80, 1305);
  ctx.fillText(`来源：${data.source || '直接访问'}`, 80, 1355);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = data.resultName.replace(/[\\/:*?"<>|\s]+/g, '-');
  anchor.href = url;
  anchor.download = `${safeName}-求职诊断卡.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

