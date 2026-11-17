import { getNanwoniBalls } from './nanwoniBall';
// 순위 목록에서 당첨된 이름 앞에 붙는 표시. 이모지(👑) 대신 직접 그린다.
// 시제품에서는 주소 뒤 ?mark=이름 으로 바꿔 보며 고른다(기본은 아래 DEFAULT_MARK).

export type WinnerMark = 'emoji' | 'crown' | 'maple' | 'button' | 'star' | 'trophy' | 'medal' | 'heart'
  | 'face' | 'horn' | 'rosette' | 'badge' | 'flag' | 'sparkle' | 'goldbutton' | 'smallcrown';
export const WINNER_MARKS: Array<[WinnerMark, string]> = [
  ['emoji', '지금(왕관 이모지)'],
  ['crown', '금색 도트 왕관'],
  ['maple', '단풍잎'],
  ['button', '분홍 단추'],
  ['star', '별'],
  ['trophy', '트로피'],
  ['medal', '리본 메달'],
  ['heart', '하트'],
  // 두 번째 묶음(사용자: "다른거 없을까")
  ['face', '작은 난워니 얼굴'],
  ['horn', '분홍 줄무늬 뿔'],
  ['rosette', '꽃 리본 배지'],
  ['badge', '동그란 1등 배지'],
  ['flag', '결승 깃발'],
  ['sparkle', '반짝이'],
  ['goldbutton', '금 단추'],
  ['smallcrown', '분홍 보석 왕관'],
];
const DEFAULT_MARK: WinnerMark = 'smallcrown'; // 사용자가 16번(분홍 보석 왕관)으로 골랐다(2026-10-14)

export function currentWinnerMark(): WinnerMark {
  const value = new URLSearchParams(globalThis.location?.search ?? '').get('mark');
  return WINNER_MARKS.some(([key]) => key === value) ? (value as WinnerMark) : DEFAULT_MARK;
}

const LINE = '#3d2228';
let faceImg: HTMLCanvasElement | undefined;

function star(ctx: CanvasRenderingContext2D, r: number, inner: number, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const rr = i % 2 === 0 ? r : inner;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** (x, y)를 가운데로 size 크기의 표시를 그린다 */
export function drawWinnerMark(ctx: CanvasRenderingContext2D, kind: WinnerMark, x: number, y: number, size: number) {
  if (typeof ctx.fill !== 'function') return; // 도형을 그릴 수 없는 그림판(자동 검사용 가짜)에서는 건너뛴다
  const s = size / 16; // 16 기준으로 그린 모양을 키운다
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.4 * s;
  ctx.strokeStyle = LINE;
  switch (kind) {
    case 'emoji':
      ctx.rotate(-5 * Math.PI / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size}px sans-serif`;
      ctx.fillText('👑', 0, 0);
      break;
    case 'crown': {
      // 계단 모양 도트 왕관
      const p = 2 * s;
      ctx.fillStyle = '#ffcd4a';
      const rows = ['#.#.#', '#.#.#', '#####', '#####', '#####'];
      rows.forEach((row, ry) => Array.from(row).forEach((c, rx) => {
        if (c === '#') ctx.fillRect((rx - 2.5) * p, (ry - 2.5) * p, p, p);
      }));
      ctx.fillStyle = '#c9401f';
      ctx.fillRect(-0.5 * p, 0.5 * p, p, p);
      break;
    }
    case 'maple':
      ctx.rotate(-0.25);
      star(ctx, 7.5 * s, 3.2 * s);
      ctx.fillStyle = '#ff8a3d';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 1.5 * s);
      ctx.lineTo(0, 7.5 * s);
      ctx.stroke();
      break;
    case 'button':
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 1 * s, 7.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#d99aa8';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f0b3c3';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = LINE;
      for (const dx of [-2.2, 2.2]) {
        ctx.beginPath();
        ctx.arc(dx * s, 0, 1.1 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'star':
      star(ctx, 7.5 * s, 3.4 * s);
      ctx.fillStyle = '#ffd75a';
      ctx.fill();
      ctx.stroke();
      break;
    case 'trophy':
      ctx.fillStyle = '#ffcd4a';
      ctx.beginPath();
      ctx.moveTo(-5 * s, -6 * s);
      ctx.lineTo(5 * s, -6 * s);
      ctx.quadraticCurveTo(5 * s, 1.5 * s, 0, 2 * s);
      ctx.quadraticCurveTo(-5 * s, 1.5 * s, -5 * s, -6 * s);
      ctx.fill();
      ctx.stroke();
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(side * 5.2 * s, -3.5 * s, 2.2 * s, -Math.PI / 2, Math.PI / 2, side < 0);
        ctx.stroke();
      }
      ctx.fillRect(-1.2 * s, 2 * s, 2.4 * s, 3 * s);
      ctx.beginPath();
      ctx.rect(-4 * s, 5 * s, 8 * s, 2.5 * s);
      ctx.fill();
      ctx.stroke();
      break;
    case 'medal':
      ctx.fillStyle = '#c9401f';
      ctx.beginPath();
      ctx.moveTo(-4 * s, -8 * s);
      ctx.lineTo(-1 * s, -1 * s);
      ctx.lineTo(1 * s, -1 * s);
      ctx.lineTo(4 * s, -8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 3 * s, 5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcd4a';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = LINE;
      ctx.font = `700 ${6 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', 0, 3.3 * s);
      break;
    case 'face': {
      // 공에 쓰는 난워니 퍼스나콘 첫 장을 작게(아직 못 불러왔으면 그리지 않는다)
      faceImg ??= getNanwoniBalls()[0];
      if (!faceImg) break;
      const d = 22 * s;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(faceImg, -d / 2, -d / 2 - 1 * s, d, d);
      break;
    }
    case 'horn': {
      // 공 머리 위 꼭지와 같은 분홍 줄무늬 뿔
      const hornPath = () => {
        ctx.beginPath();
        ctx.moveTo(-6 * s, 6 * s);
        ctx.quadraticCurveTo(-2 * s, -6 * s, 0, -8 * s);
        ctx.quadraticCurveTo(2 * s, -6 * s, 6 * s, 6 * s);
        ctx.closePath();
      };
      hornPath();
      ctx.fillStyle = '#ef8189';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = '#feb6bc';
      ctx.lineWidth = 1.6 * s;
      for (let yy = -6; yy <= 6; yy += 3.2) {
        ctx.beginPath();
        ctx.moveTo(-7 * s, (yy + 1.5) * s);
        ctx.lineTo(7 * s, (yy - 1.5) * s);
        ctx.stroke();
      }
      ctx.restore();
      hornPath(); // 줄무늬를 그리며 바뀐 경로를 뿔 테두리로 되돌린다
      ctx.strokeStyle = '#b8505a';
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
      break;
    }
    case 'rosette': {
      // 꽃잎 모양 테두리 + 아래로 늘어진 리본 두 줄
      ctx.fillStyle = '#c9401f';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 1 * s, 2 * s);
        ctx.lineTo(side * 5 * s, 8.5 * s);
        ctx.lineTo(side * 2.5 * s, 7.5 * s);
        ctx.lineTo(side * 1.5 * s, 9.5 * s);
        ctx.lineTo(side * -1.5 * s, 3 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = (i % 2 ? 5.6 : 7) * s;
        const px = Math.cos(a) * r, py = Math.sin(a) * r - 1.5 * s;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#f0b3c3';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -1.5 * s, 3.6 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcd4a';
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'badge':
      ctx.beginPath();
      ctx.arc(0, 0, 7.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#c9401f';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff3d6';
      ctx.font = `700 ${10 * s}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', 0, 0.8 * s);
      break;
    case 'flag': {
      // 체크무늬 결승 깃발
      ctx.beginPath();
      ctx.moveTo(-5 * s, -7.5 * s);
      ctx.lineTo(-5 * s, 8 * s);
      ctx.stroke();
      const q = 2.5 * s;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        ctx.fillStyle = (r + c) % 2 ? LINE : '#fff3d6';
        ctx.fillRect(-4.3 * s + c * q, -7.2 * s + r * q, q, q);
      }
      ctx.strokeRect(-4.3 * s, -7.2 * s, 4 * q, 4 * q);
      break;
    }
    case 'sparkle': {
      const spark = (cx: number, cy: number, r: number, color: string) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + r);
        ctx.quadraticCurveTo(cx, cy, cx - r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - r);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
      };
      spark(-1.5 * s, 1 * s, 7 * s, '#ffd75a');
      spark(5 * s, -5 * s, 3.2 * s, '#f0b3c3');
      break;
    }
    case 'goldbutton':
      ctx.beginPath();
      ctx.arc(0, 0, 7.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcd4a';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
      ctx.strokeStyle = '#c99520';
      ctx.stroke();
      ctx.fillStyle = LINE;
      for (const [dx, dy] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, 0.95 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'smallcrown':
      ctx.beginPath();
      ctx.moveTo(-7 * s, 5 * s);
      ctx.lineTo(-7.5 * s, -4 * s);
      ctx.lineTo(-3.5 * s, 0);
      ctx.lineTo(0, -6.5 * s);
      ctx.lineTo(3.5 * s, 0);
      ctx.lineTo(7.5 * s, -4 * s);
      ctx.lineTo(7 * s, 5 * s);
      ctx.closePath();
      ctx.fillStyle = '#ffcd4a';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ef8189';
      for (const [dx, dy, r] of [[0, 1.8, 1.8], [-4, 2.5, 1.1], [4, 2.5, 1.1]]) {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(0, 6 * s);
      ctx.bezierCurveTo(-9 * s, 0, -5 * s, -7.5 * s, 0, -3 * s);
      ctx.bezierCurveTo(5 * s, -7.5 * s, 9 * s, 0, 0, 6 * s);
      ctx.fillStyle = '#ff6a8a';
      ctx.fill();
      ctx.stroke();
      break;
  }
  ctx.restore();
}
