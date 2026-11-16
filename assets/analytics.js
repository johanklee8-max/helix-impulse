/* Cookieless website analytics with PostHog (EU cloud).
 * Nothing is stored on the visitor's device (persistence: memory), no session recordings,
 * and visitors with "Do Not Track" are not tracked. Does nothing until POSTHOG_KEY is set. */
(function () {
  var POSTHOG_KEY = 'phc_ttciWc3qRDm9g3RGoGepTe4R36f38UzcqnUmR2c2t26c';
  var POSTHOG_HOST = 'https://eu.i.posthog.com';
  if (!POSTHOG_KEY) return;

  // Official PostHog loader snippet (loads posthog-js from the EU asset host)
  !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split('.'); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement('script')).type = 'text/javascript', p.crossOrigin = 'anonymous', p.async = !0, p.src = s.api_host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js', (r = t.getElementsByTagName('script')[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = 'posthog', u.people = u.people || [], u.toString = function (t) { var e = 'posthog'; return 'posthog' !== a && (e += '.' + a), t || (e += ' (stub)'), e }, u.people.toString = function () { return u.toString(1) + '.people (stub)' }, o = 'init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset'.split(' '), n = 0; n < o.length; n++) g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'memory',          // no cookies, no localStorage
    person_profiles: 'identified_only',
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true
  });

  var page = location.pathname.replace(/^.*\//, '') || 'index.html';
  var lang = function () { return document.documentElement.lang || 'en'; };

  // Video starts (home page videos and tutorials)
  document.addEventListener('play', function (e) {
    var v = e.target;
    if (!v || v.tagName !== 'VIDEO' || v.dataset.tracked) return;
    v.dataset.tracked = '1';
    posthog.capture('video_play', { video: (v.getAttribute('src') || '').split('/').pop(), page: page, lang: lang() });
  }, true);

  // Contact form submissions (only valid ones)
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id !== 'contact-form' || !f.checkValidity()) return;
    var type = f.querySelector('select[name=type]');
    posthog.capture('contact_form_submit', { request: type ? type.value : '', page: page, lang: lang() });
  }, true);

  // Language switches
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.locale button');
    if (b) posthog.capture('language_switch', { to: b.dataset.lang || b.dataset.set, page: page });
  }, true);
})();
