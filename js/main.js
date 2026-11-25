(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.nav');
  var toggle = document.getElementById('navToggle');
  var callbar = document.querySelector('.callbar');
  var bar = document.querySelector('.progress span');
  var heroImg = document.querySelector('.hero__media img');
  var aboutImg = document.querySelector('.about__media img');

  // Scroll: nav state, progress bar, call bar, light parallax
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 40);
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (callbar) callbar.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    if (!reduce) {
      if (heroImg && y < window.innerHeight) heroImg.parentNode.style.transform = 'translateY(' + y * 0.25 + 'px)';
      if (aboutImg) {
        var r = aboutImg.parentNode.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          aboutImg.style.transform = 'translateY(' + (-7 + p * 10) + '%)';
        }
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Mobile menu
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Active section in nav
  var spyLinks = document.querySelectorAll('[data-spy]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        spyLinks.forEach(function (l) { l.classList.toggle('is-active', l.dataset.spy === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyLinks.forEach(function (l) { var s = document.getElementById(l.dataset.spy); if (s) spy.observe(s); });
  }

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 4) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Hero rotating word
  var words = document.querySelectorAll('.rotator__word');
  if (words.length && !reduce) {
    var wi = 0;
    setInterval(function () {
      var cur = words[wi];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      setTimeout(function () { cur.classList.remove('is-out'); }, 700);
      wi = (wi + 1) % words.length;
      words[wi].classList.add('is-on');
    }, 2400);
  }

  // Magnetic buttons (desktop pointer only)
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.3 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  // Services: interactive list with image preview
  var svcItems = document.querySelectorAll('.svc__item');
  var svcImgs = document.querySelectorAll('.svc__preview img');
  function setSvc(i) {
    svcItems.forEach(function (b, j) {
      b.classList.toggle('is-active', i === j);
      b.setAttribute('aria-selected', i === j);
    });
    svcImgs.forEach(function (img, j) { img.classList.toggle('is-on', i === j); });
  }
  svcItems.forEach(function (b, i) {
    b.addEventListener('click', function () { setSvc(i); });
    b.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover) and (min-width: 961px)').matches) setSvc(i);
    });
  });

  // Gallery: drag to scroll, arrow buttons
  var gal = document.getElementById('gallery');
  var down = false, moved = false, sx = 0, sl = 0;
  gal.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; sx = e.clientX; sl = gal.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; gal.classList.add('is-drag'); }
    gal.scrollLeft = sl - dx;
  });
  window.addEventListener('pointerup', function () {
    if (!down) return;
    down = false;
    setTimeout(function () { gal.classList.remove('is-drag'); }, 0);
  });
  document.querySelectorAll('.gal-ctrl .round').forEach(function (b) {
    b.addEventListener('click', function () {
      gal.scrollBy({ left: +b.dataset.dir * gal.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // Lightbox with prev/next, keyboard and swipe
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCount = lb.querySelector('.lightbox__count');
  var shots = Array.prototype.map.call(document.querySelectorAll('.gallery__item img'), function (i) { return i; });
  var cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].src; lbImg.alt = shots[cur].alt;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbCount.textContent = (cur + 1) + ' / ' + shots.length;
  }
  document.querySelectorAll('.gallery__item').forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      if (moved) { moved = false; return; }
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

  // Quote form: two steps, then a pre-filled text message (no backend needed)
  var form = document.getElementById('quoteForm');
  var note = document.getElementById('formNote');
  var steps = form.querySelectorAll('.form__step');
  var dots = form.querySelectorAll('.form__steps span');
  function go(n) {
    steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n); });
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i <= n); });
    var f = steps[n].querySelector('input:not([type=radio]), textarea');
    if (f && n > 0) f.focus();
  }
  form.querySelector('[data-next]').addEventListener('click', function () { go(1); });
  form.querySelector('[data-back]').addEventListener('click', function () { go(0); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'phone'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim();
      f.classList.remove('is-invalid'); void f.offsetWidth;
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = 'Please add your name and phone number.'; return; }

    var d = form.elements;
    var msg = 'Quote request - ' + d.service.value +
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
