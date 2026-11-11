import {feature} from 'topojson-client';
import {geoContains} from 'd3-geo';
import {readFileSync, writeFileSync} from 'fs';
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);
const step = 1.5, out = [];
for (let lat = -58; lat <= 84; lat += step) {
  const n = Math.max(1, Math.round(360 * Math.cos(lat*Math.PI/180) / step));
  for (let i = 0; i < n; i++) {
    const lon = -180 + (i + 0.5) * 360 / n;
    if (geoContains(land, [lon, lat])) out.push(Math.round(lon*10), Math.round(lat*10));
  }
}
writeFileSync(new URL('land-dots.json', import.meta.url), JSON.stringify(out));
console.log(out.length/2, 'dots', JSON.stringify(out).length, 'bytes');
