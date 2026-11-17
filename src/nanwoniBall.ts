// 난워니 핀볼의 공 그림: 난워니 구독 퍼스나콘 10장(6~42개월. 1·3개월은 사용자 요청으로 뺌).
// 사용 허락은 사용자가 난워니 측에서 받았다고 전함(docs/SOURCES.md 2026-11-16). 2026-11-16 사용자 승인("어 퍼스나콘 받아")으로
// 디자인 대화가 내려받은 파일(시안\난워니핀볼-디자인\참고\)을 assets/personacons/에 두고 쓴다. 이 그림은 저장소 밖으로 재배포하지 않는다.
// 공 그림 만들기: 사용자가 고른 C안(2026-11-16 "C로 진행", 기준 코드 시안\난워니핀볼-디자인\공-원본다듬기.html의 up()·polish()).
//   1) 36칸 원본에서 [x4, y2, 28×28]을 잘라(10장 공통 범위 + 한 칸 여유) 두 번에 나눠 144칸으로 부드럽게 키운다
//   2) 아주 약한 언샤프(반지름 2 상자 흐림, 세기 0.45, RGB만)
//   3) 채도 1.15배(평균 회색 기준), 밝기 곡선 255×(v/255)^1.35(진한 곳만 더 진하게, 흰색은 그대로)
//   4) 알파 (a−128)×1.5+128 로 가장자리 반투명을 줄인다. 원으로 자르지 않고, 따로 테두리도 두르지 않는다
// 같은 이름은 항상 같은 그림을 받는다. 그림을 못 불러오면 도트 공으로 그린다.

export const PERSONACON_URLS: URL[] = [
  new URL('../assets/personacons/06-month.png', import.meta.url),
  new URL('../assets/personacons/09-month.png', import.meta.url),
  new URL('../assets/personacons/12-month.png', import.meta.url),
  new URL('../assets/personacons/15-month.png', import.meta.url),
  new URL('../assets/personacons/18-month.png', import.meta.url),
  new URL('../assets/personacons/21-month.png', import.meta.url),
  new URL('../assets/personacons/24-month.png', import.meta.url),
  new URL('../assets/personacons/30-month.png', import.meta.url),
  new URL('../assets/personacons/36-month.png', import.meta.url),
  new URL('../assets/personacons/42-month.png', import.meta.url),
];

/** 경기 중 공 그림을 실제 공 크기의 몇 배로 그릴지(공 크기·물리는 그대로) */
export const BALL_ART_SCALE = 1;

const SKIN = 144;
const CROP: [x: number, y: number, w: number, h: number] = [4, 2, 28, 28];
const POLISH = { tone: 0.35, sat: 1.15, sharp: 0.45, edge: 1.5 };

function canvasOf(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return [canvas, canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D];
}

function boxBlur(src: Float32Array, size: number, radius: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += src[y * size + Math.min(size - 1, Math.max(0, x + k))];
      tmp[y * size + x] = sum / span;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += tmp[Math.min(size - 1, Math.max(0, y + k)) * size + x];
      out[y * size + x] = sum / span;
    }
  }
  return out;
}

/** 1) 잘라서 두 번에 나눠 부드럽게 키우기(72 → 144) */
function up(image: CanvasImageSource): HTMLCanvasElement {
  const [sx, sy, sw, sh] = CROP;
  const [half, hx] = canvasOf(SKIN / 2);
  hx.imageSmoothingEnabled = true;
  hx.imageSmoothingQuality = 'high';
  hx.drawImage(image, sx, sy, sw, sh, 0, 0, SKIN / 2, SKIN / 2);
  const [big, bx] = canvasOf(SKIN);
  bx.imageSmoothingEnabled = true;
  bx.imageSmoothingQuality = 'high';
  bx.drawImage(half, 0, 0, SKIN, SKIN);
  return big;
}

/** 2)~4) 약한 언샤프, 채도, 진한 곳 더 진하게, 가장자리 알파 */
function polish(src: HTMLCanvasElement): HTMLCanvasElement {
  const { tone, sat, sharp, edge } = POLISH;
  const [out, ctx] = canvasOf(SKIN);
  ctx.drawImage(src, 0, 0);
  try {
    const data = ctx.getImageData(0, 0, SKIN, SKIN);
    const p = data.data;
    if (sharp > 0) {
      for (let ch = 0; ch < 3; ch++) {
        const plane = new Float32Array(SKIN * SKIN);
        for (let i = 0; i < plane.length; i++) plane[i] = p[i * 4 + ch];
        const blurred = boxBlur(plane, SKIN, 2);
        for (let i = 0; i < plane.length; i++) p[i * 4 + ch] = Math.max(0, Math.min(255, plane[i] + (plane[i] - blurred[i]) * sharp));
      }
    }
    const curve = (v: number) => 255 * Math.pow(Math.max(0, Math.min(255, v)) / 255, 1 + tone);
    for (let i = 0; i < p.length; i += 4) {
      let r = p[i];
      let g = p[i + 1];
      let b = p[i + 2];
      const m = (r + g + b) / 3;
      r = m + (r - m) * sat;
      g = m + (g - m) * sat;
      b = m + (b - m) * sat;
      p[i] = curve(r);
      p[i + 1] = curve(g);
      p[i + 2] = curve(b);
      p[i + 3] = Math.max(0, Math.min(255, (p[i + 3] - 128) * edge + 128));
    }
    ctx.putImageData(data, 0, 0);
  } catch {
    // 그림을 읽을 수 없으면 키운 그림 그대로 쓴다
  }
  return out;
}

let skins: HTMLCanvasElement[] = [];
let loading: Promise<HTMLCanvasElement[]> | undefined;

/** 10장을 한 번만 불러와 다듬어 둔다. 못 불러온 그림은 빼고, 하나도 없으면 빈 목록 */
export function loadNanwoniBalls(): Promise<HTMLCanvasElement[]> {
  if (typeof document === 'undefined') return Promise.resolve([]);
  loading ??= Promise.all(
    PERSONACON_URLS.map(
      (url) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const image = new Image();
          image.addEventListener('load', () => resolve(image), { once: true });
          image.addEventListener('error', () => resolve(null), { once: true });
          image.src = url.toString();
        })
    )
  ).then((images) => {
    skins = images.filter((image): image is HTMLImageElement => image !== null).map((image) => polish(up(image)));
    return skins;
  });
  return loading;
}

export function getNanwoniBalls(): HTMLCanvasElement[] {
  return skins;
}

function nameHash(name: string): number {
  let hash = 0;
  for (const character of name) hash = (Math.imul(hash, 31) + (character.codePointAt(0) ?? 0)) >>> 0;
  return hash;
}

/** 같은 이름은 항상 같은 공. 아직 못 불러왔으면 undefined(도트 공으로 그린다) */
export function getNanwoniBall(name: string): HTMLCanvasElement | undefined {
  if (skins.length === 0) return undefined;
  return skins[nameHash(name) % skins.length];
}
