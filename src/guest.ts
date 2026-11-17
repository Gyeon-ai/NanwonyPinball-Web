// 난워니 핀볼(시제품): 주소 뒤의 값으로 이름표를 바꾼다.   ?title=이름표 글자
//   색 판은 까만 머리 노란 머리띠 하나뿐이다(2026-11-17 사용자 확정 "2번으로 해줘", 크림 판은 "크림 지우고"로 삭제).
//   색 값은 docs/DESIGN.md "난워니 핀볼"과 시안 난워니핀볼-디자인의 THEMES를 따른다.
// 값은 이 화면을 꾸미는 데만 쓰고 어디에도 보내지 않는다.
import { DOT, Themes } from './data/constants';
import { drawWinnerMark, WINNER_MARKS } from './winnerMark';
import { PERSONACON_URLS } from './nanwoniBall';

type Palette = {
  label: string;
  /** 경기장 바탕이 밝은 판(이름 글씨를 짙게, 흰 외곽선으로) */
  light: boolean;
  field: string; // 경기장 바탕
  map: string; // 미니맵 바탕
  core: string; // 맵 선
  neon: string; // 번짐·점·장애물
  panel: string; // 상자(조작판·타이머)
  panelIn: string; // 입력칸·안 고른 칸
  border: string; // 테두리
  text: string; // 글자
  soft: string; // 흐린 글자
  ink: string; // 단추 아래 그림자·알림 바탕
  onInk: string; // 알림 글자
  tagBg: string; // 이름표
  tagText: string;
  start: string; // 시작 단추
  startDeep: string;
  startText: string;
  shuffle: string; // 섞기 단추
  shuffleDeep: string;
  shuffleText: string;
  seg: string; // 고른 칸
  segText: string;
  winBg: string; // 당첨 상자
  winBorder: string;
  winText: string;
  winShadow: string; // '당 첨' 글자 그림자
};

export const DEFAULT_TITLE = '난워니 핀볼';
export const DEFAULT_COLOR = 'black';
const MAX_TITLE_LENGTH = 12;

export const PALETTES: Record<string, Palette> = {
  // 까만 머리 노란 머리띠
  black: {
    label: '까만 머리 노란 머리띠', light: false, field: '#18171c', map: '#0f0e12', core: '#fff3c4', neon: '#ffd23f',
    panel: '#24232a', panelIn: '#1b1a20', border: '#ffd23f', text: '#fff8e6', soft: '#c9bfa6', ink: '#000000', onInk: '#fff8e6',
    tagBg: '#ffd23f', tagText: '#18171c', start: '#ffd23f', startDeep: '#a8891c', startText: '#18171c',
    shuffle: '#fff3d9', shuffleDeep: '#a89f88', shuffleText: '#18171c', seg: '#fff3d9', segText: '#18171c',
    winBg: '#fff3d9', winBorder: '#ffd23f', winText: '#18171c', winShadow: '#ffd23f',
  },
};

// 네온 바·장애물 색은 색 판을 따른다(고르는 기능 없음)
export const DEFAULT_NEON = 'auto';
export const NEONS: Record<string, { label: string; color: string }> = {
  auto: { label: '기본', color: '' },
};

const state = { title: DEFAULT_TITLE, color: DEFAULT_COLOR, neon: DEFAULT_NEON };

function cleanTitle(value: string | null): string {
  const title = Array.from((value ?? '').replace(/\s+/g, ' ').trim()).slice(0, MAX_TITLE_LENGTH).join('');
  return title || DEFAULT_TITLE;
}

function applyColor(key: string) {
  const palette = PALETTES[key] ?? PALETTES[DEFAULT_COLOR];
  state.color = key in PALETTES ? key : DEFAULT_COLOR;

  const css: Record<string, string> = {
    '--dot-bg': palette.panelIn,
    '--dot-band': palette.panelIn,
    '--dot-box': palette.panel,
    '--dot-line': palette.border,
    '--dot-line-soft': palette.border,
    '--dot-ink': palette.ink,
    '--dot-on-ink': palette.onInk,
    '--dot-text': palette.text,
    '--dot-accent': palette.seg,
    '--dot-seg-text': palette.segText,
    '--dot-red': palette.start,
    '--dot-red-deep': palette.startDeep,
    '--dot-on-red': palette.startText,
    '--dot-blue': palette.shuffle,
    '--dot-blue-deep': palette.shuffleDeep,
    '--dot-on-blue': palette.shuffleText,
    '--dot-cyan': palette.neon,
    '--dot-mark-shadow': palette.start,
    '--tag-bg': palette.tagBg,
    '--win-border': palette.winBorder,
    '--tag-text': palette.tagText,
    '--page-bg': palette.field,
  };
  for (const [name, value] of Object.entries(css)) {
    document.documentElement.style.setProperty(name, value);
  }
  document.documentElement.dataset.theme = state.color;

  // 캔버스에 그리는 쪽(순위 목록, 당첨 상자, 미니맵, 경기장 바탕, 공 이름)
  DOT.line = palette.border;
  DOT.ink = palette.ink;
  DOT.textSoft = palette.soft;
  DOT.accent = palette.seg;
  DOT.red = palette.start;
  DOT.mono = false;
  DOT.winBorder = palette.winBorder;
  DOT.winText = palette.winText;
  DOT.winShadow = palette.winShadow;
  DOT.nameStroke = palette.light ? 'rgba(255, 255, 255, 0.95)' : 'black';
  DOT.nameStrokeWidth = palette.light ? 2.5 : 1.25;

  Themes.dark.coolTimeIndicator = 'red';
  Themes.dark.background = palette.field;
  Themes.dark.minimapBackground = palette.map;
  Themes.dark.minimapViewport = palette.light ? palette.border : 'white';
  Themes.dark.marbleWinningBorder = palette.light ? palette.border : 'white';
  DOT.nameLightness = palette.light ? 34 : 70;
  Themes.dark.marbleLightness = DOT.nameLightness;
  Themes.dark.winnerBackground = palette.winBg;
  applyNeon(state.neon);
}

function applyNeon(key: string) {
  state.neon = key in NEONS ? key : DEFAULT_NEON;
  const palette = PALETTES[state.color] ?? PALETTES[DEFAULT_COLOR];
  const entity = Themes.dark.entity;
  // 바·네모·동그라미는 번짐 색, 벽 선은 맵 선 색에 번짐 색
  Object.assign(entity.box, { fill: palette.neon, outline: palette.neon, bloom: palette.neon });
  Object.assign(entity.circle, { fill: palette.neon, outline: palette.neon, bloom: palette.neon });
  Object.assign(entity.polyline, { fill: palette.core, outline: palette.core, bloom: palette.neon });
  DOT.neonAll = true;
}

function applyTitle(title: string) {
  state.title = cleanTitle(title);
  document.title = state.title;
  const text = document.querySelector('#brandTitle');
  if (text) text.textContent = state.title;
  const heading = document.querySelector('h1.sr-only');
  if (heading) heading.textContent = `${state.title} - 랜덤 추첨기`;
}

/** 지금 모양을 그대로 여는 주소. 명단(?names=)은 담지 않는다. */
function shareUrl(): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  if (state.title !== DEFAULT_TITLE) url.searchParams.set('title', state.title);
  if (state.color !== DEFAULT_COLOR) url.searchParams.set('theme', state.color);
  if (state.neon !== DEFAULT_NEON) url.searchParams.set('neon', state.neon);
  return url.toString();
}

function syncAddress() {
  const url = new URL(window.location.href);
  if (state.title !== DEFAULT_TITLE) url.searchParams.set('title', state.title);
  else url.searchParams.delete('title');
  if (state.color !== DEFAULT_COLOR) url.searchParams.set('theme', state.color);
  else url.searchParams.delete('theme');
  if (state.neon !== DEFAULT_NEON) url.searchParams.set('neon', state.neon);
  else url.searchParams.delete('neon');
  window.history.replaceState(null, '', url);
}

function setupEditor() {
  const button = document.querySelector<HTMLButtonElement>('#brandMark');
  const editor = document.querySelector<HTMLElement>('#brandEditor');
  const input = document.querySelector<HTMLInputElement>('#in_brandTitle');
  const swatches = document.querySelector<HTMLElement>('#brandColors');
  const neons = document.querySelector<HTMLElement>('#brandNeons');
  const copy = document.querySelector<HTMLButtonElement>('#btnBrandCopy');
  const message = document.querySelector<HTMLElement>('#brandMessage');
  if (!button || !editor || !input || !swatches || !neons || !copy || !message) return;

  const close = () => {
    editor.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };
  const markColor = () => {
    swatches.querySelectorAll('button').forEach((swatch) => {
      swatch.classList.toggle('active', swatch.dataset.color === state.color);
    });
  };

  for (const [key, palette] of Object.entries(PALETTES)) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.dataset.color = key;
    swatch.title = palette.label;
    swatch.setAttribute('aria-label', `${palette.label} 색`);
    swatch.style.setProperty('--swatch-a', palette.tagBg);
    swatch.style.setProperty('--swatch-b', palette.start);
    swatch.addEventListener('click', () => {
      applyColor(key);
      markColor();
      syncAddress();
    });
    swatches.append(swatch);
  }

  const markNeon = () => {
    neons.querySelectorAll('button').forEach((swatch) => {
      swatch.classList.toggle('active', swatch.dataset.neon === state.neon);
    });
  };
  for (const [key, neon] of Object.entries(NEONS)) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.dataset.neon = key;
    swatch.title = neon.label;
    swatch.setAttribute('aria-label', `네온 ${neon.label}`);
    // "기본"은 색 판을 따른다는 뜻으로 반반 표시
    swatch.style.setProperty('--swatch-a', neon.color || '#f4f4f4');
    swatch.style.setProperty('--swatch-b', neon.color || '#35f0ff');
    swatch.addEventListener('click', () => {
      applyNeon(key);
      markNeon();
      syncAddress();
    });
    neons.append(swatch);
  }
  markNeon();

  input.maxLength = MAX_TITLE_LENGTH;
  input.value = state.title === DEFAULT_TITLE ? '' : state.title;
  input.addEventListener('input', () => {
    applyTitle(input.value);
    syncAddress();
  });

  button.addEventListener('click', () => {
    editor.hidden = !editor.hidden;
    button.setAttribute('aria-expanded', String(!editor.hidden));
    message.textContent = '';
    if (!editor.hidden) input.focus();
  });
  copy.addEventListener('click', () => {
    const url = shareUrl();
    const done = () => {
      message.textContent = '주소를 복사했습니다.';
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(done, () => {
        message.textContent = url;
      });
    } else {
      message.textContent = url;
    }
  });
  document.addEventListener('mousedown', (event) => {
    const target = event.target as Node;
    if (!editor.hidden && !editor.contains(target) && !button.contains(target)) close();
  });
  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close();
      button.focus();
    }
  });
  markColor();
}

/** 경기장 그림판은 화면 폭 1280px보다 좁으면 그만큼 작게 그려진다. 미니맵 위 이름표도 같은 비율로 줄인다 */
function syncMinimapScale() {
  const scale = Math.min(1, window.innerWidth / 1280);
  document.documentElement.style.setProperty('--mm-scale', String(scale));
}

/** 이름표 그림과 탭 아이콘: 퍼스나콘 6개월 그림(assets/personacons) */
// 이름표 그림: 사용자가 준 난워니 고양이 그림(2026-11-17 "내가준 사진 난워니 핀볼에 넣어볼래"). 탭 아이콘은 그대로 퍼스나콘 6개월.
const BRAND_CAT_URL = new URL('../assets/brand/nanwoni-cat.png', import.meta.url);

function applyBrandBall() {
  const url = PERSONACON_URLS[0].toString(); // 6개월
  document.documentElement.style.setProperty('--brand-ball', `url("${BRAND_CAT_URL.toString()}")`);
  let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement('link');
    icon.rel = 'icon';
    document.head.append(icon);
  }
  icon.type = 'image/png';
  icon.href = url;
}

export function setupGuest() {
  syncMinimapScale();
  (globalThis as any).__winnerMark = { draw: drawWinnerMark, list: WINNER_MARKS }; // 시제품 확인용
  window.addEventListener('resize', syncMinimapScale);
  const params = new URLSearchParams(window.location.search);
  state.neon = params.get('neon') ?? DEFAULT_NEON;
  applyColor(params.get('theme') ?? params.get('color') ?? DEFAULT_COLOR);
  applyBrandBall();
  const ready = () => {
    applyTitle(params.get('title') ?? DEFAULT_TITLE);
    setupEditor();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
}
