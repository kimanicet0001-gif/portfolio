/* Portfolio KIM Anicet : rendu, carrousel, navigation et espace admin.
   Aucune dépendance. Les modifications faites dans l'espace admin sont stockées
   dans le navigateur (localStorage) ; voir l'onglet « Données » pour les publier. */
(() => {
  'use strict';

  /* ---------- Utilitaires ---------- */
  const KEY = 'kim_portfolio_v1';
  const AUTH_KEY = 'kim_portfolio_auth';
  const SESSION_KEY = 'kim_portfolio_session';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stockage tolérant aux erreurs (navigation privée, quota...)
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { mem[k] = v; return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } delete mem[k]; }
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return mem['s_' + k] ?? null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { mem['s_' + k] = v; } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } delete mem['s_' + k]; }
  };

  /* ---------- Icônes (tracés type Lucide, inline, sans dépendance) ---------- */
  const ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    explore: '<circle cx="12" cy="12" r="10"/><circle cx="11" cy="11" r="3.4"/><path d="m13.6 13.6 3.2 3.2"/>',
    projects: '<circle cx="12" cy="12" r="10"/><rect x="7.5" y="7.5" width="3.4" height="3.4" rx=".6"/><rect x="13.1" y="7.5" width="3.4" height="3.4" rx=".6"/><rect x="7.5" y="13.1" width="3.4" height="3.4" rx=".6"/><rect x="13.1" y="13.1" width="3.4" height="3.4" rx=".6"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    whatsapp: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10c.5 2 2.5 4 5 5l1.5-1.5-2-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-2z"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    // Icônes de compétences / projets
    wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.86a10 10 0 0 1 14 0"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/>',
    router: '<rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6.01 18H6"/><path d="M10.01 18H10"/><path d="M15 10v4"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    monitor: '<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96 3.15"/><path d="M7 19h5"/><rect width="6" height="10" x="16" y="12" rx="2"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.96 6.01 17.46 2 12 2z"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    award: '<path d="m15.48 12.89 1.52 8.53a.5.5 0 0 1-.81.47l-3.58-2.69a1 1 0 0 0-1.2 0l-3.59 2.69a.5.5 0 0 1-.81-.47l1.51-8.53"/><circle cx="12" cy="8" r="6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>'
  };
  const PICKABLE = [
    ['wifi', 'WiFi'], ['router', 'Routeur'], ['network', 'Réseau'], ['shield', 'Sécurité'], ['server', 'Serveur'], ['gauge', 'Débit'],
    ['monitor', 'Web'], ['code', 'Code'], ['palette', 'Design'], ['zap', 'IA'], ['users', 'Communauté'], ['book', 'Éducation'],
    ['award', 'Distinction'], ['heart', 'Santé'], ['globe', 'Globe'], ['terminal', 'Terminal'], ['cpu', 'Électronique'], ['layers', 'Couches'],
    ['phone', 'Mobile'], ['camera', 'Photo']
  ];
  const svg = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.layers}</svg>`;
  const hydrateIcons = (root = document) => $$('svg[data-i]', root).forEach((el) => {
    el.setAttribute('viewBox', '0 0 24 24'); el.setAttribute('aria-hidden', 'true');
    el.innerHTML = ICONS[el.dataset.i] || ''; el.removeAttribute('data-i');
  });

  /* ---------- Données ---------- */
  const DEF = window.DEFAULT_DATA;
  const str = (v, d = '') => (typeof v === 'string' ? v : d);
  const okImg = (s) => typeof s === 'string' && (/^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(s) || /^(https?:\/\/|\.?\/?[\w@%()\-. /]+\.(jpe?g|png|webp|gif|avif|svg))/i.test(s)) && !/^\s*javascript:/i.test(s);

  function normalize(raw) {
    const out = clone(DEF);
    if (!raw || typeof raw !== 'object') return out;
    if (raw.profile && typeof raw.profile === 'object') {
      Object.keys(DEF.profile).forEach((k) => {
        if (Array.isArray(DEF.profile[k])) { if (Array.isArray(raw.profile[k])) out.profile[k] = raw.profile[k].map((t) => str(t).trim()).filter(Boolean); }
        else if (typeof raw.profile[k] === 'string') out.profile[k] = raw.profile[k];
      });
    }
    if (Array.isArray(raw.photos)) out.photos = raw.photos.filter((p) => p && okImg(p.src)).map((p) => ({ id: str(p.id) || uid('p'), src: p.src, alt: str(p.alt, 'Photo') }));
    if (Array.isArray(raw.skills)) out.skills = raw.skills.filter((s) => s && str(s.title).trim()).map((s) => ({ id: str(s.id) || uid('s'), icon: ICONS[s.icon] ? s.icon : 'layers', title: str(s.title).trim(), desc: str(s.desc).trim() }));
    if (Array.isArray(raw.projects)) out.projects = raw.projects.filter((p) => p && str(p.name).trim()).map((p) => ({ id: str(p.id) || uid('j'), icon: ICONS[p.icon] ? p.icon : 'layers', name: str(p.name).trim(), desc: str(p.desc).trim(), link: str(p.link).trim() }));
    return out;
  }

  let data;
  try { const s = store.get(KEY); data = normalize(s ? JSON.parse(s) : null); } catch (e) { data = normalize(null); }

  function save() {
    const ok = store.set(KEY, JSON.stringify(data));
    if (!ok) toast("Stockage du navigateur plein ou indisponible : exporte tes données (onglet Données) pour ne rien perdre.", true);
    return ok;
  }

  /* ---------- Liens ---------- */
  function safeUrl(u) {
    u = str(u).trim(); if (!u) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; }
  }
  function waUrl(v) {
    v = str(v).trim(); if (!v) return '';
    if (/^\+?[\d\s().-]{6,}$/.test(v)) return 'https://wa.me/' + v.replace(/\D/g, '');
    return safeUrl(v);
  }

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg, err) {
    const t = $('#toast'); t.textContent = msg; t.classList.toggle('err', !!err); t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), err ? 5200 : 2600);
  }

  /* ---------- Rendu : profil ---------- */
  const paras = (txt, names) => {
    let html = txt.split(/\n{2,}/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');
    names.filter(Boolean).forEach((n) => { html = html.split(esc(n)).join(`<strong>${esc(n)}</strong>`); });
    return html;
  };

  function renderProfile() {
    const p = data.profile;
    document.title = `${p.name} | Portfolio`;
    const initials = p.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'K';
    $('#brandMark').textContent = initials;
    $('#brandName').textContent = p.name;
    $('#heroBadge').hidden = !p.badge.trim();
    $('#heroBadgeText').textContent = p.badge;
    $('#heroTitle').innerHTML = `${esc(p.heroTitle)}<br><span class="grad-text">${esc(p.headlineAccent)}</span>`;
    $('#heroRole').textContent = p.headline;
    $('#heroIntro').textContent = p.intro;
    $('#aboutTitle').textContent = p.aboutTitle;
    $('#aboutText').innerHTML = paras(p.about, [p.fullName, p.name]);
    $('#tags').innerHTML = p.tags.map((t) => `<li>${esc(t)}</li>`).join('');
    $('#footerText').textContent = `© ${new Date().getFullYear()} · ${p.name} · Conçu avec précision`;
    const links = [
      ['mail', 'Email', p.email.trim() ? 'mailto:' + p.email.trim() : ''],
      ['whatsapp', 'WhatsApp', waUrl(p.whatsapp)],
      ['linkedin', 'LinkedIn', safeUrl(p.linkedin)],
      ['facebook', 'Facebook', safeUrl(p.facebook)]
    ].filter((l) => l[2]);
    $('#contactLinks').innerHTML = links.map(([ic, label, href]) =>
      `<a class="clink" href="${esc(href)}"${href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${svg(ic)}<span>${label}</span></a>`).join('');
  }

  /* ---------- Rendu : compétences & projets ---------- */
  const tools = (type, id, label) => `<div class="card-tools">
      <button type="button" class="mini-tool" data-act="edit" data-type="${type}" data-id="${esc(id)}" aria-label="Modifier ${esc(label)}">${svg('pencil')}</button>
      <button type="button" class="mini-tool danger" data-act="del" data-type="${type}" data-id="${esc(id)}" aria-label="Supprimer ${esc(label)}">${svg('trash')}</button></div>`;

  function renderSkills() {
    $('#skillsGrid').innerHTML = data.skills.map((s, i) => `
      <article class="card skill reveal${i === 0 ? ' feat' : ''}" style="--d:${Math.min(i, 6) * 60}ms">
        ${tools('skills', s.id, s.title)}
        <div class="icon-bubble">${svg(s.icon)}</div>
        <h3>${esc(s.title)}</h3>
        <p class="desc">${esc(s.desc)}</p>
      </article>`).join('') +
      `<button type="button" class="add-tile" data-act="add" data-type="skills">${svg('plus')}Ajouter une compétence</button>`;
    afterRender($('#skillsGrid'));
  }

  function renderProjects() {
    $('#projectsGrid').innerHTML = data.projects.map((p, i) => {
      const href = safeUrl(p.link);
      return `
      <article class="card project reveal" style="--d:${Math.min(i, 6) * 60}ms">
        ${tools('projects', p.id, p.name)}
        <div class="top"><div class="icon-bubble">${svg(p.icon)}</div><span class="num">${String(i + 1).padStart(2, '0')}</span></div>
        <h3>${esc(p.name)}</h3>
        <p class="desc">${esc(p.desc)}</p>
        ${href
          ? `<a class="go stretch" href="${esc(href)}" target="_blank" rel="noopener noreferrer">Voir le projet ${svg('external')}<span class="sr" hidden> (nouvel onglet)</span></a>`
          : `<span class="go off">Lien bientôt disponible</span>`}
      </article>`;
    }).join('') + `<button type="button" class="add-tile" data-act="add" data-type="projects">${svg('plus')}Ajouter un projet</button>`;
    afterRender($('#projectsGrid'));
  }

  /* ---------- Révélation au scroll ---------- */
  let io;
  function observeReveal(root = document) {
    const els = $$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
  }
  function afterRender(root) { hydrateIcons(root); observeReveal(root); }

  // Halo qui suit le pointeur sur les cartes
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card');
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); }
  }, { passive: true });

  /* ---------- Carrousel ---------- */
  const car = { i: 0 };
  const carEl = $('#carousel'), slidesEl = $('#slides'), dotsEl = $('#dots'), barEl = $('#progressBar');
  const AUTOPLAY_MS = 5200;

  function renderCarousel(goTo) {
    const n = data.photos.length;
    slidesEl.innerHTML = n
      ? data.photos.map((p, i) => `<div class="slide" role="group" aria-roledescription="diapositive" aria-label="${i + 1} sur ${n}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" draggable="false" ${i === 0 ? '' : 'loading="lazy"'} decoding="async"></div>`).join('')
      : `<div class="carousel-empty">${svg('image')}<p>Aucune photo pour le moment.</p><p>Active le mode édition puis ajoute-en avec le bouton +.</p></div>`;
    dotsEl.innerHTML = n > 1 ? data.photos.map((_, i) => `<button type="button" class="dot-btn" role="tab" aria-label="Photo ${i + 1}" data-i="${i}"></button>`).join('') : '';
    $('#prevBtn').parentElement.hidden = n < 2;
    $('#delPhotoBtn').disabled = !n;
    hydrateIcons(carEl);
    car.i = Math.min(typeof goTo === 'number' ? goTo : car.i, Math.max(n - 1, 0));
    show(car.i);
  }

  function show(i) {
    const n = data.photos.length;
    if (!n) { $('#counter').textContent = '0 / 0'; barEl.classList.remove('run'); return; }
    car.i = (i + n) % n;
    $$('.slide', slidesEl).forEach((s, k) => { s.classList.toggle('is-active', k === car.i); s.setAttribute('aria-hidden', k === car.i ? 'false' : 'true'); });
    $$('.dot-btn', dotsEl).forEach((d, k) => { d.classList.toggle('is-active', k === car.i); d.setAttribute('aria-selected', k === car.i ? 'true' : 'false'); });
    $('#counter').textContent = `${String(car.i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    restartProgress();
  }

  function restartProgress() {
    barEl.classList.remove('run');
    if (reduceMotion || data.photos.length < 2) return;
    void barEl.offsetWidth;
    barEl.style.setProperty('--dur', AUTOPLAY_MS + 'ms');
    barEl.classList.add('run');
  }
  barEl.addEventListener('animationend', () => show(car.i + 1));

  const pause = (v) => carEl.classList.toggle('is-paused', v);
  carEl.addEventListener('pointerenter', () => pause(true));
  carEl.addEventListener('pointerleave', () => pause(false));
  carEl.addEventListener('focusin', () => pause(true));
  carEl.addEventListener('focusout', () => pause(false));
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { carEl.dataset.vis = en.isIntersecting ? '1' : '0'; pause(!en.isIntersecting); }, { threshold: 0.25 }).observe(carEl);

  $('#prevBtn').addEventListener('click', () => show(car.i - 1));
  $('#nextBtn').addEventListener('click', () => show(car.i + 1));
  dotsEl.addEventListener('click', (e) => { const b = e.target.closest('.dot-btn'); if (b) show(+b.dataset.i); });
  carEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(car.i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(car.i + 1); }
  });
  let sx = null;
  carEl.addEventListener('pointerdown', (e) => { if (!e.target.closest('button')) sx = e.clientX; });
  carEl.addEventListener('pointerup', (e) => {
    if (sx === null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 45) show(car.i + (dx < 0 ? 1 : -1));
  });
  carEl.addEventListener('pointercancel', () => { sx = null; });

  // Compression d'image (pour tenir dans le stockage du navigateur)
  function compress(file, max = 1100, q = 0.82) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Image illisible')); };
      img.src = url;
    });
  }
  async function addPhotos(files) {
    if (!isAdmin) return;
    let added = 0;
    for (const f of Array.from(files)) {
      if (!/^image\//.test(f.type)) { toast(`« ${f.name} » n'est pas une image.`, true); continue; }
      try { data.photos.push({ id: uid('p'), src: await compress(f), alt: `${data.profile.name}, photo ${data.photos.length + 1}` }); added++; }
      catch (e) { toast(`Impossible de lire « ${f.name} ».`, true); }
    }
    if (added) { save(); renderCarousel(data.photos.length - 1); renderAdminIfOpen(); toast(added > 1 ? `${added} photos ajoutées` : 'Photo ajoutée'); }
  }
  $('#addPhotoBtn').addEventListener('click', () => $('#photoInput').click());
  $('#photoInput').addEventListener('change', (e) => { addPhotos(e.target.files); e.target.value = ''; });
  $('#delPhotoBtn').addEventListener('click', () => removePhoto(car.i));

  function removePhoto(i) {
    if (!isAdmin || !data.photos[i]) return;
    if (!confirm('Retirer cette photo du carrousel ?')) return;
    data.photos.splice(i, 1); save(); renderCarousel(Math.max(0, i - 1)); renderAdminIfOpen(); toast('Photo retirée');
  }

  /* ---------- Navigation (dock) + scroll-spy ---------- */
  const ids = ['home', 'about', 'skills', 'projects', 'contact'];
  const dockItems = $$('.dock-item');
  function setActive(id) {
    dockItems.forEach((a) => { const on = a.dataset.target === id; a.classList.toggle('is-active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  let ticking = false;
  function spy() {
    ticking = false; let cur = ids[0]; const y = innerHeight * 0.45;
    ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= y) cur = id; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 8) cur = 'contact';
    setActive(cur);
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  addEventListener('resize', spy);
  dockItems.forEach((a) => a.addEventListener('click', () => setActive(a.dataset.target)));

  /* ---------- Authentification de l'espace admin ---------- */
  let isAdmin = sess.get(SESSION_KEY) === '1';
  async function sha(txt) {
    if (window.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
      return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381; for (let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0; return 'x' + (h >>> 0).toString(16);
  }
  const getAuth = () => { try { return JSON.parse(store.get(AUTH_KEY)); } catch (e) { return null; } };
  async function makeAuth(pin) { const salt = uid('salt'); return { salt, hash: await sha(salt + pin) }; }
  async function checkPin(pin) { const a = getAuth(); return !!a && (await sha(a.salt + pin)) === a.hash; }

  function setAdmin(on) {
    isAdmin = on; document.body.classList.toggle('is-admin', on);
    if (on) sess.set(SESSION_KEY, '1'); else sess.del(SESSION_KEY);
  }

  /* ---------- Panneau admin ---------- */
  const adminEl = $('#admin'), scrim = $('#scrim'), body = $('#adminBody');
  const ui = { tab: 'profile', edit: null };
  let lastFocus = null;

  function openAdmin(tab, editId) {
    lastFocus = document.activeElement;
    ui.tab = tab || ui.tab || 'profile'; ui.edit = editId || null;
    adminEl.hidden = false; scrim.hidden = false; document.body.style.overflow = 'hidden';
    renderAdmin(); setTimeout(() => { const f = $('input,textarea,button.tab.is-active', body); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function closeAdmin() {
    adminEl.hidden = true; scrim.hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname + location.search);
  }
  const renderAdminIfOpen = () => { if (!adminEl.hidden && isAdmin) renderAdmin(true); };

  function renderAdmin(keepScroll) {
    const y = body.scrollTop;
    if (!isAdmin) body.innerHTML = authView();
    else body.innerHTML = tabsView() + panelView();
    hydrateIcons(body);
    if (keepScroll) body.scrollTop = y; else body.scrollTop = 0;
  }

  /* Vue : connexion / création du code */
  function authView() {
    const first = !getAuth();
    return `<div class="pin-wrap">
      <div class="icon-bubble">${svg('lock')}</div>
      <h3>${first ? 'Crée ton code d\'accès' : 'Espace administrateur'}</h3>
      <p class="hint">${first ? 'Choisis un code (4 caractères minimum). Il te sera demandé pour modifier ton portfolio sur cet appareil.' : 'Entre ton code pour modifier ton portfolio.'}</p>
      <form data-form="${first ? 'setup' : 'login'}" autocomplete="off">
        <div class="field"><label for="pin">${first ? 'Nouveau code' : 'Code d\'accès'}</label><input id="pin" name="pin" type="password" required minlength="4" autocomplete="${first ? 'new-password' : 'current-password'}"></div>
        ${first ? '<div class="field"><label for="pin2">Confirme le code</label><input id="pin2" name="pin2" type="password" required minlength="4" autocomplete="new-password"></div>' : ''}
        <p class="pin-err" id="pinErr" role="alert"></p>
        <button class="btn primary" type="submit" style="width:100%">${first ? 'Créer et entrer' : 'Entrer'}</button>
      </form></div>`;
  }

  const TABS = [['profile', 'Profil'], ['photos', 'Photos'], ['skills', 'Compétences'], ['projects', 'Projets'], ['data', 'Données']];
  const tabsView = () => `<div class="tabs" role="tablist">${TABS.map(([k, l]) => `<button type="button" role="tab" class="tab${ui.tab === k ? ' is-active' : ''}" data-tab="${k}" aria-selected="${ui.tab === k}">${l}</button>`).join('')}</div>`;

  const field = (id, label, val, o = {}) => `<div class="field"><label for="${id}">${label}</label>${o.area
    ? `<textarea id="${id}" name="${id}" ${o.req ? 'required' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''}>${esc(val)}</textarea>`
    : `<input id="${id}" name="${id}" type="${o.type || 'text'}" value="${esc(val)}" ${o.req ? 'required' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''}>`}${o.hint ? `<small>${o.hint}</small>` : ''}</div>`;

  function panelView() {
    return `<div class="panel">${{ profile: profilePanel, photos: photosPanel, skills: () => collectionPanel('skills'), projects: () => collectionPanel('projects'), data: dataPanel }[ui.tab]()}</div>`;
  }

  function profilePanel() {
    const p = data.profile;
    return `<h3>Informations générales</h3><p class="hint">Ces textes apparaissent sur la page d'accueil, la section Profil et le contact.</p>
    <form data-form="profile">
      <div class="grid2">${field('f_name', 'Nom affiché', p.name, { req: 1 })}${field('f_fullName', 'Nom complet', p.fullName)}</div>
      ${field('f_badge', 'Pastille de disponibilité', p.badge, { hint: 'Laisse vide pour la masquer.' })}
      <div class="grid2">${field('f_heroTitle', 'Titre (ligne 1)', p.heroTitle)}${field('f_headlineAccent', 'Titre (ligne 2, en couleur)', p.headlineAccent)}</div>
      ${field('f_headline', 'Spécialités (petite ligne)', p.headline)}
      ${field('f_intro', 'Texte d\'introduction', p.intro, { area: 1 })}
      ${field('f_aboutTitle', 'Titre de la section Profil', p.aboutTitle)}
      ${field('f_about', 'Texte « À propos »', p.about, { area: 1, hint: 'Saute une ligne pour créer un nouveau paragraphe.' })}
      ${field('f_tags', 'Mots-clés', p.tags.join(', '), { hint: 'Sépare-les par des virgules.' })}
      <div class="sep"></div><h3>Contact</h3>
      ${field('f_email', 'Email', p.email, { type: 'email' })}
      ${field('f_whatsapp', 'WhatsApp', p.whatsapp, { hint: 'Un numéro (+257…) ou un lien wa.me.' })}
      ${field('f_linkedin', 'LinkedIn', p.linkedin)}
      ${field('f_facebook', 'Facebook', p.facebook)}
      <button class="btn primary" type="submit">Enregistrer</button>
    </form>`;
  }

  function photosPanel() {
    const n = data.photos.length;
    return `<h3>Carrousel de photos</h3><p class="hint">Les photos défilent automatiquement sur la page d'accueil, dans cet ordre. Tu peux aussi les gérer directement sur le carrousel avec les boutons + et corbeille.</p>
    <div class="photo-grid">${data.photos.map((p, i) => `
      <div class="ph"><img src="${esc(p.src)}" alt="${esc(p.alt)}"><span class="n">${i + 1}</span>
        <div class="acts">
          <button type="button" class="mini-tool" data-act="ph-left" data-i="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Déplacer vers le début">${svg('left')}</button>
          <button type="button" class="mini-tool danger" data-act="ph-del" data-i="${i}" aria-label="Retirer la photo ${i + 1}">${svg('trash')}</button>
          <button type="button" class="mini-tool" data-act="ph-right" data-i="${i}" ${i === n - 1 ? 'disabled' : ''} aria-label="Déplacer vers la fin">${svg('right')}</button>
        </div></div>`).join('') || '<p class="hint">Aucune photo.</p>'}</div>
    <button type="button" class="btn primary" data-act="ph-add">${svg('plus')} Ajouter des photos</button>
    <p class="hint" style="margin-top:12px">Les photos sont réduites automatiquement (1100 px) pour économiser l'espace.</p>`;
  }

  const pickerView = (sel) => `<div class="field"><label>Icône</label><div class="icon-picker" role="radiogroup" aria-label="Icône">${PICKABLE.map(([k, l]) =>
    `<label class="pick" title="${l}"><input type="radio" name="icon" value="${k}" ${k === sel ? 'checked' : ''}><span>${svg(k)}<em>${l}</em></span></label>`).join('')}</div></div>`;

  function collectionPanel(type) {
    const isS = type === 'skills'; const arr = data[type];
    const cur = ui.edit ? arr.find((x) => x.id === ui.edit) : null;
    const items = arr.map((x, i) => `<div class="item${cur && cur.id === x.id ? ' is-editing' : ''}">
        <div class="icon-bubble">${svg(x.icon)}</div>
        <div class="meta"><b>${esc(isS ? x.title : x.name)}</b><span>${esc(isS ? x.desc : (x.link || 'Sans lien'))}</span></div>
        <div class="item-tools">
        <button type="button" class="mini-tool" data-act="up" data-type="${type}" data-id="${esc(x.id)}" ${i === 0 ? 'disabled style="opacity:.3"' : ''} aria-label="Monter">${svg('up')}</button>
        <button type="button" class="mini-tool" data-act="down" data-type="${type}" data-id="${esc(x.id)}" ${i === arr.length - 1 ? 'disabled style="opacity:.3"' : ''} aria-label="Descendre">${svg('down')}</button>
        <button type="button" class="mini-tool" data-act="edit-in" data-type="${type}" data-id="${esc(x.id)}" aria-label="Modifier">${svg('pencil')}</button>
        <button type="button" class="mini-tool danger" data-act="del" data-type="${type}" data-id="${esc(x.id)}" aria-label="Supprimer">${svg('trash')}</button>
        </div>
      </div>`).join('');
    const form = isS
      ? `${field('c_title', 'Titre', cur ? cur.title : '', { req: 1, ph: 'Ex. WiFi Zone & MikroTik' })}${field('c_desc', 'Description', cur ? cur.desc : '', { area: 1, ph: 'Ce que tu fais, avec quels outils…' })}`
      : `${field('c_name', 'Nom du projet', cur ? cur.name : '', { req: 1, ph: 'Ex. JENOVA' })}${field('c_desc', 'Description', cur ? cur.desc : '', { area: 1, ph: 'En une ou deux phrases…' })}${field('c_link', 'Lien vers le projet', cur ? cur.link : '', { type: 'text', ph: 'https://…', hint: 'Optionnel. https:// est ajouté automatiquement.' })}`;
    return `<h3>${isS ? 'Compétences' : 'Projets'} (${arr.length})</h3>
      <p class="hint">${isS ? 'La première compétence est mise en avant en grand. Utilise les flèches pour changer l\'ordre.' : 'Utilise les flèches pour changer l\'ordre d\'affichage.'}</p>
      <div class="list">${items || '<p class="hint">Rien pour le moment.</p>'}</div>
      <div class="sep"></div>
      <h3>${cur ? 'Modifier' : (isS ? 'Ajouter une compétence' : 'Ajouter un projet')}</h3>
      <form data-form="${type}" data-id="${cur ? esc(cur.id) : ''}">
        ${form}${pickerView(cur ? cur.icon : (isS ? 'wifi' : 'layers'))}
        <div class="row"><button class="btn primary" type="submit">${cur ? 'Enregistrer' : 'Ajouter'}</button>${cur ? '<button type="button" class="btn glass" data-act="cancel-edit">Annuler</button>' : ''}</div>
      </form>`;
  }

  function dataPanel() {
    return `<h3>Sauvegarde & publication</h3>
      <div class="notice warn"><b>Important :</b> tes modifications sont enregistrées dans <u>ce navigateur</u>. Les visiteurs ne les voient pas tant que tu ne les as pas publiées : exporte le fichier <b>data.js</b>, puis remplace <code>js/data.js</code> sur ton hébergement.</div>
      <div class="row" style="margin-bottom:12px">
        <button type="button" class="btn primary small" data-act="export-js">${svg('download')} Exporter data.js (publier)</button>
        <button type="button" class="btn glass small" data-act="export-json">${svg('download')} Sauvegarde .json</button>
        <button type="button" class="btn glass small" data-act="import">${svg('upload')} Importer</button>
        <input type="file" id="importInput" accept=".json,.js,application/json,text/javascript" hidden>
      </div>
      <button type="button" class="btn danger small" data-act="reset">Revenir à la version publiée</button>
      <div class="sep"></div>
      <h3>Changer le code d'accès</h3>
      <form data-form="pin">
        <div class="field"><label for="p_old">Code actuel</label><input id="p_old" name="old" type="password" required autocomplete="current-password"></div>
        <div class="grid2"><div class="field"><label for="p_new">Nouveau code</label><input id="p_new" name="new" type="password" required minlength="4" autocomplete="new-password"></div>
        <div class="field"><label for="p_new2">Confirmation</label><input id="p_new2" name="new2" type="password" required minlength="4" autocomplete="new-password"></div></div>
        <button class="btn glass small" type="submit">Changer le code</button>
      </form>
      <div class="sep"></div>
      <button type="button" class="btn glass small" data-act="logout">${svg('lock')} Quitter le mode édition</button>
      <p class="hint" style="margin-top:14px">Ce code protège l'accès à l'édition dans ton navigateur. Il ne remplace pas la sécurité d'un vrai serveur : ne l'utilise pas pour protéger des informations confidentielles.</p>`;
  }

  /* ---------- Actions admin ---------- */
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const renderAll = () => { renderProfile(); renderCarousel(); renderSkills(); renderProjects(); hydrateIcons(); observeReveal(); };

  function move(arr, id, d) {
    const i = arr.findIndex((x) => x.id === id), j = i + d; if (i < 0 || j < 0 || j >= arr.length) return false;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return true;
  }

  function onAction(btn) {
    const { act, type, id } = btn.dataset; const arr = data[type];
    switch (act) {
      case 'add': if (isAdmin) openAdmin(type, null); break;
      case 'edit': case 'edit-in': if (isAdmin) { ui.tab = type; ui.edit = id; if (adminEl.hidden) openAdmin(type, id); else renderAdmin(); const f = $('form input[type=text],form input:not([type])', body); setTimeout(() => f && f.focus(), 50); } break;
      case 'cancel-edit': ui.edit = null; renderAdmin(true); break;
      case 'del': {
        if (!isAdmin) break; const it = arr.find((x) => x.id === id); if (!it) break;
        if (!confirm(`Supprimer « ${it.title || it.name} » ?`)) break;
        data[type] = arr.filter((x) => x.id !== id); if (ui.edit === id) ui.edit = null;
        save(); type === 'skills' ? renderSkills() : renderProjects(); renderAdminIfOpen(); toast('Supprimé'); break;
      }
      case 'up': case 'down': if (move(arr, id, act === 'up' ? -1 : 1)) { save(); type === 'skills' ? renderSkills() : renderProjects(); renderAdminIfOpen(); } break;
      case 'ph-add': $('#photoInput').click(); break;
      case 'ph-del': removePhoto(+btn.dataset.i); break;
      case 'ph-left': case 'ph-right': {
        const i = +btn.dataset.i, j = i + (act === 'ph-left' ? -1 : 1);
        if (data.photos[j]) { [data.photos[i], data.photos[j]] = [data.photos[j], data.photos[i]]; save(); renderCarousel(j); renderAdminIfOpen(); }
        break;
      }
      case 'export-js': download('data.js', `/* Données du portfolio, exportées le ${new Date().toLocaleString('fr-FR')}.\n   Remplace js/data.js par ce fichier pour publier tes modifications. */\nwindow.DEFAULT_DATA = ${JSON.stringify(data, null, 2)};\n`, 'text/javascript'); toast('data.js exporté'); break;
      case 'export-json': download('portfolio-sauvegarde.json', JSON.stringify(data, null, 2), 'application/json'); toast('Sauvegarde exportée'); break;
      case 'import': $('#importInput').click(); break;
      case 'reset': if (confirm('Effacer tes modifications locales et revenir à la version publiée (data.js) ?')) { store.del(KEY); data = normalize(null); ui.edit = null; renderAll(); renderAdmin(true); toast('Version publiée restaurée'); } break;
      case 'logout': setAdmin(false); closeAdmin(); toast('Mode édition quitté'); break;
    }
  }

  async function onSubmit(form) {
    const kind = form.dataset.form; const fd = new FormData(form); const v = (k) => str(fd.get(k)).trim();
    if (kind === 'setup' || kind === 'login') {
      const err = $('#pinErr'); const pin = str(fd.get('pin'));
      if (kind === 'setup') {
        if (pin.length < 4) { err.textContent = '4 caractères minimum.'; return; }
        if (pin !== str(fd.get('pin2'))) { err.textContent = 'Les deux codes sont différents.'; return; }
        store.set(AUTH_KEY, JSON.stringify(await makeAuth(pin)));
      } else if (!(await checkPin(pin))) {
        err.textContent = 'Code incorrect.'; await new Promise((r) => setTimeout(r, 600)); return;
      }
      setAdmin(true); renderAdmin(); toast('Mode édition activé'); return;
    }
    if (!isAdmin) return;
    if (kind === 'profile') {
      const p = data.profile; const g = (k) => v('f_' + k);
      Object.assign(p, { name: g('name') || p.name, fullName: g('fullName'), badge: g('badge'), heroTitle: g('heroTitle'), headlineAccent: g('headlineAccent'), headline: g('headline'), intro: str(fd.get('f_intro')).trim(), aboutTitle: g('aboutTitle'), about: str(fd.get('f_about')).trim(), tags: g('tags').split(',').map((t) => t.trim()).filter(Boolean), email: g('email'), whatsapp: g('whatsapp'), linkedin: g('linkedin'), facebook: g('facebook') });
      save(); renderProfile(); toast('Profil enregistré'); return;
    }
    if (kind === 'skills' || kind === 'projects') {
      const icon = ICONS[v('icon')] ? v('icon') : 'layers'; const id = form.dataset.id;
      let item;
      if (kind === 'skills') { if (!v('c_title')) return; item = { icon, title: v('c_title'), desc: str(fd.get('c_desc')).trim() }; }
      else {
        if (!v('c_name')) return;
        const raw = v('c_link'); const link = safeUrl(raw);
        if (raw && !link) { toast('Ce lien n\'est pas valide (http ou https).', true); return; }
        item = { icon, name: v('c_name'), desc: str(fd.get('c_desc')).trim(), link };
      }
      const arr = data[kind];
      if (id) { const t = arr.find((x) => x.id === id); if (t) Object.assign(t, item); } else arr.push({ id: uid(kind === 'skills' ? 's' : 'j'), ...item });
      ui.edit = null; save(); kind === 'skills' ? renderSkills() : renderProjects(); renderAdmin(!id ? false : true); toast(id ? 'Modifications enregistrées' : (kind === 'skills' ? 'Compétence ajoutée' : 'Projet ajouté')); return;
    }
    if (kind === 'pin') {
      if (!(await checkPin(str(fd.get('old'))))) { toast('Code actuel incorrect.', true); return; }
      if (str(fd.get('new')) !== str(fd.get('new2'))) { toast('Les nouveaux codes sont différents.', true); return; }
      store.set(AUTH_KEY, JSON.stringify(await makeAuth(str(fd.get('new'))))); form.reset(); toast('Code modifié');
    }
  }

  async function importFile(file) {
    try {
      let txt = await file.text();
      const m = txt.match(/window\.DEFAULT_DATA\s*=\s*([\s\S]*?);?\s*$/); if (m) txt = m[1];
      const next = normalize(JSON.parse(txt));
      if (!confirm('Remplacer le contenu actuel par ce fichier ?')) return;
      data = next; save(); ui.edit = null; renderAll(); renderAdmin(true); toast('Données importées');
    } catch (e) { toast('Fichier invalide : utilise un .json ou un data.js exporté ici.', true); }
  }

  /* ---------- Événements globaux ---------- */
  body.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]'); if (tab) { ui.tab = tab.dataset.tab; ui.edit = null; renderAdmin(); return; }
    const b = e.target.closest('[data-act]'); if (b) onAction(b);
  });
  body.addEventListener('submit', (e) => { e.preventDefault(); onSubmit(e.target); });
  body.addEventListener('change', (e) => { if (e.target.id === 'importInput' && e.target.files[0]) { importFile(e.target.files[0]); e.target.value = ''; } });
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open-admin]'); if (o) { openAdmin(o.dataset.openAdmin); return; }
    const b = e.target.closest('.card-tools [data-act], .add-tile[data-act]'); if (b) { e.preventDefault(); onAction(b); }
  });
  $('#closeAdmin').addEventListener('click', closeAdmin);
  scrim.addEventListener('click', closeAdmin);
  $('#exitEdit').addEventListener('click', () => { setAdmin(false); toast('Mode édition quitté'); });
  document.addEventListener('keydown', (e) => {
    if (adminEl.hidden) return;
    if (e.key === 'Escape') { closeAdmin(); return; }
    if (e.key === 'Tab') { // piège le focus dans le panneau
      const f = $$('button:not([disabled]), input:not([hidden]), textarea, select, a[href]', adminEl).filter((x) => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener('hashchange', () => { if (location.hash === '#admin') openAdmin('profile'); });

  /* ---------- Démarrage ---------- */
  hydrateIcons();
  if (!data.profile.heroTitle) data.profile.heroTitle = DEF.profile.heroTitle;
  document.body.classList.toggle('is-admin', isAdmin);
  renderAll(); spy();
  if (location.hash === '#admin') openAdmin('profile');
})();
