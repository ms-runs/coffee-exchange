/* Round: the mark, drawn from the same geometry as the brand guidelines.
   A cup seen from above. Rim = the brand. Disc = the coffee (its bag colour). Handle = the picker's seat.
   Seats come from data/cities.json ("seat": degrees clockwise from 12 o'clock). No seat known: 90 (three o'clock),
   which is the logo's own position. Exposes window.Round. */
(function(){
  'use strict';
  var CUTS = {"regular": {"ring": 24, "gap": 12, "hw": 30, "hl": 24}, "small": {"ring": 26, "gap": 14, "hw": 32, "hl": 24}, "micro": {"ring": 28, "gap": 16, "hw": 34, "hl": 26}};
  var WORD = {"regular": {"word": "M120 54V-54H162.2Q172.7 -54 180.6 -49.9Q188.5 -45.9 192.9 -38.8Q197.3 -31.7 197.3 -22.5Q197.3 -9.8 189.4 -1.5Q181.5 6.8 168.2 8.5L204.3 54H179L144.4 8.8H140.9V54ZM160.4 -36.9H140.9V-7.5H160.4Q168.1 -7.5 172.3 -11.4Q176.5 -15.3 176.5 -22.2Q176.5 -28.5 172.3 -32.7Q168.1 -36.9 160.4 -36.9ZM248 55.5Q236.8 55.5 227.8 50.4Q218.8 45.2 213.5 36.5Q208.2 27.7 208.2 16.7Q208.2 5.9 213.4 -2.8Q218.6 -11.6 227.6 -16.7Q236.6 -21.9 247.8 -21.9Q259 -21.9 268.1 -16.7Q277.2 -11.6 282.4 -2.9Q287.6 5.8 287.6 16.7Q287.6 27.7 282.4 36.6Q277.2 45.4 268.2 50.5Q259.2 55.5 248 55.5ZM247.8 36.8Q256.4 36.8 261.7 31.2Q267 25.6 267 16.8Q267 8.1 261.6 2.5Q256.3 -3 247.8 -3Q239.5 -3 234.1 2.6Q228.8 8.2 228.8 16.8Q228.8 25.6 234.1 31.2Q239.5 36.8 247.8 36.8ZM329.1 55.5Q319.3 55.5 311.7 51.4Q304 47.2 299.7 39.9Q295.4 32.5 295.4 22.8V-20.2H315.7V22.4Q315.7 29.3 319.3 33.1Q322.8 36.9 329.1 36.9Q335.4 36.9 338.9 33.2Q342.5 29.4 342.5 22.4V-20.2H362.6V22.8Q362.6 32.6 358.4 40Q354.1 47.4 346.5 51.5Q338.9 55.5 329.1 55.5ZM375.5 54V-20.2H395.6V-13.1Q399.6 -17.3 405.1 -19.5Q410.5 -21.7 417.1 -21.7Q425.3 -21.7 431.7 -17.7Q438.2 -13.6 441.8 -7Q445.5 -0.4 445.5 7V54H425.4V11.4Q425.4 4.8 421.2 0.7Q417 -3.5 410.5 -3.5Q404.1 -3.5 399.8 0.7Q395.6 4.8 395.6 11.4V54ZM490.1 55.5Q479.8 55.5 471.7 50.5Q463.5 45.4 458.8 36.6Q454.1 27.9 454.1 17Q454.1 6.1 458.8 -2.8Q463.5 -11.6 471.7 -16.7Q479.8 -21.7 490.1 -21.7Q496.2 -21.7 501.7 -19.7Q507.1 -17.6 511.1 -13.9V-57.1H531.3V54H511.3V47.4Q507.3 51.2 501.8 53.4Q496.4 55.5 490.1 55.5ZM493.5 36.9Q501.9 36.9 507.1 31.3Q512.4 25.7 512.4 16.8Q512.4 8.1 507.1 2.5Q501.9 -3.1 493.5 -3.1Q485.2 -3.1 479.9 2.5Q474.7 8.1 474.7 16.8Q474.7 25.7 479.9 31.3Q485.2 36.9 493.5 36.9Z", "w": 612.17}, "small": {"word": "M120 54V-54H162.2Q172.7 -54 180.6 -49.9Q188.5 -45.9 192.9 -38.8Q197.3 -31.7 197.3 -22.5Q197.3 -9.8 189.4 -1.5Q181.5 6.8 168.2 8.5L204.3 54H179L144.4 8.8H140.9V54ZM160.4 -36.9H140.9V-7.5H160.4Q168.1 -7.5 172.3 -11.4Q176.5 -15.3 176.5 -22.2Q176.5 -28.5 172.3 -32.7Q168.1 -36.9 160.4 -36.9ZM248 55.5Q236.8 55.5 227.8 50.4Q218.8 45.2 213.5 36.5Q208.2 27.7 208.2 16.7Q208.2 5.9 213.4 -2.8Q218.6 -11.6 227.6 -16.7Q236.6 -21.9 247.8 -21.9Q259 -21.9 268.1 -16.7Q277.2 -11.6 282.4 -2.9Q287.6 5.8 287.6 16.7Q287.6 27.7 282.4 36.6Q277.2 45.4 268.2 50.5Q259.2 55.5 248 55.5ZM247.8 36.8Q256.4 36.8 261.7 31.2Q267 25.6 267 16.8Q267 8.1 261.6 2.5Q256.3 -3 247.8 -3Q239.5 -3 234.1 2.6Q228.8 8.2 228.8 16.8Q228.8 25.6 234.1 31.2Q239.5 36.8 247.8 36.8ZM329.1 55.5Q319.3 55.5 311.7 51.4Q304 47.2 299.7 39.9Q295.4 32.5 295.4 22.8V-20.2H315.7V22.4Q315.7 29.3 319.3 33.1Q322.8 36.9 329.1 36.9Q335.4 36.9 338.9 33.2Q342.5 29.4 342.5 22.4V-20.2H362.6V22.8Q362.6 32.6 358.4 40Q354.1 47.4 346.5 51.5Q338.9 55.5 329.1 55.5ZM375.5 54V-20.2H395.6V-13.1Q399.6 -17.3 405.1 -19.5Q410.5 -21.7 417.1 -21.7Q425.3 -21.7 431.7 -17.7Q438.2 -13.6 441.8 -7Q445.5 -0.4 445.5 7V54H425.4V11.4Q425.4 4.8 421.2 0.7Q417 -3.5 410.5 -3.5Q404.1 -3.5 399.8 0.7Q395.6 4.8 395.6 11.4V54ZM490.1 55.5Q479.8 55.5 471.7 50.5Q463.5 45.4 458.8 36.6Q454.1 27.9 454.1 17Q454.1 6.1 458.8 -2.8Q463.5 -11.6 471.7 -16.7Q479.8 -21.7 490.1 -21.7Q496.2 -21.7 501.7 -19.7Q507.1 -17.6 511.1 -13.9V-57.1H531.3V54H511.3V47.4Q507.3 51.2 501.8 53.4Q496.4 55.5 490.1 55.5ZM493.5 36.9Q501.9 36.9 507.1 31.3Q512.4 25.7 512.4 16.8Q512.4 8.1 507.1 2.5Q501.9 -3.1 493.5 -3.1Q485.2 -3.1 479.9 2.5Q474.7 8.1 474.7 16.8Q474.7 25.7 479.9 31.3Q485.2 36.9 493.5 36.9Z", "w": 612.17}, "micro": {"word": "M122 54V-54H164.2Q174.7 -54 182.6 -49.9Q190.5 -45.9 194.9 -38.8Q199.3 -31.7 199.3 -22.5Q199.3 -9.8 191.4 -1.5Q183.5 6.8 170.2 8.5L206.3 54H181L146.4 8.8H142.9V54ZM162.4 -36.9H142.9V-7.5H162.4Q170.1 -7.5 174.3 -11.4Q178.5 -15.3 178.5 -22.2Q178.5 -28.5 174.3 -32.7Q170.1 -36.9 162.4 -36.9ZM250 55.5Q238.8 55.5 229.8 50.4Q220.8 45.2 215.5 36.5Q210.2 27.7 210.2 16.7Q210.2 5.9 215.4 -2.8Q220.6 -11.6 229.6 -16.7Q238.6 -21.9 249.8 -21.9Q261 -21.9 270.1 -16.7Q279.2 -11.6 284.4 -2.9Q289.6 5.8 289.6 16.7Q289.6 27.7 284.4 36.6Q279.2 45.4 270.2 50.5Q261.2 55.5 250 55.5ZM249.8 36.8Q258.4 36.8 263.7 31.2Q269 25.6 269 16.8Q269 8.1 263.6 2.5Q258.3 -3 249.8 -3Q241.5 -3 236.1 2.6Q230.8 8.2 230.8 16.8Q230.8 25.6 236.1 31.2Q241.5 36.8 249.8 36.8ZM331.1 55.5Q321.3 55.5 313.7 51.4Q306 47.2 301.7 39.9Q297.4 32.5 297.4 22.8V-20.2H317.7V22.4Q317.7 29.3 321.3 33.1Q324.8 36.9 331.1 36.9Q337.4 36.9 340.9 33.2Q344.5 29.4 344.5 22.4V-20.2H364.6V22.8Q364.6 32.6 360.4 40Q356.1 47.4 348.5 51.5Q340.9 55.5 331.1 55.5ZM377.5 54V-20.2H397.6V-13.1Q401.6 -17.3 407.1 -19.5Q412.5 -21.7 419.1 -21.7Q427.3 -21.7 433.7 -17.7Q440.2 -13.6 443.8 -7Q447.5 -0.4 447.5 7V54H427.4V11.4Q427.4 4.8 423.2 0.7Q419 -3.5 412.5 -3.5Q406.1 -3.5 401.8 0.7Q397.6 4.8 397.6 11.4V54ZM492.1 55.5Q481.8 55.5 473.7 50.5Q465.5 45.4 460.8 36.6Q456.1 27.9 456.1 17Q456.1 6.1 460.8 -2.8Q465.5 -11.6 473.7 -16.7Q481.8 -21.7 492.1 -21.7Q498.2 -21.7 503.7 -19.7Q509.1 -17.6 513.1 -13.9V-57.1H533.3V54H513.3V47.4Q509.3 51.2 503.8 53.4Q498.4 55.5 492.1 55.5ZM495.5 36.9Q503.9 36.9 509.1 31.3Q514.4 25.7 514.4 16.8Q514.4 8.1 509.1 2.5Q503.9 -3.1 495.5 -3.1Q487.2 -3.1 481.9 2.5Q476.7 8.1 476.7 16.8Q476.7 25.7 481.9 31.3Q487.2 36.9 495.5 36.9Z", "w": 614.17}};
  var BLUE = '#1A3FA0', DEFAULT_SEAT = 90;

  function cutFor(cupPx){ return cupPx >= 40 ? 'regular' : cupPx >= 20 ? 'small' : 'micro'; }
  function n(v){ return Math.round(v * 100) / 100; }

  // inner svg for one cup centred on 0,0 (outer radius 72)
  function cup(o){
    var c = CUTS[o.cut || 'regular'], col = o.color || BLUE, R = 72, s = '';
    if (o.seat !== null && o.seat !== false && !o.empty){
      var t = ((o.seat == null ? DEFAULT_SEAT : o.seat) - 90) * Math.PI / 180;
      s += '<path d="M' + n((R - 4) * Math.cos(t)) + ' ' + n((R - 4) * Math.sin(t)) + 'L' + n((R + c.hl) * Math.cos(t)) + ' ' + n((R + c.hl) * Math.sin(t)) +
           '" stroke="' + col + '" stroke-width="' + c.hw + '" fill="none"/>';
    }
    s += '<circle r="' + (R - c.ring / 2) + '" fill="none" stroke="' + col + '" stroke-width="' + c.ring + '"/>';
    if (!o.empty) s += '<circle r="' + (R - c.ring - c.gap) + '" fill="' + (o.coffee || col) + '"/>';
    return s;
  }

  /* Round.mark({size, coffee, seat, color, empty, label})
     size: box size in px. The cup sits in a square box (200 units) so any seat fits; the cup is 72% of the box.
     Drawn in currentColor unless color is given, so CSS sets the rim colour (and dark mode works). */
  function mark(o){
    o = o || {}; var size = o.size || 32, cut = o.cut || cutFor(size * 0.72);
    var lab = o.label ? ' role="img" aria-label="' + String(o.label).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true"';
    return '<svg class="round-mark" viewBox="-100 -100 200 200" width="' + size + '" height="' + size + '"' + lab + ' focusable="false">' +
      cup({cut: cut, color: o.color || 'currentColor', coffee: o.coffee, seat: o.seat, empty: o.empty}) + '</svg>';
  }

  /* Round.lockup({height, color, coffee, label}): horizontal lockup, handle pointing at the name. */
  function lockup(o){
    o = o || {}; var h = o.height || 28, cut = o.cut || (h >= 40 ? 'regular' : h >= 20 ? 'small' : 'micro'), w = WORD[cut];
    var col = o.color || 'currentColor';
    return '<svg class="round-lockup" viewBox="-72 -72 ' + w.w + ' 144" height="' + h + '" width="' + n(h * w.w / 144) + '" role="img" aria-label="' + (o.label || 'Round') + '" focusable="false">' +
      cup({cut: cut, color: col, coffee: o.coffee, seat: DEFAULT_SEAT}) + '<path d="' + w.word + '" fill="' + col + '"/></svg>';
  }

  /* seat for a person's name, given people.json and cities.json arrays; null if unknown */
  function seatFor(name, people, cities){
    if (!name) return null;
    var p = (people || []).find(function(x){ return x.name && x.name.toLowerCase() === String(name).toLowerCase(); });
    var c = p && (cities || []).find(function(x){ return x.id === p.city; });
    return c && typeof c.seat === 'number' ? c.seat : null;
  }

  /* draw a cup on a canvas 2D context, centred at x,y, d = cup diameter in px */
  function drawCup(ctx, x, y, d, o){
    o = o || {}; var c = CUTS[o.cut || cutFor(d)], k = d / 144, R = 72 * k, col = o.color || BLUE;
    ctx.save(); ctx.lineCap = 'butt';
    if (o.seat !== null && !o.empty){
      var t = ((o.seat == null ? DEFAULT_SEAT : o.seat) - 90) * Math.PI / 180;
      ctx.strokeStyle = col; ctx.lineWidth = c.hw * k; ctx.beginPath();
      ctx.moveTo(x + (R - 4 * k) * Math.cos(t), y + (R - 4 * k) * Math.sin(t));
      ctx.lineTo(x + (R + c.hl * k) * Math.cos(t), y + (R + c.hl * k) * Math.sin(t)); ctx.stroke();
    }
    ctx.strokeStyle = col; ctx.lineWidth = c.ring * k; ctx.beginPath(); ctx.arc(x, y, R - c.ring * k / 2, 0, Math.PI * 2); ctx.stroke();
    if (!o.empty){ ctx.fillStyle = o.coffee || col; ctx.beginPath(); ctx.arc(x, y, R - (c.ring + c.gap) * k, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  window.Round = { mark: mark, lockup: lockup, seatFor: seatFor, drawCup: drawCup, cupSvg: cup, CUTS: CUTS, WORD: WORD, BLUE: BLUE, DEFAULT_SEAT: DEFAULT_SEAT };
})();
