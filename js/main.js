(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.getElementById('navToggle');
  var callbar = document.querySelector('.callbar');

  // Nav shadow + mobile call bar
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    if (callbar) callbar.classList.toggle('is-visible', y > 400);
    document.body.classList.toggle('callbar-on', y > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    toggle.setAttribute('aria-expanded', nav.classList.toggle('is-open'));
  });
  document.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Services dropdown: the arrow button toggles it (tap on phones, Enter/Space on keyboard)
  document.querySelectorAll('.nav__drop').forEach(function (d) {
    var btn = d.querySelector('.nav__drop-btn');
    btn.addEventListener('click', function () { btn.setAttribute('aria-expanded', d.classList.toggle('is-open')); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('is-open')) { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!d.contains(e.target)) { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });

  // Respect reduced-motion: keep the banner on its still poster
  var heroVid = document.querySelector('.hero__photo video');
  if (heroVid && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { heroVid.removeAttribute('autoplay'); heroVid.pause(); }

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
  if (form) document.querySelectorAll('[data-service], [data-pick]').forEach(function (card) {
    card.addEventListener('click', function () {
      var sel = form.elements.service, want = (card.dataset.service || card.dataset.pick).toLowerCase();
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.text.toLowerCase() === want) sel.value = o.value;
      });
    });
  });

  // Lightbox with prev/next, keyboard and swipe
  var lb = document.getElementById('lightbox');
  if (lb) (function () {
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
  })();

  // ?service=deck on a link from another page pre-selects the project type
  var want = (location.search.match(/[?&]service=([^&]+)/) || [])[1];
  if (form && want) {
    want = decodeURIComponent(want).toLowerCase();
    Array.prototype.forEach.call(form.elements.service.options, function (o) {
      if (o.text.toLowerCase().indexOf(want) === 0) form.elements.service.value = o.value;
    });
  }

  // Quote form -> email via FormSubmit, with a pre-filled text as backup
  var LEAD_URL = 'https://formsubmit.co/ajax/Expresservicescl@gmail.com';
  var note = document.getElementById('formNote');
  function smsHref(msg) {
    var sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
    return 'sms:+16177784403' + sep + 'body=' + encodeURIComponent(msg);
  }
  if (form) form.addEventListener('submit', function (e) {
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
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; note.textContent = 'Sending...';
    fetch(LEAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'New estimate request: ' + d.service.value + ' (' + d.name.value + ')',
        _template: 'table', _captcha: 'false',
        'Project type': d.service.value, Name: d.name.value, Phone: d.phone.value,
        Town: d.town.value, Details: d.details.value, Source: 'Website estimate form'
      })
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw 0; }); })
      .then(function () {
        form.reset();
        note.textContent = 'Thanks! Your request was sent. We\'ll be in touch soon.';
      })
      .catch(function () {
        note.innerHTML = 'We couldn\'t send that online. <a href="' + smsHref(msg) + '">Text it to us</a> or call 617-778-4403.';
      })
      .then(function () { btn.disabled = false; });
  });

  // Free estimate promo: swipeable photos that rotate every 5 seconds
  var promo = document.querySelector('.promo');
  if (promo) (function () {
    var track = promo.querySelector('.promo__track');
    var slides = track.children, dotsBox = promo.querySelector('.promo__dots');
    var dots = [], cur = 0, timer = null;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(i) { cur = (i + slides.length) % slides.length; track.scrollTo({ left: cur * track.clientWidth, behavior: 'smooth' }); mark(); }
    function mark() { dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === cur ? 'true' : 'false'); }); }
    Array.prototype.forEach.call(slides, function (s, k) {
      var d = document.createElement('button'); d.type = 'button'; d.setAttribute('role', 'tab'); d.setAttribute('aria-label', 'Photo ' + (k + 1));
      d.addEventListener('click', function () { go(k); restart(); });
      dotsBox.appendChild(d); dots.push(d);
    });
    track.addEventListener('scroll', function () { var k = Math.round(track.scrollLeft / track.clientWidth); if (k !== cur) { cur = k; mark(); } }, { passive: true });
    function restart() { if (still) return; clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 5000); }
    promo.addEventListener('mouseenter', function () { clearInterval(timer); });
    promo.addEventListener('mouseleave', restart);
    promo.addEventListener('focusin', function () { clearInterval(timer); });
    track.addEventListener('touchstart', function () { clearInterval(timer); }, { passive: true });
    track.addEventListener('touchend', restart, { passive: true });
    mark(); restart();
  })();

  // Videos: show the full frame while playing; pause others when one starts
  var vids = document.querySelectorAll('.vid video');
  Array.prototype.forEach.call(vids, function (v) {
    var card = v.closest('.vid');
    v.addEventListener('play', function () {
      card.classList.add('is-playing');
      Array.prototype.forEach.call(vids, function (o) { if (o !== v && !o.paused) o.pause(); });
    });
  });

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
