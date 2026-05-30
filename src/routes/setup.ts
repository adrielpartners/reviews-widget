// src/routes/setup.ts
// Serves the embed code generator setup page.

import { CORS_HEADERS } from "../lib/envelopes";

export function handleSetup(): Response {
  return new Response(SETUP_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
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
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6;min-height:100vh}
.wrap{max-width:680px;margin:0 auto;padding:2rem 1.5rem 4rem}
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
.preview-area{background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:0.75rem;padding:1.5rem;min-height:60px;overflow:hidden;position:relative}
.preview-empty{color:#94a3b8;font-style:italic}
</style>
</head>
<body>
<div class="wrap">
<h1>⭐ Reviews Widget Setup</h1>
<p class="sub">Fill in your options to generate your embed code. Copy and paste it into your website.</p>

<div class="card">
<h2>📍 Business</h2>
<div class="row">
<label>Google Place ID <span class="req">*</span></label>
<input type="text" id="placeId" placeholder="ChIJ868xVWE8eGERSxHj3eqaK5M">
<div class="hint">Find yours at <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener">Google Place ID Finder</a></div>
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
<select id="theme"><option value="default">Default</option><option value="modern">Modern</option><option value="professional">Professional</option><option value="pastel">Pastel</option></select>
</div>
<div class="row">
<label>Max Reviews</label>
<input type="number" id="maxReviews" value="5" min="1" max="20">
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
<h2>📋 Embed Code</h2>
<pre id="embedOutput"></pre>
<button class="copy-btn" id="copyBtn" onclick="copyCode()">📋 Copy</button>
</div>

<div class="card">
<h2>👁️ Preview</h2>
<div class="preview-label">Enter a Place ID above to see a live preview.</div>
<div class="preview-area" id="previewArea"><span class="preview-empty">Enter a Place ID above to see a live preview.</span></div>
</div>
</div>
<script>
var p=document.getElementById('placeId');
var layout=document.getElementById('layout');
var position=document.getElementById('position');
var theme=document.getElementById('theme');
var maxR=document.getElementById('maxReviews');
var ctaT=document.getElementById('ctaText');
var ctaU=document.getElementById('ctaUrl');
var out=document.getElementById('embedOutput');
var prev=document.getElementById('previewArea');
var copyB=document.getElementById('copyBtn');

function getMode(){return document.querySelector('input[name=mode]:checked').value}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

function updateMode(){
  var m=getMode();
  document.getElementById('layoutRow').classList.toggle('hidden',m==='flyout');
  document.getElementById('positionRow').classList.toggle('hidden',m!=='flyout');
  gen();
}

function gen(){
  var pid=p.value.trim()||'YOUR_PLACE_ID';
  var m=getMode();
  var lay=layout.value;
  var pos=position.value;
  var th=theme.value;
  var maxv=maxR.value||5;
  var ct=ctaT.value.trim();
  var cu=ctaU.value.trim();

  // Build embed code
  var tag='<script\\n';
  tag+='  src="https://reviews.marketinghero.net/widget.js"\\n';
  tag+='  data-place-id="'+esc(pid)+'"\\n';
  tag+='  data-mode="'+m+'"\\n';
  if(m==='inline') tag+='  data-layout="'+lay+'"\\n';
  if(m==='flyout') tag+='  data-position="'+pos+'"\\n';
  tag+='  data-theme="'+th+'"\\n';
  tag+='  data-max-reviews="'+maxv+'"\\n';
  if(ct) tag+='  data-cta-text="'+esc(ct)+'"\\n';
  if(cu) tag+='  data-cta-url="'+esc(cu)+'"\\n';
  tag+='  async\\n';
  tag+='><\\/script>';
  out.textContent=tag;

  // Build preview
  if(pid!=='YOUR_PLACE_ID'){
    prev.innerHTML='';
    var mount=document.createElement('div');
    prev.appendChild(mount);
    var s=document.createElement('script');
    s.src='https://reviews.marketinghero.net/widget.js';
    s.dataset.placeId=pid;
    s.dataset.mode=m;
    if(m==='inline') s.dataset.layout=lay;
    if(m==='flyout') s.dataset.position=pos;
    s.dataset.theme=th;
    s.dataset.maxReviews=maxv;
    if(ct) s.dataset.ctaText=ct;
    if(cu) s.dataset.ctaUrl=cu;
    s.async=true;
    mount.appendChild(s);
  } else {
    prev.innerHTML='<span class="preview-empty">Enter a Place ID above to see a live preview.</span>';
  }
}

function copyCode(){
  navigator.clipboard.writeText(out.textContent).then(function(){
    copyB.textContent='✓ Copied!';
    copyB.classList.add('copied');
    setTimeout(function(){
      copyB.textContent='📋 Copy';
      copyB.classList.remove('copied');
    },2000);
  });
}

p.addEventListener('input',gen);
layout.addEventListener('change',gen);
position.addEventListener('change',gen);
theme.addEventListener('change',gen);
maxR.addEventListener('input',gen);
ctaT.addEventListener('input',gen);
ctaU.addEventListener('input',gen);
var radios=document.querySelectorAll('input[name=mode]');
for(var i=0;i<radios.length;i++) radios[i].addEventListener('change',updateMode);
gen();
</script>
</body>
</html>`;
