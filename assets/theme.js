/* Coffee exchange theme: light or dark.
   Follows the system setting unless someone picks one with the toggle; the choice is shared by every page
   (and the globe iframe) through localStorage. Embeds can force one with ?theme=dark or ?theme=light.
   Load it in <head> before the styles paint, so there's no flash. */
(function(){
  'use strict';
  var KEY = 'cx-theme';
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  var forced = null;
  try { var q = new URLSearchParams(location.search).get('theme'); if (q === 'dark' || q === 'light') forced = q; } catch(e){}

  function stored(){ try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : null; } catch(e){ return null; } }
  function system(){ return mq && mq.matches ? 'dark' : 'light'; }
  function resolve(){ return forced || stored() || system(); }

  var current = null, listeners = [];
  function apply(){
    var t = resolve();
    if (t === current) return;
    current = t;
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
    listeners.forEach(function(fn){ try { fn(t); } catch(e){} });
    syncToggles();
  }

  // pick the opposite of what's showing; if that matches the system, go back to following it
  function toggle(){
    var next = current === 'dark' ? 'light' : 'dark';
    try { next === system() ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, next); } catch(e){}
    forced = null; apply();
  }

  function syncToggles(){
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++){
      var b = btns[i], dark = current === 'dark';
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.title = dark ? 'Light mode' : 'Dark mode';
      b.innerHTML = dark
        ? '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="3.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"/></svg>'
        : '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M16 12.2A6.5 6.5 0 0 1 7.8 4a6.5 6.5 0 1 0 8.2 8.2z"/></svg>';
    }
  }

  /* ---- colour: keep a coffee's colour readable on the current background ----
     Light: as stored (already darkened to 3:1 on white). Dark: lift lightness in OKLab until 4.5:1 on the midnight background. */
  var BG_DARK = [20, 27, 42];   // #141B2A
  function lin(v){ v /= 255; return v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
  function delin(v){ return 255*(v <= 0.0031308 ? 12.92*v : 1.055*Math.pow(v, 1/2.4) - 0.055); }
  function lum(c){ return 0.2126*lin(c[0]) + 0.7152*lin(c[1]) + 0.0722*lin(c[2]); }
  function contrast(a, b){ var x = lum(a), y = lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
  function hex2rgb(h){ h = String(h||'').replace('#',''); if (h.length === 3) h = h.replace(/./g,'$&$&'); var n = parseInt(h,16) || 0; return [n>>16&255, n>>8&255, n&255]; }
  function rgb2hex(c){ return '#' + c.map(function(v){ return Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2,'0'); }).join('').toUpperCase(); }
  function toLab(c){
    var r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
    var l = Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b), m = Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b), s = Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
    return [0.2104542553*l+0.7936177850*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.8086757660*s];
  }
  function fromLab(L){
    var l = Math.pow(L[0]+0.3963377774*L[1]+0.2158037573*L[2], 3), m = Math.pow(L[0]-0.1055613458*L[1]-0.0638541728*L[2], 3), s = Math.pow(L[0]-0.0894841775*L[1]-1.2914855480*L[2], 3);
    return [delin(4.0767416621*l-3.3077115913*m+0.2309699292*s), delin(-1.2684380046*l+2.6097574011*m-0.3413193965*s), delin(-0.0041960863*l-0.7034186147*m+1.7076147010*s)];
  }
  var cache = {};
  function tone(hex){
    if (current !== 'dark' || !hex) return hex;
    if (cache[hex]) return cache[hex];
    var c = hex2rgb(hex), L = toLab(c), out = c;
    for (var i = 0; i < 120 && contrast(out, BG_DARK) < 4.5; i++){ L = [L[0] + 0.006, L[1], L[2]]; out = fromLab(L); }
    return (cache[hex] = rgb2hex(out));
  }

  window.cxTheme = {
    get: function(){ return current; },
    toggle: toggle,
    tone: tone,
    onChange: function(fn){ listeners.push(fn); }
  };

  apply();
  if (mq) (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
  addEventListener('storage', function(e){ if (e.key === KEY) apply(); });
  addEventListener('message', function(e){ var d = e.data; if (d && d.cx === 'theme' && (d.theme === 'dark' || d.theme === 'light')){ forced = d.theme; apply(); } });
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-theme-toggle]'); if (b){ e.preventDefault(); toggle(); } });
  document.addEventListener('DOMContentLoaded', syncToggles);
})();
