/* The Barrel — vanilla JS: mobile drawer, scroll reveal, menu filters, lightbox, reservation submit */
(function () {
  'use strict';

  /* ---- mobile drawer ---- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.mobile-drawer');
  if (toggle && drawer) {
    var close = drawer.querySelector('.mobile-drawer__close');
    var open = function () { drawer.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    var shut = function () { drawer.classList.remove('is-open'); document.body.style.overflow = ''; };
    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    drawer.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', shut); });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- category / country filter chips (menu + wine pages) ---- */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var chips = group.querySelectorAll('[data-filter]');
    var targets = document.querySelectorAll('[data-filter-item]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var val = chip.getAttribute('data-filter');
        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', c === chip); });
        targets.forEach(function (t) {
          var show = val === 'all' || t.getAttribute('data-filter-item') === val;
          t.style.display = show ? '' : 'none';
        });
      });
    });
  });

  /* ---- gallery lightbox ---- */
  var lb = document.querySelector('[data-lightbox]');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-lightbox-src]').forEach(function (el) {
      el.addEventListener('click', function () {
        lbImg.src = el.getAttribute('data-lightbox-src');
        lbImg.alt = el.getAttribute('data-lightbox-alt') || '';
        lb.classList.add('is-open');
      });
    });
    lb.addEventListener('click', function () { lb.classList.remove('is-open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('is-open'); });
  }

  /* ---- reservation form → Apps Script Web App ---- */
  var form = document.querySelector('[data-reservation-form]');
  if (form) {
    var endpoint = form.getAttribute('data-endpoint') || '';
    var statusEl = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var setStatus = function (msg, kind) {
        if (statusEl) { statusEl.textContent = msg; statusEl.setAttribute('data-kind', kind || ''); }
      };
      if (!endpoint) {
        setStatus('Hệ thống đặt bàn chưa được cấu hình. Vui lòng gọi hotline để đặt bàn.', 'error');
        return;
      }
      var data = Object.fromEntries(new FormData(form).entries());
      data.submittedAt = new Date().toISOString();
      if (submitBtn) { submitBtn.disabled = true; }
      setStatus('Đang gửi yêu cầu…', 'pending');
      fetch(endpoint, {
        method: 'POST',
        // text/plain avoids a CORS preflight to Apps Script Web App
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            form.reset();
            setStatus('Đã nhận yêu cầu đặt bàn! Nhà hàng sẽ liên hệ xác nhận trong thời gian sớm nhất.', 'ok');
          } else {
            setStatus('Không gửi được yêu cầu. Vui lòng gọi hotline để đặt bàn.', 'error');
          }
        })
        .catch(function () {
          setStatus('Không gửi được yêu cầu. Vui lòng gọi hotline để đặt bàn.', 'error');
        })
        .finally(function () { if (submitBtn) { submitBtn.disabled = false; } });
    });
  }
})();
