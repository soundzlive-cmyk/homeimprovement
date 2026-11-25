/* Project intake assistant: a guided chat that collects job details
   and hands them off as a pre-filled text message (no backend needed). */
(function () {
  var PHONE = '16177784403';
  var PHONE_PRETTY = '617-778-4403';
  var LEAD_URL = 'https://formsubmit.co/ajax/Expresservicescl@gmail.com';

  var steps = [
    { key: 'service', ask: "Hi! I'm the Express Home Improvement assistant. What kind of project can we help with?",
      chips: ['Interior painting', 'Bathroom remodel', 'Kitchen', 'Roofing', 'Deck or patio', 'Plumbing / electrical', 'Repairs', 'Something else'] },
    { key: 'details', ask: 'Great choice. Tell me a little about the job: rooms, size, what needs doing.',
      input: 'text', placeholder: 'e.g. Repaint 2 bedrooms and a hallway', optional: true },
    { key: 'timeline', ask: 'When would you like to get started?',
      chips: ['As soon as possible', 'Within a month', '1 to 3 months', 'Just planning'] },
    { key: 'budget', ask: 'Do you have a budget range in mind?',
      chips: ['Under $5k', '$5k to $15k', '$15k to $40k', '$40k+', 'Not sure yet'] },
    { key: 'town', ask: 'Which town is the project in?', input: 'text', placeholder: 'e.g. Brockton', optional: true },
    { key: 'name', ask: "Thanks! What's your name?", input: 'text', placeholder: 'Your name', required: true },
    { key: 'phone', ask: 'And the best phone number to reach you?', input: 'tel', placeholder: '(555) 555-5555', required: true,
      validate: function (v) { return v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a 10-digit phone number.'; } },
    { key: 'email', ask: 'Email address? (optional)', input: 'email', placeholder: 'you@example.com', optional: true,
      validate: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'That email looks off. Fix it or tap Skip.'; } }
  ];

  var labels = { service: 'Project', details: 'Details', timeline: 'Timeline', budget: 'Budget', town: 'Town', name: 'Name', phone: 'Phone', email: 'Email' };
  var answers = {}, idx = 0, started = false;

  // ---- DOM ----
  var launcher = el('button', 'intake-launch', '<span class="intake-launch__dot"></span>Start your project');
  launcher.setAttribute('aria-haspopup', 'dialog');
  var panel = el('div', 'intake');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Project intake assistant');
  panel.innerHTML =
    '<div class="intake__head">' +
      '<div><strong>Project Assistant</strong><span>Express Home Improvement · usually replies the same day</span></div>' +
      '<button class="intake__x" aria-label="Close">×</button>' +
    '</div>' +
    '<div class="intake__log" aria-live="polite"></div>' +
    '<div class="intake__ctrl"></div>';
  document.body.appendChild(launcher);
  document.body.appendChild(panel);
  var log = panel.querySelector('.intake__log');
  var ctrl = panel.querySelector('.intake__ctrl');

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function scroll() { log.scrollTop = log.scrollHeight; }

  function bot(text, cb) {
    var typing = el('div', 'msg msg--bot msg--typing', '<span></span><span></span><span></span>');
    log.appendChild(typing); scroll();
    setTimeout(function () {
      typing.className = 'msg msg--bot'; typing.innerHTML = text; scroll();
      if (cb) cb();
    }, 550);
  }
  function me(text) { log.appendChild(el('div', 'msg msg--me', esc(text))); scroll(); }

  function ask() {
    ctrl.innerHTML = '';
    if (idx >= steps.length) return summary();
    var st = steps[idx];
    bot(st.ask, function () { st.chips ? showChips(st) : showInput(st); });
  }

  function showChips(st) {
    var wrap = el('div', 'intake__chips');
    st.chips.forEach(function (c) {
      var b = el('button', 'chip', esc(c));
      b.type = 'button';
      b.addEventListener('click', function () { answer(st, c); });
      wrap.appendChild(b);
    });
    ctrl.appendChild(wrap);
  }

  function showInput(st) {
    var f = el('form', 'intake__form');
    f.innerHTML = '<input type="' + st.input + '" placeholder="' + esc(st.placeholder || '') + '" aria-label="' + esc(labels[st.key]) + '"' +
      (st.input === 'tel' ? ' autocomplete="tel"' : st.key === 'name' ? ' autocomplete="name"' : st.input === 'email' ? ' autocomplete="email"' : '') + '>' +
      '<button type="submit" class="intake__send" aria-label="Send">➤</button>';
    var err = el('p', 'intake__err');
    ctrl.appendChild(f);
    if (st.optional) {
      var skip = el('button', 'intake__skip', 'Skip');
      skip.type = 'button';
      skip.addEventListener('click', function () { answer(st, ''); });
      ctrl.appendChild(skip);
    }
    ctrl.appendChild(err);
    var input = f.querySelector('input');
    setTimeout(function () { input.focus(); }, 50);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v && st.required) { err.textContent = 'This one is needed so we can reach you.'; return; }
      if (!v && st.optional) return answer(st, '');
      var problem = st.validate ? st.validate(v) : '';
      if (problem) { err.textContent = problem; return; }
      answer(st, v);
    });
  }

  function answer(st, v) {
    answers[st.key] = v;
    me(v || 'Skip');
    idx++;
    ask();
  }

  function message() {
    var lines = ['New project request (website assistant)'];
    steps.forEach(function (s) { if (answers[s.key]) lines.push(labels[s.key] + ': ' + answers[s.key]); });
    return lines.join('\n');
  }

  function summary() {
    var rows = steps.filter(function (s) { return answers[s.key]; })
      .map(function (s) { return '<li><b>' + labels[s.key] + '</b> ' + esc(answers[s.key]) + '</li>'; }).join('');
    bot('Here\'s what I have:<ul class="intake__sum">' + rows + '</ul>Tap <b>Send Request</b> and it goes straight to our team.', function () {
      var wrap = el('div', 'intake__final');
      var send = el('button', 'btn btn--primary btn--block', 'Send Request');
      send.type = 'button';
      var sep = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
      var sms = el('a', 'btn btn--outline btn--block', 'Text it to us instead');
      sms.href = 'sms:+' + PHONE + sep + 'body=' + encodeURIComponent(message());
      var restart = el('button', 'intake__skip', 'Start over');
      restart.type = 'button';
      restart.addEventListener('click', reset);
      send.addEventListener('click', function () {
        send.disabled = true; send.textContent = 'Sending...';
        var data = { _subject: 'New project request: ' + answers.service + ' (' + answers.name + ')', _template: 'table', _captcha: 'false', Source: 'Website project assistant' };
        steps.forEach(function (s) { if (answers[s.key]) data[labels[s.key]] = answers[s.key]; });
        if (answers.email) data._replyto = answers.email;
        fetch(LEAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw 0; }); })
          .then(function () {
            ctrl.innerHTML = '';
            var done = el('div', 'intake__final'); done.appendChild(restart); ctrl.appendChild(done);
            bot('Thanks, ' + esc(answers.name.split(' ')[0]) + '! Your request is in. We usually reply the same day. Have photos? Text them to <a href="tel:' + PHONE + '">' + PHONE_PRETTY + '</a>.');
          })
          .catch(function () {
            send.disabled = false; send.textContent = 'Try again';
            bot('Sorry, that didn\'t go through. Tap <b>Text it to us instead</b>, or call <a href="tel:' + PHONE + '">' + PHONE_PRETTY + '</a>.');
          });
      });
      wrap.appendChild(send); wrap.appendChild(sms); wrap.appendChild(restart);
      ctrl.appendChild(wrap);
    });
  }

  function reset() { answers = {}; idx = 0; log.innerHTML = ''; ask(); }

  function open() {
    panel.hidden = false; launcher.classList.add('is-hidden');
    document.body.classList.add('intake-open');
    if (!started) { started = true; ask(); }
    panel.querySelector('.intake__x').focus();
  }
  function close() {
    panel.hidden = true; launcher.classList.remove('is-hidden');
    document.body.classList.remove('intake-open');
    launcher.focus();
  }
  launcher.addEventListener('click', open);
  panel.querySelector('.intake__x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });

  // Any link or button marked data-intake opens the assistant
  document.querySelectorAll('[data-intake]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
})();
