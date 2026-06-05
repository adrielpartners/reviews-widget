// src/routes/admin-dashboard.ts
// GET /admin/dashboard — Full admin panel with login, place management, and config editor.
// Everything runs in the browser via the JSON API — no CLI needed.

import type { Env } from "../types/env";

export async function handleAdminDashboard(_request: Request, _env: Env): Promise<Response> {
  return new Response(ADMIN_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reviews Widget — Admin</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;color:#1e293b;line-height:1.5;min-height:100vh}

/* Login */
.login-wrap{max-width:400px;margin:4rem auto;padding:2rem}
.login-box{background:#fff;border-radius:1rem;border:1px solid #e2e8f0;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center}
.login-box h1{font-size:1.5rem;font-weight:800;color:#0f172a;margin-bottom:0.25rem}
.login-box .sub{color:#64748b;font-size:0.9375rem;margin-bottom:1.5rem}
.login-box input[type=password]{width:100%;padding:0.75rem 1rem;border:1px solid #cbd5e1;border-radius:0.5rem;font-size:1rem;margin-bottom:1rem;text-align:center;letter-spacing:0.1em}
.login-box input:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
.login-box .btn{width:100%;padding:0.75rem;background:#2563eb;color:#fff;border:none;border-radius:0.5rem;font-size:1rem;font-weight:600;cursor:pointer;transition:background 0.15s}
.login-box .btn:hover{background:#1d4ed8}
.login-box .error{color:#ef4444;font-size:0.875rem;margin-bottom:1rem;display:none}

/* Admin Panel */
.wrap{max-width:1024px;margin:0 auto;padding:2rem 1.5rem 4rem}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}
.header h1{font-size:1.75rem;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:0.5rem}
.header h1 small{font-size:0.8125rem;font-weight:400;color:#64748b;background:#e2e8f0;padding:0.125rem 0.625rem;border-radius:999px}
.header-actions{display:flex;gap:0.75rem;align-items:center}
.header-actions .btn{display:inline-flex;align-items:center;gap:0.375rem;padding:0.5rem 1rem;border-radius:0.5rem;font-size:0.875rem;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;text-decoration:none}
.btn-primary{background:#2563eb;color:#fff}
.btn-primary:hover{background:#1d4ed8}
.btn-secondary{background:#e2e8f0;color:#334155}
.btn-secondary:hover{background:#cbd5e1}
.btn-danger{background:#ef4444;color:#fff}
.btn-danger:hover{background:#dc2626}
.btn-sm{padding:0.375rem 0.75rem;font-size:0.8125rem}
.btn-outline{background:transparent;border:1px solid #cbd5e1;color:#475569}
.btn-outline:hover{background:#f1f5f9}
.header-actions .logout-btn{background:none;border:none;color:#94a3b8;font-size:0.8125rem;cursor:pointer;padding:0.375rem 0.625rem;border-radius:0.375rem}
.header-actions .logout-btn:hover{color:#ef4444;background:#fef2f2}

/* Summary */
.summary{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}
.summary-card{background:#fff;border-radius:0.75rem;border:1px solid #e2e8f0;padding:1.25rem 1.5rem;flex:1;min-width:120px;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.summary-card .num{font-size:1.75rem;font-weight:700;color:#0f172a}
.summary-card .lbl{font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;margin-top:0.125rem}

/* Place Cards */
.place-card{background:#fff;border-radius:0.75rem;border:1px solid #e2e8f0;padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
.place-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.place-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem}
.place-info .name{font-size:1.125rem;font-weight:700;color:#0f172a}
.place-info .url{font-size:0.8125rem;color:#3b82f6;text-decoration:none}
.place-info .url:hover{text-decoration:underline}
.place-info .business{font-size:0.75rem;color:#94a3b8;margin-top:0.125rem}
.place-actions{display:flex;gap:0.5rem;flex-shrink:0}
.place-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:0.75rem}
.stat{text-align:center}
.stat .num{font-size:1.25rem;font-weight:700;color:#0f172a}
.stat .lbl{font-size:0.6875rem;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;margin-top:0.125rem}
.place-stats-row{display:flex;gap:1rem;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid #e2e8f0}
.place-stats-row .stat{flex:1}
.empty-state{text-align:center;padding:3rem 1rem;color:#94a3b8;font-size:1rem}

/* Modal overlay */
.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;padding:1rem;visibility:hidden;opacity:0;transition:opacity 0.2s}
.modal-overlay.open{visibility:visible;opacity:1}
.modal{background:#fff;border-radius:1rem;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;padding:1.5rem 2rem 2rem;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.2)}
.modal h2{font-size:1.25rem;font-weight:700;margin-bottom:1.25rem;color:#0f172a}
.modal-close{position:absolute;top:0.75rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#94a3b8;padding:0.25rem;line-height:1}
.modal-close:hover{color:#475569}
.modal-row{margin-bottom:1rem}
.modal-row label{display:block;font-weight:600;font-size:0.8125rem;margin-bottom:0.25rem;color:#334155}
.modal-row input[type=text],.modal-row input[type=number],.modal-row select{width:100%;padding:0.5rem 0.75rem;border:1px solid #cbd5e1;border-radius:0.5rem;font-size:0.9375rem;background:#fff;color:#1e293b}
.modal-row input:focus,.modal-row select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.15)}
.modal-row .hint{font-size:0.75rem;color:#94a3b8;margin-top:0.25rem}
.modal-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.modal-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}
.modal-actions{display:flex;gap:0.75rem;justify-content:flex-end;margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0}
.modal-actions .btn{padding:0.625rem 1.5rem;border-radius:0.5rem;font-size:0.9375rem;font-weight:600;cursor:pointer;border:none;transition:all 0.15s}

/* Color section in config editor */
.color-section{margin-top:0.75rem}
.color-section h3{font-size:0.9375rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem}
.color-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem}
.color-item{border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.5rem;text-align:center}
.color-item label{display:block;font-size:0.625rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.02em;margin-bottom:0.25rem}
.color-item input[type=color]{width:100%;height:2.25rem;border-radius:0.375rem;border:1px solid #e2e8f0;cursor:pointer;padding:0;background:none}
.color-item input[type=color]::-webkit-color-swatch-wrapper{padding:0}
.color-item input[type=color]::-webkit-color-swatch{border:1px solid #cbd5e1;border-radius:0.25rem}
.font-section{margin-top:0.75rem}

/* Embed code in config modal */
.embed-section{margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid #e2e8f0}
.embed-section h3{font-size:0.9375rem;font-weight:700;color:#0f172a;margin-bottom:0.5rem}
.embed-code{background:#0f172a;color:#e2e8f0;padding:1rem;border-radius:0.5rem;font-size:0.75rem;line-height:1.6;overflow-x:auto;white-space:pre;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;margin-bottom:0.75rem}
.refresh-link{font-size:0.8125rem;color:#3b82f6;text-decoration:none;cursor:pointer}
.refresh-link:hover{text-decoration:underline;color:#2563eb}
.refresh-link.loading{color:#94a3b8;cursor:default;pointer-events:none;text-decoration:none}
.refresh-status{font-size:0.8125rem;margin-left:0.5rem;color:#64748b}

/* Toast notifications */
.toast{position:fixed;bottom:1.5rem;right:1.5rem;z-index:2000;background:#0f172a;color:#f1f5f9;padding:0.75rem 1.25rem;border-radius:0.5rem;font-size:0.875rem;font-weight:500;box-shadow:0 4px 20px rgba(0,0,0,0.2);opacity:0;transform:translateY(20px);transition:all 0.3s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}
.toast.success{background:#059669}
.toast.error{background:#dc2626}

/* Loading */
.loading{text-align:center;padding:3rem;color:#94a3b8;font-size:1rem}

/* Scrollable places list */
.places-list{max-height:calc(100vh - 220px);overflow-y:auto;padding-right:0.5rem}

/* Responsive */
@media(max-width:640px){.modal-grid-2,.modal-grid-3{grid-template-columns:1fr}}
</style>
</head>
<body>

<!-- LOGIN SCREEN -->
<div id="loginScreen" class="login-wrap">
  <div class="login-box">
    <div style="font-size:2.5rem;margin-bottom:0.5rem">&#x1f510;</div>
    <h1>Admin Dashboard</h1>
    <p class="sub">Enter your admin token to continue</p>
    <div class="error" id="loginError">Invalid token</div>
    <input type="password" id="tokenInput" placeholder="Admin token" autocomplete="off">
    <button class="btn" id="loginBtn">Log In</button>
  </div>
</div>

<!-- ADMIN PANEL -->
<div id="adminPanel" style="display:none">
  <div class="wrap">
    <div class="header">
      <h1>&#x1f4ca; Reviews Admin <small id="placeCount">0</small></h1>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="openAddPlace()">&#x2795; Add Place</button>
        <button class="btn btn-outline btn-sm" onclick="refreshDashboard()">&#x1f504; Refresh</button>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
    </div>
    <div class="summary" id="summaryRow">
      <div class="summary-card"><div class="num" id="sumImpressions">0</div><div class="lbl">Total Impressions</div></div>
      <div class="summary-card"><div class="num" id="sumPanels">0</div><div class="lbl">Panel Opens</div></div>
      <div class="summary-card"><div class="num" id="sumCtas">0</div><div class="lbl">CTA Clicks</div></div>
    </div>
    <div id="placesContainer"><div class="loading">Loading places&hellip;</div></div>
  </div>
</div>

<!-- ADD PLACE MODAL -->
<div class="modal-overlay" id="addPlaceModal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('addPlaceModal')">&times;</button>
    <h2>&#x2795; Add New Place</h2>
    <div class="modal-row">
      <label>Place ID <span style="color:#ef4444">*</span></label>
      <input type="text" id="apPlaceId" placeholder="ChIJ868xVWE8eGERSxHj3eqaK5M">
      <div class="hint">Google Place ID for this business</div>
    </div>
    <div class="modal-grid-2">
      <div class="modal-row">
        <label>Business Name <span style="color:#ef4444">*</span></label>
        <input type="text" id="apBusinessName" placeholder="Grace Community Church">
      </div>
      <div class="modal-row">
        <label>Client Name</label>
        <input type="text" id="apClientName" placeholder="Grace Community Church">
        <div class="hint">Display name on dashboard</div>
      </div>
    </div>
    <div class="modal-row">
      <label>Website URL</label>
      <input type="text" id="apWebsiteUrl" placeholder="https://gracecommunity.org">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('addPlaceModal')">Cancel</button>
      <button class="btn btn-primary" onclick="submitAddPlace()">Add Place</button>
    </div>
  </div>
</div>

<!-- CONFIG EDITOR MODAL -->
<div class="modal-overlay" id="configModal">
  <div class="modal">
    <button class="modal-close" onclick="closeModal('configModal')">&times;</button>
    <h2 id="configModalTitle">&#x2699;&#xfe0f; Widget Config</h2>
    <div class="modal-grid-2">
      <div class="modal-row">
        <label>Client Name</label>
        <input type="text" id="cfgClientName" placeholder="Grace Community Church">
      </div>
      <div class="modal-row">
        <label>Website URL</label>
        <input type="text" id="cfgWebsiteUrl" placeholder="https://gracecommunity.org">
      </div>
    </div>
    <div class="modal-grid-3">
      <div class="modal-row">
        <label>Mode</label>
        <select id="cfgMode">
          <option value="inline">Inline</option>
          <option value="flyout">Flyout</option>
        </select>
      </div>
      <div class="modal-row">
        <label>Layout</label>
        <select id="cfgLayout">
          <option value="grid">Grid</option>
          <option value="carousel">Carousel</option>
        </select>
      </div>
      <div class="modal-row">
        <label>Position (flyout)</label>
        <select id="cfgPosition">
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-center">Bottom Center</option>
          <option value="bottom-left">Bottom Left</option>
        </select>
      </div>
    </div>
    <div class="modal-grid-3">
      <div class="modal-row">
        <label>Theme</label>
        <select id="cfgTheme" onchange="applyThemeColors()">
          <option value="default">Default</option>
          <option value="modern">Modern</option>
          <option value="professional">Professional</option>
          <option value="pastel">Pastel</option>
        </select>
      </div>
      <div class="modal-row">
        <label>Max Reviews</label>
        <input type="number" id="cfgMaxReviews" value="5" min="1" max="20">
      </div>
      <div class="modal-row">
        <label>Custom Class</label>
        <input type="text" id="cfgCustomClass" placeholder="my-widget">
        <div class="hint">Optional CSS class</div>
      </div>
    </div>
    <div class="modal-row">
      <label>CTA Text (optional)</label>
      <input type="text" id="cfgCtaText" placeholder="Leave a review">
    </div>
    <div class="modal-row">
      <label>CTA URL</label>
      <input type="text" id="cfgCtaUrl" placeholder="https://g.page/r/.../review">
    </div>
    <div class="color-section">
      <h3>&#x1f3a8; Custom Colors</h3>
      <p class="hint" style="margin-bottom:0.5rem">Leave as is to use theme defaults</p>
      <div class="color-grid" id="cfgColorGrid"></div>
    </div>
    <div class="font-section">
      <h3>&#x1f524; Font Sizes</h3>
      <div class="modal-grid-3" id="cfgFontGrid"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('configModal')">Cancel</button>
      <button class="btn btn-primary" onclick="saveConfig()">&#x1f4be; Save Config</button>
    </div>
    <div class="embed-section">
      <h3>&#x1f4cb; Embed Code</h3>
      <p class="hint" style="margin-bottom:0.5rem">Copy this onto the client&rsquo;s site. Empty <code>data-*</code> attributes are placeholders &mdash; the widget uses Admin-configured defaults unless the client fills them in.</p>
      <pre class="embed-code" id="embedCodeOutput"></pre>
      <button class="btn btn-outline btn-sm" onclick="copyEmbedCode()">&#x1f4cb; Copy</button>
    </div>
    <div class="embed-section">
      <a href="#" onclick="refreshPlaceReviews();return false" id="refreshPlaceLink" class="refresh-link">&#x1f504; Manually Refresh Reviews</a>
      <span id="refreshPlaceStatus" class="refresh-status"></span>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
(function(){
'use strict';

var TOKEN_KEY = 'rw_admin_token';
var editingPlaceId = null;
var token = null;

var COLOR_DEFS = [
  { id:'clrBg', label:'Background', key:'colorBg' },
  { id:'clrText', label:'Text', key:'colorText' },
  { id:'clrTextSecondary', label:'Secondary Text', key:'colorTextSecondary' },
  { id:'clrBorder', label:'Border', key:'colorBorder' },
  { id:'clrStar', label:'Star (filled)', key:'colorStar' },
  { id:'clrStarEmpty', label:'Star (empty)', key:'colorStarEmpty' },
  { id:'clrCtaBg', label:'CTA Button', key:'colorCtaBg' },
  { id:'clrCtaText', label:'CTA Text', key:'colorCtaText' },
  { id:'clrCardBg', label:'Card Background', key:'colorCardBg' }
];

var THEME_COLORS = {
  default: { clrBg:'#ffffff', clrText:'#1a1a2e', clrTextSecondary:'#6b7280', clrBorder:'#e5e7eb', clrStar:'#f59e0b', clrStarEmpty:'#d1d5db', clrCtaBg:'#2563eb', clrCtaText:'#ffffff', clrCardBg:'#ffffff' },
  modern:  { clrBg:'#0f172a', clrText:'#f1f5f9', clrTextSecondary:'#94a3b8', clrBorder:'#1e293b', clrStar:'#fbbf24', clrStarEmpty:'#334155', clrCtaBg:'#3b82f6', clrCtaText:'#ffffff', clrCardBg:'#1e293b' },
  professional: { clrBg:'#fafafa', clrText:'#2d3748', clrTextSecondary:'#718096', clrBorder:'#cbd5e0', clrStar:'#d69e2e', clrStarEmpty:'#e2e8f0', clrCtaBg:'#2b6cb0', clrCtaText:'#ffffff', clrCardBg:'#ffffff' },
  pastel: { clrBg:'#fef7f0', clrText:'#4a3728', clrTextSecondary:'#8b7355', clrBorder:'#e8ddd0', clrStar:'#f6ad55', clrStarEmpty:'#ddd0c0', clrCtaBg:'#ed8936', clrCtaText:'#ffffff', clrCardBg:'#ffffff' }
};

var FONT_DEFS = [
  { id:'cfgSizeHeadline', label:'Headline', key:'sizeHeadline', opts:['','1rem','1.25rem','1.5rem','1.75rem','2rem','2.25rem','2.5rem'] },
  { id:'cfgSizeTestimonial', label:'Testimonial', key:'sizeTestimonial', opts:['','0.75rem','0.875rem','1rem','1.125rem','1.25rem','1.5rem','1.75rem'] },
  { id:'cfgSizeAuthor', label:'Author', key:'sizeAuthor', opts:['','0.75rem','0.875rem','1rem','1.125rem','1.25rem','1.5rem','1.75rem'] },
  { id:'cfgSizeReadMore', label:'Read More', key:'sizeReadMore', opts:['','0.625rem','0.75rem','0.875rem','1rem','1.125rem','1.25rem','1.5rem'] }
];

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }

function showLogin() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('tokenInput').value = '';
  document.getElementById('tokenInput').focus();
  document.getElementById('loginBtn').textContent = 'Log In';
  document.getElementById('loginBtn').disabled = false;
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('loginError').style.display = 'none';
  refreshDashboard();
}

function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
}

document.getElementById('loginBtn').addEventListener('click', function() {
  var t = document.getElementById('tokenInput').value.trim();
  if (!t) return;
  document.getElementById('loginBtn').textContent = 'Verifying...';
  document.getElementById('loginBtn').disabled = true;
  document.getElementById('loginError').style.display = 'none';
  sessionStorage.setItem(TOKEN_KEY, t);
  token = t;
  apiFetch('/api/admin/places').then(function(data) {
    if (data && data.ok) {
      showAdmin();
    } else {
      document.getElementById('loginError').style.display = 'block';
      sessionStorage.removeItem(TOKEN_KEY);
      document.getElementById('loginBtn').textContent = 'Log In';
      document.getElementById('loginBtn').disabled = false;
    }
  }).catch(function() {
    document.getElementById('loginError').style.display = 'block';
    sessionStorage.removeItem(TOKEN_KEY);
    document.getElementById('loginBtn').textContent = 'Log In';
    document.getElementById('loginBtn').disabled = false;
  });
});

document.getElementById('tokenInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

function apiFetch(url, opts) {
  opts = opts || {};
  var headers = opts.headers || {};
  headers['Authorization'] = 'Bearer ' + (token || getToken());
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  return fetch(url, { method: opts.method || 'GET', headers: headers, body: opts.body || null })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.ok) throw new Error(data.error ? data.error.message : 'Request failed');
      return data;
    });
}

function toast(msg, type) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + (type || 'success');
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, 3000);
}

function refreshDashboard() {
  token = getToken();
  if (!token) { showLogin(); return; }
  document.getElementById('placesContainer').innerHTML = '<div class="loading">Loading places&hellip;</div>';
  apiFetch('/api/admin/places').then(function(data) {
    if (!data || !data.data) return;
    var places = data.data.places || [];
    document.getElementById('placeCount').textContent = places.length + ' active';
    return fetchStatsForPlaces(places);
  }).catch(function(e) {
    document.getElementById('placesContainer').innerHTML = '<div class="empty-state">Failed to load places. Check your token.</div>';
    toast('Failed to load: ' + e.message, 'error');
  });
}

function fetchStatsForPlaces(places) {
  apiFetch('/api/admin/stats').then(function(sdata) {
    var stats = (sdata.data && sdata.data.stats) || {};
    for (var i = 0; i < places.length; i++) {
      var pid = places[i].placeId;
      var s = stats[pid] || {};
      places[i].impressionsAllTime = s.impressionsAllTime || 0;
      places[i].impressionsWeek = s.impressionsWeek || 0;
      places[i].impressionsMonth = s.impressionsMonth || 0;
      places[i].panelOpens = s.panelOpens || 0;
      places[i].ctaClicks = s.ctaClicks || 0;
    }
    renderPlaces(places);
  }).catch(function() {
    renderPlaces(places);
  });
}

function renderPlaces(places) {
  var container = document.getElementById('placesContainer');
  if (places.length === 0) {
    container.innerHTML = '<div class="empty-state">No places registered yet. Click &quot;Add Place&quot; to get started.</div>';
    updateSummary(places);
    return;
  }
  var html = '';
  for (var i = 0; i < places.length; i++) {
    html += renderCard(places[i]);
  }
  container.innerHTML = '<div class="places-list">' + html + '</div>';
  updateSummary(places);
}

function renderCard(p) {
  return '<div class="place-card">'
    + '<div class="place-header">'
    + '<div class="place-info">'
    + '<div class="name">' + esc(p.clientName || p.businessName) + '</div>'
    + (p.websiteUrl ? '<a class="url" href="' + esc(p.websiteUrl) + '" target="_blank" rel="noopener">' + esc(p.websiteUrl) + '</a>' : '')
    + '<div class="business">' + esc(p.businessName) + ' <span style="color:#cbd5e1">&middot;</span> ' + esc(p.placeId.slice(0, 12)) + '&hellip;</div>'
    + '</div>'
    + '<div class="place-actions">'
    + '<button class="btn btn-outline btn-sm" data-place-id="' + jsStr(p.placeId) + '" onclick="openConfig(this.dataset.placeId)">⚙️ Edit Config</button>'
    + '</div>'
    + '</div>'
    + '<div class="place-stats">'
    + '<div class="stat"><div class="num">' + (p.impressionsAllTime || 0).toLocaleString() + '</div><div class="lbl">All Time</div></div>'
    + '<div class="stat"><div class="num">' + (p.impressionsWeek || 0).toLocaleString() + '</div><div class="lbl">This Week</div></div>'
    + '<div class="stat"><div class="num">' + (p.impressionsMonth || 0).toLocaleString() + '</div><div class="lbl">This Month</div></div>'
    + '</div>'
    + '<div class="place-stats-row">'
    + '<div class="stat"><div class="num">' + (p.panelOpens || 0).toLocaleString() + '</div><div class="lbl">Panel Opens</div></div>'
    + '<div class="stat"><div class="num">' + (p.ctaClicks || 0).toLocaleString() + '</div><div class="lbl">CTA Clicks</div></div>'
    + '</div>'
    + '</div>';
}

function updateSummary(places) {
  var imp = 0, pan = 0, cta = 0;
  for (var i = 0; i < places.length; i++) {
    imp += places[i].impressionsAllTime || 0;
    pan += places[i].panelOpens || 0;
    cta += places[i].ctaClicks || 0;
  }
  document.getElementById('sumImpressions').textContent = imp.toLocaleString();
  document.getElementById('sumPanels').textContent = pan.toLocaleString();
  document.getElementById('sumCtas').textContent = cta.toLocaleString();
  document.getElementById('placeCount').textContent = places.length + ' active';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function jsStr(s) {
  return String(s).replace(/'/g, "\\'").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openAddPlace() {
  document.getElementById('apPlaceId').value = '';
  document.getElementById('apBusinessName').value = '';
  document.getElementById('apClientName').value = '';
  document.getElementById('apWebsiteUrl').value = '';
  openModal('addPlaceModal');
  setTimeout(function() { document.getElementById('apPlaceId').focus(); }, 100);
}

function submitAddPlace() {
  var placeId = document.getElementById('apPlaceId').value.trim();
  var businessName = document.getElementById('apBusinessName').value.trim();
  if (!placeId || !businessName) {
    toast('Place ID and Business Name are required', 'error');
    return;
  }
  var body = {
    placeId: placeId,
    businessName: businessName,
    clientName: document.getElementById('apClientName').value.trim() || businessName,
    websiteUrl: document.getElementById('apWebsiteUrl').value.trim()
  };
  apiFetch('/api/admin/places', { method: 'POST', body: JSON.stringify(body) }).then(function() {
    toast('Place added successfully!', 'success');
    closeModal('addPlaceModal');
    refreshDashboard();
  }).catch(function(e) {
    toast('Failed: ' + e.message, 'error');
  });
}

var _cachedPlaces = {};

function openConfig(placeId) {
  editingPlaceId = placeId;
  document.getElementById('configModalTitle').textContent = 'Config - ' + placeId.slice(0, 20) + '...';
  apiFetch('/api/admin/places').then(function(data) {
    var places = (data.data && data.data.places) || [];
    var place = null;
    for (var i = 0; i < places.length; i++) {
      if (places[i].placeId === placeId) { place = places[i]; break; }
    }
    if (!place) { toast('Place not found', 'error'); return; }
    var rc = place.remoteConfig || {};
    document.getElementById('cfgClientName').value = place.clientName || place.businessName || '';
    document.getElementById('cfgWebsiteUrl').value = place.websiteUrl || '';
    document.getElementById('cfgMode').value = rc.mode || 'inline';
    document.getElementById('cfgLayout').value = rc.layout || 'grid';
    document.getElementById('cfgPosition').value = rc.position || 'bottom-right';
    document.getElementById('cfgTheme').value = rc.theme || 'default';
    document.getElementById('cfgMaxReviews').value = rc.maxReviews || 5;
    document.getElementById('cfgCustomClass').value = rc.customClass || '';
    document.getElementById('cfgCtaText').value = rc.ctaText || '';
    document.getElementById('cfgCtaUrl').value = rc.ctaUrl || '';
    buildColorGrid(rc.customColors || {});
    buildFontGrid(rc.customFontSizes || {});
    applyThemeColors();
    _cachedPlaces[placeId] = place;
    openModal('configModal');
    genEmbedCode(placeId);
  }).catch(function(e) {
    toast('Failed to load config: ' + e.message, 'error');
  });
}

function buildColorGrid(customColors) {
  var grid = document.getElementById('cfgColorGrid');
  grid.innerHTML = '';
  for (var i = 0; i < COLOR_DEFS.length; i++) {
    var def = COLOR_DEFS[i];
    var div = document.createElement('div');
    div.className = 'color-item';
    var lbl = document.createElement('label');
    lbl.textContent = def.label;
    var inp = document.createElement('input');
    inp.type = 'color';
    inp.id = def.id;
    inp.value = customColors[def.key] || '#ffffff';
    div.appendChild(lbl);
    div.appendChild(inp);
    grid.appendChild(div);
  }
}

function buildFontGrid(fontSizes) {
  var grid = document.getElementById('cfgFontGrid');
  grid.innerHTML = '';
  for (var i = 0; i < FONT_DEFS.length; i++) {
    var def = FONT_DEFS[i];
    var div = document.createElement('div');
    div.className = 'modal-row';
    var lbl = document.createElement('label');
    lbl.textContent = def.label;
    var sel = document.createElement('select');
    sel.id = def.id;
    for (var j = 0; j < def.opts.length; j++) {
      var opt = document.createElement('option');
      opt.value = def.opts[j];
      opt.textContent = def.opts[j] || 'Default';
      if (def.opts[j] === (fontSizes[def.key] || '')) opt.selected = true;
      sel.appendChild(opt);
    }
    div.appendChild(lbl);
    div.appendChild(sel);
    grid.appendChild(div);
  }
}

function applyThemeColors() {
  var theme = document.getElementById('cfgTheme').value;
  var colors = THEME_COLORS[theme] || THEME_COLORS.default;
  for (var i = 0; i < COLOR_DEFS.length; i++) {
    var def = COLOR_DEFS[i];
    var inp = document.getElementById(def.id);
    if (inp && colors[def.id]) inp.value = colors[def.id];
  }
}

function saveConfig() {
  var themeVal = document.getElementById('cfgTheme').value;
  var customColors = {};
  var allDefault = true;
  for (var i = 0; i < COLOR_DEFS.length; i++) {
    var def = COLOR_DEFS[i];
    var inp = document.getElementById(def.id);
    if (inp) {
      var themeDefault = (THEME_COLORS[themeVal] || THEME_COLORS.default)[def.id];
      if (inp.value.toLowerCase() !== themeDefault.toLowerCase()) {
        customColors[def.key] = inp.value;
        allDefault = false;
      }
    }
  }
  if (allDefault) customColors = {};
  var customFontSizes = {};
  for (var fi = 0; fi < FONT_DEFS.length; fi++) {
    var fd = FONT_DEFS[fi];
    var el = document.getElementById(fd.id);
    if (el && el.value) customFontSizes[fd.key] = el.value;
  }
  var config = {
    mode: document.getElementById('cfgMode').value,
    layout: document.getElementById('cfgLayout').value,
    position: document.getElementById('cfgPosition').value,
    theme: themeVal,
    maxReviews: parseInt(document.getElementById('cfgMaxReviews').value) || 5,
    ctaText: document.getElementById('cfgCtaText').value.trim() || undefined,
    ctaUrl: document.getElementById('cfgCtaUrl').value.trim() || undefined,
    customClass: document.getElementById('cfgCustomClass').value.trim() || undefined
  };
  if (Object.keys(customColors).length > 0) config.customColors = customColors;
  if (Object.keys(customFontSizes).length > 0) config.customFontSizes = customFontSizes;
  for (var k in config) { if (config[k] === undefined) delete config[k]; }
  var body = {
    clientName: document.getElementById('cfgClientName').value.trim(),
    websiteUrl: document.getElementById('cfgWebsiteUrl').value.trim(),
    remoteConfig: config
  };
  apiFetch('/api/admin/places/' + encodeURIComponent(editingPlaceId) + '/config', {
    method: 'PUT',
    body: JSON.stringify(body)
  }).then(function() {
    toast('Config saved!', 'success');
    closeModal('configModal');
    refreshDashboard();
  }).catch(function(e) {
    toast('Failed to save: ' + e.message, 'error');
  });
}

function genEmbedCode(placeId) {
  var attrs = [
    'data-mode=""',
    'data-layout=""',
    'data-theme=""',
    'data-position=""',
    'data-max-reviews=""',
    'data-cta-text=""',
    'data-cta-url=""',
    'data-mount=""',
    'data-custom-class=""',
    'data-color-bg=""',
    'data-color-text=""',
    'data-color-text-secondary=""',
    'data-color-border=""',
    'data-color-star=""',
    'data-color-star-empty=""',
    'data-color-cta-bg=""',
    'data-color-cta-text=""',
    'data-color-card-bg=""',
    'data-font-size-headline=""',
    'data-font-size-testimonial=""',
    'data-font-size-author=""',
    'data-font-size-read-more=""',
    'data-font-family-headline=""',
    'data-font-family-body=""'
  ];
  var tag = '<script\\n';
  tag += '  src="https://reviews.marketinghero.net/widget.js"\\n';
  tag += '  data-place-id="' + esc(placeId) + '"\\n';
  for (var i = 0; i < attrs.length; i++) {
    tag += '  ' + attrs[i] + '\\n';
  }
  tag += '  async\\n';
  tag += '><\\/script>';
  document.getElementById('embedCodeOutput').textContent = tag;
}

function copyEmbedCode() {
  var el = document.getElementById('embedCodeOutput');
  if (!el || !el.textContent) return;
  navigator.clipboard.writeText(el.textContent).then(function() {
    toast('Embed code copied!', 'success');
  }).catch(function() {
    toast('Failed to copy', 'error');
  });
}

function refreshPlaceReviews() {
  if (!editingPlaceId) return;
  var link = document.getElementById('refreshPlaceLink');
  var status = document.getElementById('refreshPlaceStatus');
  link.classList.add('loading');
  status.textContent = 'Refreshing\u2026';
  apiFetch('/api/admin/refresh-place', {
    method: 'POST',
    body: JSON.stringify({ placeId: editingPlaceId })
  }).then(function(data) {
    if (data.data && data.data.reviewCount !== undefined) {
      status.textContent = '\u2713 ' + data.data.reviewCount + ' reviews';
    } else {
      status.textContent = '\u2713 Refreshed';
    }
    link.classList.remove('loading');
    setTimeout(function() { status.textContent = ''; }, 4000);
  }).catch(function(e) {
    status.textContent = '\u2717 Failed: ' + e.message;
    link.classList.remove('loading');
    setTimeout(function() { status.textContent = ''; }, 5000);
  });
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(function(el) {
  el.addEventListener('click', function(e) {
    if (e.target === el) el.classList.remove('open');
  });
});

var stored = getToken();
if (stored) {
  token = stored;
  apiFetch('/api/admin/places').then(function(data) {
    if (data && data.ok) {
      showAdmin();
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      showLogin();
    }
  }).catch(function() {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin();
  });
} else {
  showLogin();
}

// Expose functions to global scope for inline onclick handlers
window.openAddPlace = openAddPlace;
window.submitAddPlace = submitAddPlace;
window.openConfig = openConfig;
window.saveConfig = saveConfig;
window.closeModal = closeModal;
window.logout = logout;
window.refreshDashboard = refreshDashboard;
window.applyThemeColors = applyThemeColors;
window.genEmbedCode = genEmbedCode;
window.copyEmbedCode = copyEmbedCode;
window.refreshPlaceReviews = refreshPlaceReviews;

})();
</script>
</body>
</html>`;