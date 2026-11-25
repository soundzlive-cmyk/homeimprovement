(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.getElementById('navToggle');
  var callbar = document.querySelector('.callbar');

  // Nav shadow + mobile call bar
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    if (callbar) callbar.classList.toggle('is-visible', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    toggle.setAttribute('aria-expanded', nav.classList.toggle('is-open'));
  });
  document.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Service cards pre-select the project type in the form
  var form = document.getElementById('quoteForm');
  document.querySelectorAll('.service[data-service]').forEach(function (card) {
    card.addEventListener('click', function () {
      var sel = form.elements.service, want = card.dataset.service.toLowerCase();
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.text.toLowerCase() === want) sel.value = o.value;
      });
    });
  });

  // Lightbox with prev/next, keyboard and swipe
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var shots = Array.prototype.slice.call(document.querySelectorAll('.gallery__item img'));
  var cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].src; lbImg.alt = shots[cur].alt;
  }
  document.querySelectorAll('.gallery__item').forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      lastFocus = btn; show(i); lb.hidden = false; document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    });
  });
  function closeLb() { lb.hidden = true; lbImg.src = ''; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
  lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.lightbox__next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });

  // Quote form -> pre-filled text message (no backend needed yet)
  var note = document.getElementById('formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'phone'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim();
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please add your name and phone number.'; return; }
    var d = form.elements;
    var msg = 'Estimate request - ' + d.service.value +
      '\nName: ' + d.name.value +
      '\nPhone: ' + d.phone.value +
      (d.town.value ? '\nTown: ' + d.town.value : '') +
      (d.details.value ? '\nDetails: ' + d.details.value : '');
    var sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
    window.location.href = 'sms:+16177784403' + sep + 'body=' + encodeURIComponent(msg);
    note.textContent = 'Opening your messages app… If nothing happens, call 617-778-4403.';
  });

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
