/* Three-view 2D organ involvement map. Stylised anatomy: positions are
   schematic and individual anatomy varies. Landmarks on the 240 x 400 grid:
   crown 7, chin 58, shoulder 86, nipple 107, waist 150, groin 214,
   knee 286, ankle 372. */
(() => {
  'use strict';

  const LAB = Object.assign({}, OL, { nerves: 'Peripheral nerves' });

  const e = (cx, cy, rx, ry, rot) =>
    `<ellipse cx='${cx}' cy='${cy}' rx='${rx}' ry='${ry}'${rot ? ` transform='rotate(${rot} ${cx} ${cy})'` : ''}/>`;
  const p = (d, cls) => `<path class='${cls || ''}' d='${d}'/>`;
  const l = d => `<path class='l' d='${d}'/>`;
  const mir = d => `<path d='${d}' transform='translate(240 0) scale(-1 1)'/>`;
  const mirl = d => `<path class='l' d='${d}' transform='translate(240 0) scale(-1 1)'/>`;
  const dots = pts => pts.map(q => `<circle cx='${q[0]}' cy='${q[1]}' r='2.4'/>`).join('');

  /* ---------------- body outlines ---------------- */
  const HEAD = 'M120 7C110 7 103 11 101 19C99 26 100 35 103 42C105 47 108 50 110 54C111 56 113 58 116 58L124 58C127 58 129 56 130 54C132 50 135 47 137 42C140 35 141 26 139 19C137 11 130 7 120 7Z';
  const TORSO = 'M110 52L110 62C110 68 106 72 100 75C90 78 84 82 82 88C80 94 79 102 80 110C81 120 83 130 85 140C86 150 86 158 86 164C86 174 84 184 83 192C82 200 84 206 88 210C92 213 96 214 100 214L140 214C144 214 148 213 152 210C156 206 158 200 157 192C156 184 154 174 154 164C154 158 154 150 155 140C157 130 159 120 160 110C161 102 160 94 158 88C156 82 150 78 140 75C134 72 130 68 130 62L130 52Z';
  const ARM = 'M63 196C62 202 63 208 67 212C71 216 76 216 79 212C82 208 82 202 81 196C80 180 80 166 81 152C84 136 89 118 93 102C95 95 96 91 96 89C96 83 92 80 86 80C78 80 72 88 70 100C68 112 66 128 65 144C64 160 63 180 63 196Z';
  const LEG = 'M92 204C92 220 93 236 94 250C95 264 96 274 97 284C98 294 97 302 96 312C96 324 97 338 99 350C100 358 100 366 101 372L111 372C111 364 111 354 111 344C112 332 112 320 112 306C113 292 113 278 112 264C112 250 112 236 113 220C113 212 113 208 113 204Z';
  const FOOT = 'M100 371c-2 4-3 8-3 11 0 4 3 6 7 6s7-2 7-6c0-3-1-7-3-11Z';
  const HAND = 'M66 208c-3 5-4 11-2 15 1 3 4 4 9 4s8-1 9-4c2-4 1-10-2-15Z';
  const FRONT = `<g class='bd'>${p(ARM)}${p(HAND)}${mir(ARM)}${mir(HAND)}${p(LEG)}${mir(LEG)}${p(FOOT)}${mir(FOOT)}${p(TORSO)}${p(HEAD)}</g>`;

  const SIDE = 'M118 6C108 6 100 10 98 18C96 24 96 30 98 35C100 38 99 40 96 43C93 45 92 47 95 49C97 50 98 52 96 54C94 56 95 59 99 61C103 63 108 63 111 61C113 64 113 68 112 71C108 74 104 78 101 84C98 92 97 100 97 108C97 116 98 124 100 132C101 142 102 152 103 162C104 172 105 182 107 192C108 200 109 206 109 210C109 213 111 215 115 215L133 213C137 212 141 210 143 206C145 200 146 192 146 184C145 172 143 160 142 148C142 138 143 128 144 118C145 108 146 98 145 88C144 80 141 74 137 70C135 64 133 60 132 55C131 50 132 46 134 42C138 36 139 28 137 21C135 12 128 6 118 6Z';
  const SARM = 'M124 88C116 90 110 96 108 106C106 120 105 138 105 154C105 172 106 190 108 204C109 210 111 215 115 218L127 216C126 208 125 198 124 186C123 170 123 154 124 138C125 122 126 104 124 88Z';
  const SLEG = 'M118 214C112 228 108 244 107 260C106 276 107 290 109 302C111 314 112 328 114 340C115 352 116 362 116 370L130 370C130 362 129 352 128 340C127 326 126 312 126 298C126 284 127 268 128 252C129 238 130 226 130 214Z';
  const SFOOT = 'M117 366c-2 6-6 11-11 15-2 1-2 4 1 4h21c2 0 3-2 2-4-3-4-4-9-4-15Z';
  const SHAND = 'M108 214c-3 6-3 12-1 15 2 2 4 3 7 3s6-1 7-3c2-3 2-9-1-15Z';
  const SIDE_FIG = `<g class='bd'>${p(SLEG)}${p(SFOOT)}${p(SIDE)}${p(SARM)}${p(SHAND)}</g>`;

  /* ---------------- organ shapes ---------------- */
  const SV = { ant: {}, lat: {} };
  const put = (view, key, svg) => { (SV[view][key] = SV[view][key] || []).push(svg); };

  /* anterior */
  put('ant', 'skull', p(HEAD));
  put('ant', 'brain', p('M120 14c-11 0-17 7-17 15 0 8 4 14 11 16v-5c-4-2-6-6-6-11 0-6 4-10 12-10s12 4 12 10c0 5-2 9-6 11v5c7-2 11-8 11-16 0-8-6-15-17-15Z'));
  put('ant', 'brain', l('M120 14v31M113 18q3 4 0 8M127 18q-3 4 0 8M109 32q3 2 3 6M131 32q-3 2-3 6'));
  put('ant', 'pituitary', e(120, 40, 3.4, 2.6));
  put('ant', 'eyes', e(109, 29, 3.8, 2.2) + e(131, 29, 3.8, 2.2));
  put('ant', 'nose', p('M120 31l-2.6 9q2.6 1.6 5.2 0Z'));
  put('ant', 'mouth', l('M112 48q8 4 16 0'));
  put('ant', 'ear', l('M100 26q-4 2-3 7t4 5') + mirl('M100 26q-4 2-3 7t4 5'));
  put('ant', 'throat', e(114, 57, 3, 2.4) + e(126, 57, 3, 2.4));
  put('ant', 'thyroid', p('M112 62c-5 1-6 5-2 7 4 1 8-2 10-4 2 2 6 5 10 4 4-2 3-6-2-7-3-1-6 1-8 3-2-2-5-4-8-3Z'));
  put('ant', 'trachea', l('M120 56v20') + l('M116 62h8M116 68h8M116 74h8'));
  put('ant', 'esophagus', p('M120 58v86', 'l'));
  put('ant', 'clavicle', l('M104 83q8-5 16-2M136 83q-8-5-16-2'));
  put('ant', 'ribs', l('M96 92q24-6 48 0M95 103q25-6 50 0M95 114q25-5 50 0M95 125q25-5 50 0M97 136q23-4 46 0'));
  put('ant', 'lungs', p('M112 78c-8 1-13 7-15 16l-4 28c-1 8 2 13 8 14 6 1 10-3 12-10l3-22V82Z'));
  put('ant', 'lungs', mir('M112 78c-8 1-13 7-15 16l-4 28c-1 8 2 13 8 14 6 1 10-3 12-10l3-22V82Z'));
  put('ant', 'lungs', l('M120 62v28M120 90l-9 7M120 90l9 7'));
  put('ant', 'heart', p('M128 90c-9 1-14 8-12 17 2 9 9 17 18 24 7-6 12-13 13-21 1-9-6-19-19-20Z'));
  put('ant', 'heart', l('M126 98q3 6 0 12'));
  put('ant', 'diaphragm', p('M80 148q40-18 80 0', 'l'));
  put('ant', 'liver', p('M86 150c5-8 20-11 31-7 9 3 15 8 15 14 0 5-6 8-14 8-12 0-24-3-31-8-3-2-3-5-1-7Z'));
  put('ant', 'gallbladder', p('M100 169q-3 5 0 8 5-2 4-8Z'));
  put('ant', 'stomach', p('M133 148c8-2 14 2 16 8 2 8-2 15-9 17-6 2-11-1-11-7 0-4 3-7 3-11 0-4-1-5 1-7Z'));
  put('ant', 'pancreas', p('M101 179c10-5 22-6 33-2 4 2 5 5 1 6-11 3-24 2-34 0-4-1-4-3 0-4Z'));
  put('ant', 'spleen', p('M145 149c7-3 11 3 11 10 0 7-4 11-9 10-5-1-8-7-7-13 1-3 2-5 5-7Z'));
  put('ant', 'kidneys', p('M111 164c-7 0-12 6-12 14 0 7 5 13 11 12 3 0 4-3 3-6-1-3-1-5 0-7 1-2 1-5 0-7-1-4-1-6-2-6Z'));
  put('ant', 'kidneys', mir('M111 164c-7 0-12 6-12 14 0 7 5 13 11 12 3 0 4-3 3-6-1-3-1-5 0-7 1-2 1-5 0-7-1-4-1-6-2-6Z'));
  put('ant', 'adrenal', p('M100 159l10 0-5 8Z') + mir('M100 159l10 0-5 8Z'));
  put('ant', 'intestine', l('M107 183q13-6 26 0t3 11q-9 6-21 0t-8-11ZM104 197q17 6 33 0t3 11q-16 6-35 0Z'));
  put('ant', 'sintestine', l('M111 184q9-5 18 0t0 9q-9 4-18 0t0-9ZM109 197q11 5 22 0t0 10q-11 4-22 0t0-10Z'));
  put('ant', 'colon', p('M100 202V182q0-2 2-2h36q2 0 2 2v20', 'l'));
  put('ant', 'appendix', l('M100 199q-5 7-2 13'));
  put('ant', 'rectum', p('M120 199v13', 'l'));
  put('ant', 'bladder', p('M111 195q0 9 9 11 9-2 9-11-9-5-18 0Z'));
  put('ant', 'ureters', l('M104 190q-2 10 9 12M136 190q2 10-9 12'));
  put('ant', 'uterus', p('M113 193q7-4 14 0l-2 10q-5 3-10 0Z'));
  put('ant', 'ovaries', e(106, 192, 3.2, 2.6) + e(134, 192, 3.2, 2.6));
  put('ant', 'vagina', p('M120 204v9', 'l'));
  put('ant', 'prostate', e(120, 205, 4.6, 3.2));
  put('ant', 'penis', p('M120 207v12', 'l') + e(120, 221, 2.8, 3.2));
  put('ant', 'testes', e(115, 226, 2.8, 3.2) + e(125, 226, 2.8, 3.2));
  put('ant', 'breast', p('M105 104q-8 4-6 11 7 3 11-3M135 104q8 4 6 11-7 3-11-3'));
  put('ant', 'shoulder', e(86, 86, 5, 5) + e(154, 86, 5, 5));
  put('ant', 'humerus', l('M86 90l-8 50') + mirl('M86 90l-8 50'));
  put('ant', 'forearm', l('M78 144l-5 48') + mirl('M78 144l-5 48'));
  put('ant', 'hand', p('M70 198q-4 8 1 13 5 3 8 0 3-4 1-13Z') + mir('M70 198q-4 8 1 13 5 3 8 0 3-4 1-13Z'));
  put('ant', 'pelvis', p('M101 197q-8 6-2 14h42q6-8-2-14Z'));
  put('ant', 'hip', e(104, 205, 4.2, 4.2) + e(136, 205, 4.2, 4.2));
  put('ant', 'femur', l('M104 209l-1 68') + mirl('M104 209l-1 68'));
  put('ant', 'knee', e(103, 282, 4.6, 4.6) + e(137, 282, 4.6, 4.6));
  put('ant', 'tibia', l('M103 287v74') + mirl('M103 287v74'));
  put('ant', 'foot', p('M99 360q-6 6-3 14h14q1-8-2-14Z') + mir('M99 360q-6 6-3 14h14q1-8-2-14Z'));
  put('ant', 'muscle', p('M90 92q22-7 30 5-13 9-30 3ZM150 92q-22-7-30 5 13 9 30 3ZM80 100q8 16 5 32-7-14-10-28ZM160 100q-8 16-5 32 7-14 10-28ZM98 212q10-4 15 0-2 24-4 46h-8ZM142 212q-10-4-15 0 2 24 4 46h8Z'));
  put('ant', 'skin', p(HEAD, 'l') + p(TORSO, 'l'));
  put('ant', 'lymph', dots([[110, 68], [130, 68], [92, 100], [148, 100], [104, 214], [136, 214], [112, 236], [128, 236]]));
  put('ant', 'blood', l('M120 84v122M120 120l-24 30M120 120l24 30M120 160l-22 44M120 160l22 44M120 206l-14 62M120 206l14 62'));
  put('ant', 'bone', l('M104 83q8-5 16-2M136 83q-8-5-16-2M96 92q24-6 48 0M95 114q25-5 50 0M97 136q23-4 46 0M86 90l-8 50M154 90l8 50M78 144l-5 48M162 144l4 48M104 209l-1 68M136 209l1 68M103 287v74M137 287v74'));
  put('ant', 'nerves', l('M120 108v96M120 132l-26 34M120 132l26 34M120 176l-22 40M120 176l22 40M90 166l-8 40M150 166l8 40'));

  /* lateral (facing left) */
  put('lat', 'skull', p(SIDE));
  put('lat', 'brain', p('M122 13c-12 0-19 7-19 16 0 9 7 15 18 15 11 0 18-6 18-15 0-9-7-16-17-16Z') + l('M108 23q8-4 16 0M110 32q7 3 14 0'));
  put('lat', 'pituitary', e(112, 38, 3.4, 2.6));
  put('lat', 'nose', p('M98 32l-5 9 6 3'));
  put('lat', 'mouth', l('M102 50q5 3 9 1'));
  put('lat', 'ear', p('M124 26q6 4 3 11', 'l'));
  put('lat', 'throat', l('M110 56q6 5 13 3'));
  put('lat', 'thyroid', p('M108 62q7-2 10 4 4-5 9-3-2 7-9 6-6-1-10-7Z'));
  put('lat', 'trachea', l('M114 55v20M110 61l8 2M110 67l8 2'));
  put('lat', 'esophagus', p('M117 58v86', 'l'));
  put('lat', 'lungs', p('M114 78c-8 2-13 10-13 20v22c0 8 4 12 10 11 5-1 8-6 9-13l3-24Z'));
  put('lat', 'heart', p('M108 100c-7 3-9 11-5 18 3 6 7 11 12 15 4-5 6-11 5-18-1-8-5-14-12-15Z'));
  put('lat', 'diaphragm', p('M95 150q20-12 40-2', 'l'));
  put('lat', 'liver', p('M116 148c-8 1-12 6-11 13 1 7 6 11 13 11 7 0 10-4 9-10-1-7-5-12-11-14Z'));
  put('lat', 'gallbladder', p('M112 170q-4 5 0 9 4-2 4-9Z'));
  put('lat', 'stomach', p('M118 148c7-3 13 0 15 6 2 7-1 14-7 16-5 2-10-1-11-7-1-5 2-8 3-15Z'));
  put('lat', 'pancreas', p('M100 178q12-6 24 0 4 2 0 5-12 4-24 0-3-2 0-5Z'));
  put('lat', 'spleen', p('M128 152c5-2 8 2 8 7s-3 9-7 8-6-5-5-9c0-3 1-5 4-6Z'));
  put('lat', 'kidneys', p('M126 166c-5 0-7 5-6 11 1 5 4 8 7 7 3-1 4-5 3-10-1-5-2-8-4-8Z'));
  put('lat', 'adrenal', p('M124 162l6 0-3 5Z'));
  put('lat', 'intestine', l('M104 184q14-6 24 2t0 13q-12 4-20-2ZM110 202q12 4 20-1t2 10q-10 4-20 0'));
  put('lat', 'sintestine', l('M106 186q12-5 20 1t-2 10q-10 4-18-1t0-10Z'));
  put('lat', 'colon', p('M106 202q-2-14 3-22 4-5 11-5h12', 'l'));
  put('lat', 'rectum', p('M124 200v14q0 6-6 8', 'l'));
  put('lat', 'bladder', p('M109 194q0 8 8 10 8-2 8-10-8-5-16 0Z'));
  put('lat', 'uterus', p('M109 190q6-4 12 0l-2 9q-4 3-8 0Z'));
  put('lat', 'ovaries', e(118, 192, 3.2, 2.6));
  put('lat', 'vagina', p('M114 200v8', 'l'));
  put('lat', 'prostate', e(112, 204, 4.6, 3.2));
  put('lat', 'penis', p('M104 202q-7 2-8 8', 'l'));
  put('lat', 'testes', e(99, 214, 3.2, 3.6));
  put('lat', 'breast', p('M103 102q-8 5-5 12 8 3 11-4'));
  put('lat', 'ribs', l('M96 92q13-6 24 0M95 106q14-6 26 0M95 120q14-5 26 0M97 134q13-4 24 0'));
  put('lat', 'clavicle', l('M104 84q12-4 22 0'));
  put('lat', 'spine', l('M134 60q3 78-1 148') + dots([[134, 70], [134, 88], [133, 106], [133, 124], [132, 142], [132, 160], [131, 178], [131, 194]]));
  put('lat', 'spinalcord', p('M133 66q3 76-1 142', 'l'));
  put('lat', 'shoulder', e(118, 84, 5, 5));
  put('lat', 'humerus', p('M118 88q5 28 3 54', 'l'));
  put('lat', 'forearm', p('M121 142q5 26 2 48', 'l'));
  put('lat', 'hand', p('M123 192q-2 10 2 14 4-2 3-12Z'));
  put('lat', 'pelvis', p('M112 196q8-4 26 0l-2 12h-22Z'));
  put('lat', 'hip', e(118, 204, 4.2, 4.2));
  put('lat', 'femur', p('M118 210q0 34 0 68', 'l'));
  put('lat', 'knee', e(118, 284, 4.6, 4.6));
  put('lat', 'tibia', p('M118 289v70', 'l'));
  put('lat', 'foot', p('M111 360q-10 4-10 11h18q2-7-2-12Z'));
  put('lat', 'muscle', p('M104 86q11-6 20 6-8 8-18 4ZM106 104q10 14 8 30-8-12-12-26ZM116 210q-6 26-4 52h8q0-26 4-52ZM112 148q8 20 6 42-8-18-10-38Z'));
  put('lat', 'skin', p(SIDE, 'l'));
  put('lat', 'lymph', dots([[116, 70], [108, 96], [102, 124], [116, 206], [120, 228]]));
  put('lat', 'blood', l('M112 86v118M112 132q-8 24-2 48M112 174q10 28 6 52'));
  put('lat', 'bone', l('M134 60q3 78-1 148M96 92q13-6 24 0M95 120q14-5 26 0M118 88q5 28 3 54M121 142q5 26 2 48M112 208q-1 34 0 66M112 287q-1 36 0 72M104 84q12-4 22 0'));
  put('lat', 'nerves', l('M120 112q2 44 4 72M126 140q-10 18-18 32M126 176q-12 20-16 38'));

  const VIEWS = [['ant', 'Anterior'], ['lat', 'Lateral']];
  const VTITLE = { ant: 'Anterior (front)', lat: 'Lateral (side)' };

  const clean = list => (Array.isArray(list) ? list : []).filter(k => typeof k === 'string' && LAB[k]).slice(0, 24);
  const nameOf = k => LAB[k] || k;

  function figHTML(id, view) {
    const inv = INV[id] || [[], []];
    const prim = clean(inv[0]);
    const seco = clean(inv[1]).filter(k => !prim.includes(k));
    const map = SV[view] || {};
    const keys = Object.keys(map);
    const inView = keys.filter(k => prim.includes(k) || seco.includes(k));
    const outView = [...prim, ...seco].filter(k => !keys.includes(k));
    const build = cls => keys.filter(k => (cls === 'p1' ? prim : seco).includes(k))
      .map(k => `<g class='ov ${cls}' data-org='${k}'><title>${DA.esc(nameOf(k))}</title>${[].concat(map[k]).join('')}</g>`).join('');
    const body = view === 'lat' ? SIDE_FIG : FRONT;
    return `<svg viewBox='0 0 240 400' class='ovfig ${view}' role='img' aria-label='${DA.attr(VTITLE[view])} organ map for ${DA.attr(get(id) ? get(id).n : id)}'>${body}<g>${build('p1')}${build('s2')}</g></svg>${outView.length ? `<p class='note ovmiss'>Not shown in this view: ${outView.map(k => nameOf(k)).join(', ')}.</p>` : ''}${!inView.length ? `<p class='note ovmiss'>This entry's organ link is still being reviewed.</p>` : ''}`;
  }

  const legendHTML = id => {
    const inv = INV[id] || [[], []];
    const prim = clean(inv[0]);
    const seco = clean(inv[1]).filter(k => !prim.includes(k));
    if (!prim.length && !seco.length) return '';
    const row = (k, c, t) => `<button type='button' class='ovlk ${c}' data-org='${k}'><i></i><span>${DA.esc(nameOf(k))}</span><small>${t}</small></button>`;
    return `<div class='ovleg'><div class='ovlgh'><span class='ovkey p1'></span><b>Primary</b><span class='ovkey s2'></span><b>Secondary or complication</b></div>${prim.map(k => row(k, 'p1', 'Primary')).join('')}${seco.map(k => row(k, 's2', 'Secondary')).join('')}</div>`;
  };

  function vis(d) {
    const [p, s] = INV[d.id] || [[], []];
    const og = ORGM[d.id], ho = HOST[d.id];
    const nop = !clean(p).length && !clean(s).length;
    const involved = [...clean(p), ...clean(s)];
    const first = ['ant', 'lat'].find(v => involved.some(k => (SV[v] || {})[k])) || 'ant';
    return `<div class='sec ovs' data-ovd='${DA.attr(d.id)}'><h2>${I('body')} Organ involvement overview</h2>
      <p class='note ovint'>Choose a view. Highlighted structures show the main site of disease and the organs affected later or by complications.</p>
      <div class='ovtabs' role='group' aria-label='Organ map view'>${VIEWS.map(([k, n]) => `<button type='button' data-ov='${k}' class='${k === first ? 'on' : ''}' aria-pressed='${k === first ? 'true' : 'false'}'>${n}</button>`).join('')}</div>
      <div class='ovbody'><div class='ovstage' id='ovstage'>${figHTML(d.id, first)}</div><div class='ovside'>${legendHTML(d.id)}${nop ? `<p class='note'>No organ mapping has been recorded for this entry yet.</p>` : ''}</div></div>
      ${og || ho ? o3b(d, og, ho) : ''}
      <p class='note'>This map is for educational purposes only and may not be anatomically accurate. Relative positions are simplified and real anatomy varies between people.</p></div>`;
  }

  function focus(stage, key, sec) {
    const groups = stage.querySelectorAll('.ov[data-org]');
    const on = !!key && !stage.classList.contains('focus-' + key);
    groups.forEach(g => g.classList.toggle('dim', on && g.dataset.org !== key));
    stage.className = 'ovstage' + (on ? ' focus-' + key : '');
    sec.querySelectorAll('.ovlk').forEach(b => b.classList.toggle('on', on && b.dataset.org === key));
  }

  document.addEventListener('click', ev => {
    const tab = ev.target.closest('[data-ov]');
    const lk = ev.target.closest('.ovlk');
    if (!tab && !lk) return;
    const sec = ev.target.closest('.ovs');
    if (!sec) return;
    const stage = sec.querySelector('#ovstage');
    if (!stage) return;
    if (tab) {
      sec.querySelectorAll('[data-ov]').forEach(b => {
        const on = b === tab;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      stage.innerHTML = figHTML(sec.dataset.ovd, tab.dataset.ov);
      stage.className = 'ovstage';
      sec.querySelectorAll('.ovlk').forEach(b => b.classList.remove('on'));
      return;
    }
    focus(stage, lk.dataset.org, sec);
  });

  /* shared body used by the advanced-search organ picker */
  const PICK = {
    spine: l('M120 60v150') + dots([[120, 70], [120, 82], [120, 94], [120, 106], [120, 118], [120, 130], [120, 142], [120, 154], [120, 166], [120, 178], [120, 190], [120, 202]]),
    spinalcord: p('M120 64v142', 'l')
  };
  const has = k => !!(SV.ant[k] || PICK[k]);
  const PORDER = ['skin', 'muscle', 'bone', 'blood', 'lymph', 'nerves', 'spine', 'spinalcord', 'ribs', 'clavicle', 'pelvis', 'shoulder', 'hip', 'knee', 'humerus', 'forearm', 'hand', 'femur', 'tibia', 'foot', 'colon', 'sintestine', 'diaphragm'];

  function pickSVG(ks, view) {
    const map = SV[view] || {};
    const extra = view === 'ant' ? PICK : {};
    const draw = k => [].concat(map[k] || extra[k] || []);
    const order = [...PORDER.filter(k => ks.includes(k)), ...ks.filter(k => !PORDER.includes(k))];
    const shapes = order.filter(k => draw(k).length).map(k => `<g class='apko' data-o='${k}'><title>${DA.esc(nameOf(k))}</title>${draw(k).join('')}</g>`).join('');
    const body = view === 'lat' ? SIDE_FIG : FRONT;
    return `<svg viewBox='0 0 240 400' class='hm apk' role='img' aria-label='Body map: choose an organ or body part'>${body}<g>${shapes}</g></svg>`;
  }

  function picker(keys, cls) {
    const ks = (Array.isArray(keys) ? keys : []).filter(has);
    return `<div class='ovpick ${cls || ''}'><div class='ovtabs pktabs' role='group' aria-label='Body map view'>${VIEWS.map(([k, n]) => `<button type='button' data-pkv='${k}' class='${k === 'ant' ? 'on' : ''}' aria-pressed='${k === 'ant' ? 'true' : 'false'}'>${n}</button>`).join('')}</div><div class='pkstage' data-keys='${DA.attr(ks.join(','))}'>${pickSVG(ks, 'ant')}</div></div>`;
  }

  document.addEventListener('click', ev => {
    const tab = ev.target.closest('[data-pkv]');
    if (!tab) return;
    const wrap = tab.closest('.ovpick');
    if (!wrap) return;
    wrap.querySelectorAll('[data-pkv]').forEach(b => {
      const on = b === tab;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const stage = wrap.querySelector('.pkstage');
    stage.innerHTML = pickSVG(stage.dataset.keys.split(',').filter(Boolean), tab.dataset.pkv);
  });

  window.vis = vis;
  DA.organViews = { figHTML, clean, picker, has };
})();
