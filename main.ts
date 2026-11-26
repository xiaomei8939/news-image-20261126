// The World in One Image — Thursday 26 November 2026.
// Node 22, standard library only, no network. Draws a one-page newspaper
// infographic of the day's verified world news and writes it as a PNG to
// /output/entry.png (or $MAKEFUN_OUTPUT_DIR/entry.png outside the grader).
// The drawing is fully deterministic: same code, same bytes, every run.

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1024;
const H = 1024;

// ---------- tiny PNG encoder (RGB, filter 0 scanlines, zlib deflate) ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(pixels) {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    pixels.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- framebuffer helpers ----------
const px = Buffer.alloc(W * H * 3);
function setPix(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = (y * W + x) * 3;
  px[o] = r; px[o + 1] = g; px[o + 2] = b;
}
function rect(x, y, w, h, col) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setPix(i, j, col[0], col[1], col[2]);
}
function hline(x, y, w, col, th = 2) { rect(x, y, w, th, col); }
function circle(cx, cy, rad, col) {
  for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++)
    if (i * i + j * j <= rad * rad) setPix(cx + i, cy + j, col[0], col[1], col[2]);
}

// ---------- 5x7 bitmap font (rows of 5 bits, MSB left) ----------
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11], B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e], D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f], F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f], H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e], J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11], L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11], N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e], P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d], R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e], T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e], V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11], X: [0x11, 0x0a, 0x04, 0x04, 0x04, 0x0a, 0x11],
  Y: [0x11, 0x0a, 0x04, 0x04, 0x04, 0x04, 0x04], Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e], '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f], '3': [0x0e, 0x11, 0x01, 0x06, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02], '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e], '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e], '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0], '.': [0, 0, 0, 0, 0, 0x0c, 0x0c], ',': [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0], '-': [0, 0, 0, 0x0e, 0, 0, 0], ':': [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ';': [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08], '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04], '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02], ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '%': [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03], '+': [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d], '$': [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
};

function textW(str, s) { return str.length * 6 * s - s; }
function drawText(x, y, str, s, col) {
  const up = str.toUpperCase();
  for (let n = 0; n < up.length; n++) {
    const glyph = FONT[up[n]] || FONT['?'];
    for (let row = 0; row < 7; row++)
      for (let bit = 0; bit < 5; bit++)
        if (glyph[row] & (1 << (4 - bit)))
          rect(x + n * 6 * s + bit * s, y + row * s, s, s, col);
  }
}
function drawCentered(cx, y, str, s, col) { drawText(Math.round(cx - textW(str, s) / 2), y, str, s, col); }
function wrap(str, maxChars) {
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

// ---------- palette: a sober broadsheet ----------
const PAPER = [247, 243, 232];
const INK = [24, 28, 38];
const NAVY = [18, 38, 74];
const GOLD = [198, 152, 46];
const RED = [166, 32, 40];
const GREY = [92, 96, 104];
const CARD = [255, 253, 247];
const RULE = [196, 188, 168];

// ---------- the day's news, as reported on 26 November 2026 ----------
// Each item was verified against the named outlet's 26 Nov 2026 reporting
// before being written into this program; see README.md for the source list.
const LEAD = {
  tag: 'INDONESIA', tagCol: RED,
  head: 'MINE RESCUE IN WEST JAVA',
  body: 'Rescuers resume the search for 13 workers trapped in an illegal gold mine in West Java, with 13 already confirmed dead, authorities said.',
  src: 'REUTERS, 26 NOV 2026',
};
const STORIES = [
  {
    tag: 'SOUTH KOREA', tagCol: NAVY,
    head: 'KOREA RAISES RATES',
    body: 'The Bank of Korea raised its base rate 25 basis points to 3.25 percent, highest since November 2024, as an AI-fuelled export boom keeps inflation above target.',
    src: 'REUTERS',
  },
  {
    tag: 'TRADE', tagCol: GOLD,
    head: 'US TARIFFS: 14 PARTNERS',
    body: 'Washington proposed new tariffs on imports from 14 major partners, including China, Japan and the EU. Asian shares bounced; AI and inflation worries lingered.',
    src: 'REUTERS / ECONOMIC TIMES',
  },
  {
    tag: 'NORTH KOREA', tagCol: RED,
    head: 'KIM: NUCLEAR OPTIONS',
    body: 'Kim Jong Un called for diversified use of tactical nuclear weapons, and Pyongyang expelled the head of the Swiss diplomatic office over sanctions.',
    src: 'AFP VIA MANILA TIMES',
  },
  {
    tag: 'UNITED STATES', tagCol: NAVY,
    head: 'NY PARADE POSTPONED',
    body: 'New York postponed its Thanksgiving parade to Saturday 28 November over a major storm, as king tides battered California and travellers faced long lines.',
    src: 'AP / ECONOMIC TIMES',
  },
  {
    tag: 'HONG KONG', tagCol: GOLD,
    head: 'FIRE ANNIVERSARY MARKED',
    body: 'Hong Kong warned against disorder on the first anniversary of the Tai Po fire, which killed 168, as residents marked a year of grief and inquiry.',
    src: 'BANGKOK POST / SCMP',
  },
  {
    tag: 'SPAIN', tagCol: RED,
    head: 'RECORD CANARY ARRIVALS',
    body: 'Nearly 2,000 migrants reached Spain\'s Canary Islands in a record single-day arrival, on the Atlantic route from West Africa.',
    src: 'MANILA TIMES',
  },
];

// ---------- composition ----------
rect(0, 0, W, H, PAPER);

// Masthead
rect(0, 0, W, 150, NAVY);
rect(0, 150, W, 6, GOLD);
drawCentered(W / 2, 16, 'THE WORLD IN ONE IMAGE', 2, [240, 220, 170]);
drawCentered(W / 2, 44, 'WORLD NEWS', 9, [250, 248, 240]);
drawCentered(W / 2, 118, 'THURSDAY 26 NOVEMBER 2026', 3, [250, 248, 240]);

// Lead story card
function card(x, y, w, h, item, headScale, bodyChars) {
  rect(x, y, w, h, CARD);
  rect(x, y, w, 4, item.tagCol);
  rect(x, y + h - 4, w, 4, RULE);
  drawText(x + 18, y + 14, item.tag, 2, item.tagCol);
  let cy = y + 40;
  for (const line of wrap(item.head, Math.floor((w - 36) / (6 * headScale)))) {
    drawText(x + 18, cy, line, headScale, INK);
    cy += 8 * headScale + 4;
  }
  cy += 4;
  for (const line of wrap(item.body, Math.floor((w - 36) / 12))) {
    drawText(x + 18, cy, line, 2, [52, 56, 66]);
    cy += 17;
  }
  drawText(x + 18, y + h - 26, 'SOURCE: ' + item.src, 1, GREY);
}

card(36, 172, 952, 138, LEAD, 4, 82);
circle(952, 205, 13, RED);
drawCentered(952, 198, '1', 2, [255, 255, 255]);

// Six story cards, two columns by three rows
const colX = [36, 518];
const colW = 470;
const rowY = [326, 544, 762];
const rowH = 204;
STORIES.forEach((item, i) => {
  const x = colX[i % 2];
  const y = rowY[Math.floor(i / 2)];
  card(x, y, colW, rowH, item, 3, 40);
});

// Footer
hline(36, 982, 952, RULE, 2);
drawCentered(W / 2, 992, 'ONE DAY, SEVEN STORIES, AS REPORTED ON 26 NOV 2026 - SOURCES IN EACH PANEL', 1, GREY);

// ---------- write out ----------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG(px));
