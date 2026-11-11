import {feature} from 'topojson-client';
import {geoContains, geoCentroid, geoArea} from 'd3-geo';
import {readFileSync, writeFileSync} from 'fs';
const atlas = p => JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/${p}`, import.meta.url)));
const lt = atlas('land-50m.json'), ct = atlas('countries-50m.json');
const land = feature(lt, lt.objects.land);
const countries = feature(ct, ct.objects.countries).features.filter(f=>f.geometry);
// centroid of each country's largest polygon (keeps France on the mainland etc.)
const names = [], cents = [];
for (const f of countries){
  let g = f.geometry;
  if (g.type==='MultiPolygon'){ let best=null,ba=-1; for (const c of g.coordinates){ const p={type:'Polygon',coordinates:c}, a=geoArea(p); if(a>ba){ba=a;best=p;} } g=best; }
  const [lo,la] = geoCentroid(g); names.push(f.properties.name); cents.push([+lo.toFixed(1), +la.toFixed(1)]);
}
const step = 1.5, dots = [], cidx = [];
for (let lat = -58; lat <= 84; lat += step) {
  const n = Math.max(1, Math.round(360 * Math.cos(lat*Math.PI/180) / step));
  for (let i = 0; i < n; i++) {
    const lon = -180 + (i + 0.5) * 360 / n, pt=[lon,lat];
    if (!geoContains(land, pt)) continue;
    dots.push(Math.round(lon*10), Math.round(lat*10));
    let k = -1; for (let j=0;j<countries.length;j++) if (geoContains(countries[j], pt)) { k=j; break; }
    cidx.push(k);
  }
}
const out = {dots, cidx, names, cents};
writeFileSync(new URL('land-dots.json', import.meta.url), JSON.stringify(out));
console.log(dots.length/2, 'dots', cidx.filter(k=>k<0).length, 'unassigned', JSON.stringify(out).length, 'bytes');
