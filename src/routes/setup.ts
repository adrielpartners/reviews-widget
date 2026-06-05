// src/routes/setup.ts
// Serves the embed code generator setup page with live preview and color customization.

import { CORS_HEADERS } from "../lib/envelopes";

export function handleSetup(): Response {
  return new Response(SETUP_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
      ...CORS_HEADERS,
    },
  });
}

const SETUP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reviews Widget — Setup</title>
<script src="/widget.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6;min-height:100vh}
.wrap{max-width:820px;margin:0 auto;padding:2rem 1.5rem 4rem}
h1{font-size:1.75rem;font-weight:800;margin-bottom:0.25rem;color:#0f172a}
.sub{color:#64748b;margin-bottom:2rem;font-size:0.95rem}
.card{background:#fff;border-radius:1rem;border:1px solid #e2e8f0;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.card>h2{font-size:1.1rem;font-weight:700;margin-bottom:1rem;color:#0f172a}
.row{margin-bottom:1rem}
.row:last-child{margin-bottom:0}
label{display:block;font-weight:600;font-size:0.875rem;margin-bottom:0.375rem;color:#334155}
.req{color:#ef4444}
input[type=text],input[type=number],select{width:100%;padding:0.625rem 0.875rem;border:1px solid #cbd5e1;border-radius:0.5rem;font-size:0.9375rem;background:#fff;color:#1e293b;transition:border-color 0.15s,box-shadow 0.15s}
input:focus,select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
select{cursor:pointer}
.hint{font-size:0.75rem;color:#94a3b8;margin-top:0.25rem}
.hint a{color:#3b82f6}
.radio-group{display:flex;gap:1.5rem}
.radio-group label{display:flex;align-items:center;gap:0.375rem;font-weight:400;cursor:pointer;font-size:0.9375rem;margin-bottom:0}
.radio-group input{width:auto}
pre{background:#0f172a;color:#e2e8f0;padding:1rem 3.5rem 1rem 1.25rem;border-radius:0.75rem;font-size:0.8125rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;word-break:break-all;position:relative}
.copy-btn{position:absolute;top:0.625rem;right:0.625rem;background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:0.4rem 1rem;border-radius:0.5rem;font-size:0.8125rem;cursor:pointer;transition:all 0.15s}
.copy-btn:hover{background:#334155}
.copy-btn.copied{background:#16a34a;border-color:#16a34a}
.hidden{display:none!important}
.preview-label{font-size:0.875rem;font-weight:600;color:#334155;margin-bottom:0.75rem}
.preview-area{background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:0.75rem;padding:1.5rem;min-height:200px;overflow:hidden;position:relative}
.preview-empty{color:#94a3b8;font-style:italic}
.preview-loading{color:#64748b;font-style:italic;font-size:0.875rem}

/* Color grid */
.color-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.75rem;margin-top:0.5rem}
.color-item{border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.625rem;text-align:center;transition:border-color 0.15s}
.color-item:hover{border-color:#93c5fd}
.color-item label{font-size:0.6875rem;font-weight:600;color:#64748b;margin-bottom:0.375rem;text-transform:uppercase;letter-spacing:0.02em}
.color-item input[type=color]{width:100%;height:2.5rem;border-radius:0.375rem;border:1px solid #e2e8f0;cursor:pointer;padding:0;background:none}
.color-item input[type=color]::-webkit-color-swatch-wrapper{padding:0}
.color-item input[type=color]::-webkit-color-swatch{border:1px solid #cbd5e1;border-radius:0.25rem}
.color-reset-row{display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem}
.reset-colors-btn{background:#f1f5f9;border:1px solid #e2e8f0;padding:0.375rem 1rem;border-radius:0.5rem;font-size:0.8125rem;cursor:pointer;color:#475569;transition:all 0.15s;white-space:nowrap}
.reset-colors-btn:hover{background:#e2e8f0;color:#1e293b}
.swatch-preview{display:flex;gap:2px;align-items:center;flex-wrap:wrap}
.swatch-dot{width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.08)}

/* Font controls */
.font-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0.75rem}
.font-item{border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.625rem;text-align:center;transition:border-color 0.15s}
.font-item:hover{border-color:#93c5fd}
.font-item label{font-size:0.6875rem;font-weight:600;color:#64748b;margin-bottom:0.375rem;text-transform:uppercase;letter-spacing:0.02em;display:block}
.font-item select{width:100%;padding:0.375rem 0.5rem;border:1px solid #cbd5e1;border-radius:0.375rem;font-size:0.8125rem;background:#fff;color:#1e293b;cursor:pointer}
.font-item select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
</style>
</head>
<body>
<div class="wrap">
<h1>⭐ Reviews Widget Setup</h1>
<p class="sub">Fill in your options and customize colors — the preview updates instantly. Copy the embed code when you're happy.</p>

<div class="card">
<h2>📍 Business</h2>
<div class="row">
<label>Google Place ID <span class="req">*</span></label>
<input type="text" id="placeId" placeholder="ChIJ868xVWE8eGERSxHj3eqaK5M">
<div class="hint">Find yours at <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener">Google Place ID Finder</a> — only needed for Live mode.</div>
</div>
</div>

<div class="card">
<h2>📡 Data Source</h2>
<div class="row">
<div class="radio-group">
<label><input type="radio" name="dataSource" value="demo" checked> 🎯 Demo <span style="font-weight:400;color:#64748b;font-size:0.812rem">(3 sample reviews)</span></label>
<label><input type="radio" name="dataSource" value="live"> 🌐 Live <span style="font-weight:400;color:#64748b;font-size:0.812rem">(requires Place ID)</span></label>
</div>
</div>
</div>

<div class="card">
<h2>🎛️ Display Options</h2>
<div class="row">
<label>Mode</label>
<div class="radio-group">
<label><input type="radio" name="mode" value="inline" checked> Inline</label>
<label><input type="radio" name="mode" value="flyout"> Flyout</label>
</div>
</div>
<div class="row" id="layoutRow">
<label>Layout</label>
<select id="layout"><option value="grid">Grid</option><option value="carousel">Carousel</option></select>
</div>
<div class="row hidden" id="positionRow">
<label>Position</label>
<select id="position"><option value="bottom-right">Bottom Right</option><option value="bottom-center">Bottom Center</option><option value="bottom-left">Bottom Left</option></select>
</div>
<div class="row">
<label>Theme</label>
<select id="theme">
<option value="default">Default</option>
<option value="modern">Modern</option>
<option value="professional">Professional</option>
<option value="pastel">Pastel</option>
</select>
</div>
<div class="row">
<label>Max Reviews</label>
<input type="number" id="maxReviews" value="5" min="1" max="20">
</div>
</div>

<div class="card">
<h2>🎨 Custom Colors</h2>
<p class="hint" style="margin-bottom:0.75rem">Pick exact colors — changes appear in the preview immediately. These override the selected theme.</p>
<div class="color-reset-row">
<span class="swatch-preview" id="swatchPreview"></span>
<button class="reset-colors-btn" id="resetColorsBtn" type="button">↺ Reset to theme</button>
</div>
<div class="color-grid" id="colorGrid"></div>
</div>

<div class="card">
<h2>🔤 Font Settings</h2>
<div class="row">
<label>Size Presets</label>
<div class="font-grid">
<div class="font-item">
<label>Headline</label>
<select id="fontSizeHeadline"><option value="">Default</option><option value="1rem">1rem</option><option value="1.25rem">1.25rem</option><option value="1.5rem">1.5rem</option><option value="1.75rem">1.75rem</option><option value="2rem">2rem</option><option value="2.25rem">2.25rem</option><option value="2.5rem">2.5rem</option></select>
</div>
<div class="font-item">
<label>Testimonial</label>
<select id="fontSizeTestimonial"><option value="">Default</option><option value="0.75rem">0.75rem</option><option value="0.875rem">0.875rem</option><option value="1rem">1rem</option><option value="1.125rem">1.125rem</option><option value="1.25rem">1.25rem</option><option value="1.5rem">1.5rem</option><option value="1.75rem">1.75rem</option></select>
</div>
<div class="font-item">
<label>Author</label>
<select id="fontSizeAuthor"><option value="">Default</option><option value="0.75rem">0.75rem</option><option value="0.875rem">0.875rem</option><option value="1rem">1rem</option><option value="1.125rem">1.125rem</option><option value="1.25rem">1.25rem</option><option value="1.5rem">1.5rem</option><option value="1.75rem">1.75rem</option></select>
</div>
<div class="font-item">
<label>Read More</label>
<select id="fontSizeReadMore"><option value="">Default</option><option value="0.625rem">0.625rem</option><option value="0.75rem">0.75rem</option><option value="0.875rem">0.875rem</option><option value="1rem">1rem</option><option value="1.125rem">1.125rem</option><option value="1.25rem">1.25rem</option><option value="1.5rem">1.5rem</option></select>
</div>
</div>
</div>
<div class="row">
<label>Font Families</label>
<div class="font-grid">
<div class="font-item">
<label>Headline Font</label>
<select id="fontFamilyHeadline">
<option value="">System UI</option>
<option value="Georgia, 'Times New Roman', serif">Georgia</option>
<option value="Palatino, 'Palatino Linotype', serif">Palatino</option>
<option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
<option value="Verdana, Geneva, sans-serif">Verdana</option>
</select>
</div>
<div class="font-item">
<label>Body Font</label>
<select id="fontFamilyBody">
<option value="">System UI</option>
<option value="Arial, Helvetica, sans-serif">Arial</option>
<option value="Georgia, 'Times New Roman', serif">Georgia</option>
<option value="Verdana, Geneva, sans-serif">Verdana</option>
<option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
</select>
</div>
</div>
</div>
</div>

<div class="card">
<h2>🔗 Call to Action <span style="font-weight:400;color:#94a3b8;font-size:0.812rem">(optional)</span></h2>
<div class="row">
<label>CTA Text</label>
<input type="text" id="ctaText" placeholder="Leave us a review">
</div>
<div class="row">
<label>CTA URL</label>
<input type="text" id="ctaUrl" placeholder="https://g.page/r/YOUR_PLACE/review">
<div class="hint">Link to your Google review page</div>
</div>
</div>

<div class="card">
<h2>👁️ Preview</h2>
<div class="preview-area" id="previewArea"><span class="preview-loading">Loading preview…</span></div>
</div>

<div class="card" style="position:relative">
<h2>📋 Embed Code</h2>
<pre id="embedOutput"></pre>
<button class="copy-btn" id="copyBtn">📋 Copy</button>
</div>
</div>

<script>
(function(){
'use strict';

// --- DOM refs ---
var pid    = document.getElementById('placeId');
var layout = document.getElementById('layout');
var position = document.getElementById('position');
var theme  = document.getElementById('theme');
var maxR   = document.getElementById('maxReviews');
var ctaT   = document.getElementById('ctaText');
var ctaU   = document.getElementById('ctaUrl');
var out    = document.getElementById('embedOutput');
var prev   = document.getElementById('previewArea');
var copyB  = document.getElementById('copyBtn');
var radios     = document.querySelectorAll('input[name=mode]');
var colorGrid  = document.getElementById('colorGrid');
var resetBtn   = document.getElementById('resetColorsBtn');
var swatchPrev = document.getElementById('swatchPreview');
var fSizeHeadline  = document.getElementById('fontSizeHeadline');
var fSizeTestimonial = document.getElementById('fontSizeTestimonial');
var fSizeAuthor    = document.getElementById('fontSizeAuthor');
var fSizeReadMore  = document.getElementById('fontSizeReadMore');
var fFamilyHeadline = document.getElementById('fontFamilyHeadline');
var fFamilyBody    = document.getElementById('fontFamilyBody');

// --- Color definitions ---
var COLOR_DEFS = [
  { id:'clrBg',           label:'Background',     cssVar:'--rw-color-bg',           key:'colorBg' },
  { id:'clrText',         label:'Text',            cssVar:'--rw-color-text',         key:'colorText' },
  { id:'clrTextSecondary',label:'Secondary Text',  cssVar:'--rw-color-text-secondary',key:'colorTextSecondary' },
  { id:'clrBorder',       label:'Border',          cssVar:'--rw-color-border',       key:'colorBorder' },
  { id:'clrStar',         label:'Star (filled)',   cssVar:'--rw-color-star',         key:'colorStar' },
  { id:'clrStarEmpty',    label:'Star (empty)',    cssVar:'--rw-color-star-empty',   key:'colorStarEmpty' },
  { id:'clrCtaBg',        label:'CTA Button',      cssVar:'--rw-color-cta-bg',       key:'colorCtaBg' },
  { id:'clrCtaText',      label:'CTA Text',        cssVar:'--rw-color-cta-text',     key:'colorCtaText' },
  { id:'clrCardBg',       label:'Card Background', cssVar:'--rw-color-card-bg',      key:'colorCardBg' }
];

// Theme color palettes (hex values matching tokens.js)
var THEME_COLORS = {
  default: {
    clrBg:'#ffffff', clrText:'#1a1a2e', clrTextSecondary:'#6b7280',
    clrBorder:'#e5e7eb', clrStar:'#f59e0b', clrStarEmpty:'#d1d5db',
    clrCtaBg:'#2563eb', clrCtaText:'#ffffff', clrCardBg:'#ffffff'
  },
  modern: {
    clrBg:'#0f172a', clrText:'#f1f5f9', clrTextSecondary:'#94a3b8',
    clrBorder:'#1e293b', clrStar:'#fbbf24', clrStarEmpty:'#334155',
    clrCtaBg:'#3b82f6', clrCtaText:'#ffffff', clrCardBg:'#1e293b'
  },
  professional: {
    clrBg:'#fafafa', clrText:'#2d3748', clrTextSecondary:'#718096',
    clrBorder:'#cbd5e0', clrStar:'#d69e2e', clrStarEmpty:'#e2e8f0',
    clrCtaBg:'#2b6cb0', clrCtaText:'#ffffff', clrCardBg:'#ffffff'
  },
  pastel: {
    clrBg:'#fef7f0', clrText:'#4a3728', clrTextSecondary:'#8b7355',
    clrBorder:'#e8ddd0', clrStar:'#f6ad55', clrStarEmpty:'#ddd0c0',
    clrCtaBg:'#ed8936', clrCtaText:'#ffffff', clrCardBg:'#ffffff'
  }
};

// --- Build color picker inputs ---
var colorInputs = {};
function buildColorGrid() {
  colorGrid.innerHTML = '';
  for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
    var def = COLOR_DEFS[ci];
    var div = document.createElement('div');
    div.className = 'color-item';
    var lbl = document.createElement('label');
    lbl.textContent = def.label;
    var inp = document.createElement('input');
    inp.type = 'color';
    inp.id = def.id;
    inp.value = '#ffffff';
    div.appendChild(lbl);
    div.appendChild(inp);
    colorGrid.appendChild(div);
    colorInputs[def.id] = inp;
    inp.addEventListener('input', updateAll);
  }
}
buildColorGrid();

// --- Apply theme colors to color pickers ---
function applyThemeColors(themeName) {
  var colors = THEME_COLORS[themeName] || THEME_COLORS.default;
  for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
    var def = COLOR_DEFS[ci];
    var inp = colorInputs[def.id];
    if (inp && colors[def.id]) inp.value = colors[def.id];
  }
  updateSwatchPreview();
  updateAll();
}

// --- Update swatch preview dots ---
function updateSwatchPreview() {
  swatchPrev.innerHTML = '';
  for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
    var def = COLOR_DEFS[ci];
    var inp = colorInputs[def.id];
    if (!inp) continue;
    var dot = document.createElement('span');
    dot.className = 'swatch-dot';
    dot.style.background = inp.value;
    dot.title = def.label + ': ' + inp.value;
    swatchPrev.appendChild(dot);
  }
}

// --- Build custom colors object ---
function getCustomColors() {
  var cc = {};
  for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
    var def = COLOR_DEFS[ci];
    var inp = colorInputs[def.id];
    if (inp) cc[def.key] = inp.value;
  }
  return cc;
}

// --- Check if custom colors differ from theme ---
function colorsDifferFromTheme(themeName) {
  var themeCols = THEME_COLORS[themeName] || THEME_COLORS.default;
  for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
    var def = COLOR_DEFS[ci];
    var inp = colorInputs[def.id];
    if (inp && inp.value.toLowerCase() !== (themeCols[def.id] || '').toLowerCase()) {
      return true;
    }
  }
  return false;
}

function getMode(){return document.querySelector('input[name=mode]:checked').value}
function getDataSource(){return document.querySelector('input[name=dataSource]:checked').value}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}

// --- Font settings helpers ---
function getFontSizes() {
  var sizes = {};
  if (fSizeHeadline.value) sizes.sizeHeadline = fSizeHeadline.value;
  if (fSizeTestimonial.value) sizes.sizeTestimonial = fSizeTestimonial.value;
  if (fSizeAuthor.value) sizes.sizeAuthor = fSizeAuthor.value;
  if (fSizeReadMore.value) sizes.sizeReadMore = fSizeReadMore.value;
  // Only return if at least one is set
  for (var k in sizes) return sizes;
  return null;
}
function getFontFamilies() {
  var families = {};
  if (fFamilyHeadline.value) families.fontFamilyHeadline = fFamilyHeadline.value;
  if (fFamilyBody.value) families.fontFamilyBody = fFamilyBody.value;
  for (var k in families) return families;
  return null;
}
function fontSettingsActive() {
  return getFontSizes() !== null || getFontFamilies() !== null;
}

// --- Demo review data (3 placeholder reviews) ---
var DEMO_REVIEWS = [
  {
    id: 'demo-1',
    authorName: 'Sarah M.',
    rating: 5,
    text: 'Absolutely love this place. The atmosphere is welcoming and the service is top-notch. I have been coming here for months and every experience has been exceptional. Highly recommend to anyone looking for quality and care.',
    relativeTime: '2 weeks ago',
    profilePhotoUrl: ''
  },
  {
    id: 'demo-2',
    authorName: 'James K.',
    rating: 4,
    text: 'Great experience overall. The team was professional and friendly. Only giving 4 stars because parking can be a bit tricky during peak hours, but the quality of work more than makes up for it. Will definitely be back!',
    relativeTime: '1 month ago',
    profilePhotoUrl: ''
  },
  {
    id: 'demo-3',
    authorName: 'Emily R.',
    rating: 5,
    text: 'Hands down the best decision I have made this year. From the initial consultation to the final result, everything was seamless. The attention to detail really sets them apart from others in the area.',
    relativeTime: '3 weeks ago',
    profilePhotoUrl: ''
  }
];

// --- Live preview render ---
var _previewPending = false;
function renderPreview() {
  var ds = getDataSource();

  // Wait for widget API to be available
  if (!window.ReviewsWidget || !window.ReviewsWidget.fetchReviews) {
    if (!_previewPending) {
      prev.innerHTML = '<span class="preview-loading">Loading widget…</span>';
      _previewPending = true;
      var checkReady = setInterval(function() {
        if (window.ReviewsWidget && window.ReviewsWidget.fetchReviews) {
          clearInterval(checkReady);
          _previewPending = false;
          renderPreview();
        }
      }, 100);
      setTimeout(function() { clearInterval(checkReady); _previewPending = false; }, 10000);
    }
    return;
  }

  var RW = window.ReviewsWidget;
  var m = getMode();
  var lay = layout.value;
  var th = theme.value;
  var maxv = maxR.value || 5;
  var ct = ctaT.value.trim();
  var cu = ctaU.value.trim();
  var customColors = getCustomColors();

  // Live mode check
  if (ds === 'live') {
    var placeIdVal = pid.value.trim();
    if (!placeIdVal) {
      prev.innerHTML = '<span class="preview-empty">Enter a Place ID to use Live mode.</span>';
      return;
    }
    prev.innerHTML = '<span class="preview-loading">Loading reviews…</span>';

    // Create root and fetch
    doRender(RW, null, m, lay, th, maxv, ct, cu, customColors, function(root, callback) {
      var apiBase = window.location.origin;
      RW.fetchReviews(apiBase, placeIdVal).then(callback).catch(function() { callback(null); });
    });
    return;
  }

  // Demo mode: use dummy data immediately
  prev.innerHTML = '<span class="preview-loading">Rendering preview…</span>';
  doRender(RW, DEMO_REVIEWS, m, lay, th, maxv, ct, cu, customColors, null);
}

// Shared render logic: accepts data directly (demo) or fetches via callback (live)
function doRender(RW, data, m, lay, th, maxv, ct, cu, customColors, fetchFn) {
  // Create root element
  var root = document.createElement('div');
  var cls = ['rw-root', 'rw-theme--' + th];
  if (m === 'flyout') {
    cls.push('rw-mode-flyout');
    cls.push('rw-position--' + position.value);
    root.style.position = 'relative';
    root.style.bottom = 'auto';
    root.style.right = 'auto';
    root.style.left = 'auto';
    root.style.transform = 'none';
    root.style.maxWidth = '100%';
    root.style.marginTop = '0.5rem';
  }
  root.className = cls.join(' ');

  RW.injectStyles();
  RW.applyTheme(root, th, customColors, getFontSizes(), getFontFamilies());

  prev.innerHTML = '';
  prev.appendChild(root);

  var config = {
    placeId: 'demo',
    mode: m,
    layout: lay,
    position: position.value,
    theme: th,
    maxReviews: maxv,
    ctaText: ct || undefined,
    ctaUrl: cu || undefined,
    customColors: customColors
  };

  function doRenderWithReviews(reviews, summary) {
    if (!reviews || reviews.length === 0) {
      RW.renderEmpty(root);
      return;
    }
    var trimmed = reviews.slice(0, maxv);
    var displayData = { reviews: trimmed, summary: summary || { rating: 4.7, totalCount: reviews.length } };
    try {
      if (m === 'flyout') {
        RW.renderFlyout(root, displayData, config);
      } else if (lay === 'carousel') {
        RW.renderInlineCarousel(root, displayData, config);
      } else {
        RW.renderInlineGrid(root, displayData, config);
      }
      if (m === 'inline' && lay === 'grid') {
        var gridEl = root.querySelector('.rw-grid');
        if (gridEl) gridEl.style.gridTemplateColumns = 'repeat(auto-fill,minmax(200px,1fr))';
      }
    } catch(e) {
      console.error('[setup] Preview render error:', e);
      RW.renderEmpty(root);
    }
  }

  if (data) {
    // Demo: use provided data directly
    var summary = { rating: 4.7, totalCount: 120 };
    // Use setTimeout to let the DOM settle
    setTimeout(function() { doRenderWithReviews(data, summary); }, 50);
  } else if (fetchFn) {
    // Live: fetch via callback
    fetchFn(root, function(result) {
      if (result && result.reviews) {
        doRenderWithReviews(result.reviews, result.summary);
      } else {
        RW.renderEmpty(root);
      }
    });
  }
}

// --- Generate embed code ---
function genEmbedCode() {
  var placeIdVal = pid.value.trim() || 'YOUR_PLACE_ID';
  var m = getMode();
  var lay = layout.value;
  var pos = position.value;
  var th = theme.value;
  var maxv = maxR.value || 5;
  var ct = ctaT.value.trim();
  var cu = ctaU.value.trim();
  var customColors = getCustomColors();

  var tag = '<script\\n';
  tag += '  src="https://reviews.marketinghero.net/widget.js"\\n';
  tag += '  data-place-id="' + esc(placeIdVal) + '"\\n';
  tag += '  data-mode="' + m + '"\\n';
  if (m === 'inline') tag += '  data-layout="' + lay + '"\\n';
  if (m === 'flyout') tag += '  data-position="' + pos + '"\\n';
  tag += '  data-theme="' + th + '"\\n';
  tag += '  data-max-reviews="' + maxv + '"\\n';
  // Custom colors: only emit if they differ from the theme
  if (colorsDifferFromTheme(th)) {
    for (var ci = 0; ci < COLOR_DEFS.length; ci++) {
      var def = COLOR_DEFS[ci];
      var inp = colorInputs[def.id];
      if (!inp) continue;
      // Convert camelCase key to hyphen-case data attribute
      var attrName = def.key.replace(/([A-Z])/g, '-$1').toLowerCase();
      tag += '  data-color-' + attrName + '="' + inp.value + '"\\n';
    }
  }
  // Custom font sizes
  var fs = getFontSizes();
  if (fs) {
    var FS_ATTRS = { sizeHeadline:'data-font-size-headline', sizeTestimonial:'data-font-size-testimonial', sizeAuthor:'data-font-size-author', sizeReadMore:'data-font-size-read-more' };
    for (var fsk in fs) {
      if (FS_ATTRS[fsk]) tag += '  ' + FS_ATTRS[fsk] + '="' + fs[fsk] + '"\\n';
    }
  }
  // Custom font families
  var ff = getFontFamilies();
  if (ff) {
    if (ff.fontFamilyHeadline) tag += '  data-font-family-headline="' + esc(ff.fontFamilyHeadline) + '"\\n';
    if (ff.fontFamilyBody) tag += '  data-font-family-body="' + esc(ff.fontFamilyBody) + '"\\n';
  }
  if (ct) tag += '  data-cta-text="' + esc(ct) + '"\\n';
  if (cu) tag += '  data-cta-url="' + esc(cu) + '"\\n';
  tag += '  async\\n';
  tag += '><\\/script>';

  out.textContent = tag;
}

// --- Unified update: preview + embed ---
function updateAll() {
  updateSwatchPreview();
  renderPreview();
  genEmbedCode();
}

// --- Mode toggle ---
function updateMode() {
  var m = getMode();
  document.getElementById('layoutRow').classList.toggle('hidden', m === 'flyout');
  document.getElementById('positionRow').classList.toggle('hidden', m !== 'flyout');
  updateAll();
}

// --- Copy embed code ---
function copyCode() {
  navigator.clipboard.writeText(out.textContent).then(function() {
    copyB.textContent = '✓ Copied!';
    copyB.classList.add('copied');
    setTimeout(function() {
      copyB.textContent = '📋 Copy';
      copyB.classList.remove('copied');
    }, 2000);
  });
}

// --- Reset colors to current theme ---
function resetColors() {
  applyThemeColors(theme.value);
}

// --- Event listeners ---
pid.addEventListener('input', updateAll);
layout.addEventListener('change', updateAll);
position.addEventListener('change', updateAll);
theme.addEventListener('change', function() {
  // When theme changes, reset color pickers to theme colors
  applyThemeColors(theme.value);
  updateAll();
});
maxR.addEventListener('input', updateAll);
ctaT.addEventListener('input', updateAll);
ctaU.addEventListener('input', updateAll);

for (var ri = 0; ri < radios.length; ri++) {
  radios[ri].addEventListener('change', updateMode);
}

var dsRadios = document.querySelectorAll('input[name=dataSource]');
for (var dri = 0; dri < dsRadios.length; dri++) {
  dsRadios[dri].addEventListener('change', updateAll);
}

resetBtn.addEventListener('click', resetColors);
copyB.addEventListener('click', copyCode);

// Font control listeners
fSizeHeadline.addEventListener('change', updateAll);
fSizeTestimonial.addEventListener('change', updateAll);
fSizeAuthor.addEventListener('change', updateAll);
fSizeReadMore.addEventListener('change', updateAll);
fFamilyHeadline.addEventListener('change', updateAll);
fFamilyBody.addEventListener('change', updateAll);

// --- Init ---
applyThemeColors('default');
updateAll();
})();
</script>
</body>
</html>`;
