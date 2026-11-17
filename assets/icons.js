/* Round icons: one line set, as the brand guidelines ask.
   24 px grid, 1.5 px stroke, round ends and joins, drawn in currentColor. Live area 3 to 21; circles r 8.5.
   Each icon is the inner markup of a 24 x 24 svg. Dots are tiny circles so they read at 16 px.
   Use: Round.icon('copy')  ->  '<svg ...>' string (decorative, aria-hidden)
        Round.icon('copy', {size: 20, label: 'Copy'})  ->  labelled (role="img")
   Sizes: 24 is native; 20 is fine; 16 only for dense lists (the stroke thins to 1 px).
   assets/icons.svg is the same set as a sprite, built from this file by tools/build-icons.mjs. Preview: docs/icons.html */
(function(){
  'use strict';
  var C = function(cx, cy, r){ return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; };
  var P = function(d){ return '<path d="' + d + '"/>'; };
  var R = function(x, y, w, h, rx){ return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '"/>'; };
  var dot = function(cx, cy){ return '<circle cx="' + cx + '" cy="' + cy + '" r=".75" fill="currentColor"/>'; };

  var ICONS = {
    /* Move around */
    'menu':          P('M4 7.5h16M4 12h16M4 16.5h16'),
    'close':         P('M6 6l12 12M18 6L6 18'),
    'chevron-left':  P('M14.5 5.5L8 12l6.5 6.5'),
    'chevron-right': P('M9.5 5.5L16 12l-6.5 6.5'),
    'chevron-up':    P('M5.5 14.5L12 8l6.5 6.5'),
    'chevron-down':  P('M5.5 9.5L12 16l6.5-6.5'),
    'arrow-left':    P('M19.5 12h-15M10.5 6l-6 6 6 6'),
    'arrow-right':   P('M4.5 12h15M13.5 6l6 6-6 6'),
    'out':           P('M7 17L17 7M9 7h8v8'),
    'more':          dot(5.5, 12) + dot(12, 12) + dot(18.5, 12),
    'more-vertical': dot(12, 5.5) + dot(12, 12) + dot(12, 18.5),
    'grid':          R(4, 4, 7, 7, 1) + R(13, 4, 7, 7, 1) + R(4, 13, 7, 7, 1) + R(13, 13, 7, 7, 1),

    /* Do */
    'plus':          P('M12 5v14M5 12h14'),
    'minus':         P('M5 12h14'),
    'check':         P('M5 12.5l4.5 4.5L19 7.5'),
    'copy':          R(9, 9, 11, 11, 2) + P('M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3'),
    'share':         P('M12 14V3.5M8 7.5l4-4 4 4M8.5 10H7a2 2 0 0 0-2 2v6.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2h-1.5'),
    'add-home':      R(4, 4, 16, 16, 3.5) + P('M12 8.5v7M8.5 12h7'),
    'download':      P('M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14'),
    'upload':        P('M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14'),
    'undo':          P('M8.5 13.5L4 9l4.5-4.5M4 9h10a5.25 5.25 0 0 1 0 10.5h-3'),
    'redo':          P('M15.5 13.5L20 9l-4.5-4.5M20 9H10a5.25 5.25 0 0 0 0 10.5h3'),
    'edit':          P('M4 20h4L18.5 9.5a2.83 2.83 0 0 0-4-4L4 16v4zM13 7l4 4'),
    'trash':         P('M4 6.5h16M9 6.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5M6 6.5l.9 12.1A1.5 1.5 0 0 0 8.4 20h7.2a1.5 1.5 0 0 0 1.5-1.4L18 6.5M10 10.5v5.5M14 10.5v5.5'),
    'link':          P('M10.5 13.5a3.75 3.75 0 0 0 5.3 0l3-3a3.75 3.75 0 0 0-5.3-5.3l-1 1M13.5 10.5a3.75 3.75 0 0 0-5.3 0l-3 3a3.75 3.75 0 0 0 5.3 5.3l1-1'),
    'search':        C(11, 11, 6.5) + P('M15.75 15.75L20 20'),
    'reset':         P('M4 12a8 8 0 1 0 2.35-5.65L4 8.7M4 4.5v4.2h4.2'),
    'image':         R(4, 4, 16, 16, 2) + C(9.25, 9.25, 1.75) + P('M20 15l-4.5-4.5L6 20'),
    'print':         P('M7 9V4h10v5M7 17H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1M7 14h10v6H7z'),
    'qr':            R(4, 4, 6, 6, 1) + R(14, 4, 6, 6, 1) + R(4, 14, 6, 6, 1) + P('M14 14h2.5v2.5H14zM20 14v2.5M17.5 20H20v-2.5M14 20h.01'),
    'play':          P('M8 5.5v13l10-6.5L8 5.5z'),
    'pause':         P('M9 5.5v13M15 5.5v13'),

    /* Places and time */
    'globe':         C(12, 12, 8.5) + P('M3.5 12h17M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5s-1.1 6.2-3.3 8.5c-2.2-2.3-3.3-5.1-3.3-8.5s1.1-6.2 3.3-8.5z'),
    'pin':           P('M12 20.5s-6.5-5.4-6.5-10.75a6.5 6.5 0 0 1 13 0C18.5 15.1 12 20.5 12 20.5z') + C(12, 9.75, 2.25),
    'clock':         C(12, 12, 8.5) + P('M12 7.5V12l3 2'),
    'person':        C(12, 8.5, 3.5) + P('M5 20a7 7 0 0 1 14 0'),

    /* States */
    'info':          C(12, 12, 8.5) + P('M12 11v5.5') + '<circle cx="12" cy="8" r=".5" fill="currentColor"/>',
    'alert':         C(12, 12, 8.5) + P('M12 7.5V13') + '<circle cx="12" cy="16.25" r=".5" fill="currentColor"/>',
    'offline':       P('M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 6.6 10.2 3.9 3.9 0 0 0 7 18zM4 4l16 16'),
    'bell':          P('M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15l1.5-2zM10 20.5a2 2 0 0 0 4 0'),
    'sun':           C(12, 12, 3.75) + P('M12 3v1.75M12 19.25V21M3 12h1.75M19.25 12H21M5.64 5.64l1.24 1.24M17.12 17.12l1.24 1.24M5.64 18.36l1.24-1.24M17.12 6.88l1.24-1.24'),
    'moon':          P('M19.5 14.25A7.5 7.5 0 0 1 9.75 4.5a8 8 0 1 0 9.75 9.75z')
  };

  var GROUPS = [
    ['Move around', ['menu','close','chevron-left','chevron-right','chevron-up','chevron-down','arrow-left','arrow-right','out','more','more-vertical','grid']],
    ['Do', ['plus','minus','check','copy','share','add-home','download','upload','undo','redo','edit','trash','link','search','reset','image','print','qr','play','pause']],
    ['Places and time', ['globe','pin','clock','person']],
    ['States', ['info','alert','offline','bell','sun','moon']]
  ];

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function icon(name, o){
    o = o || {}; var body = ICONS[name];
    if (!body){ if (window.console) console.warn('Round.icon: no icon called ' + name); return ''; }
    var size = o.size || 24;
    var a11y = o.label ? ' role="img" aria-label="' + esc(o.label) + '"' : ' aria-hidden="true"';
    return '<svg class="round-icon' + (o.className ? ' ' + esc(o.className) : '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size + '"' + a11y +
      ' focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
  }

  var api = { icon: icon, ICONS: ICONS, ICON_GROUPS: GROUPS };
  window.Round = window.Round || {};
  for (var k in api) window.Round[k] = api[k];
})();
