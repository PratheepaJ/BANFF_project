import * as d3s from 'd3-selection';
import polys from '../assets/polys.json';
import channels from '../assets/channels.json';
import { geoPath, geoIdentity } from 'd3-geo';
import { scales } from './globals';

console.log(polys);

export function initializeCells(root) {
  const proj = geoIdentity().fitExtent([[0, 0], [500, 500]], polys);
  const path = geoPath().projection(proj);

  d3s.select(root)
    .selectAll('path')
    .data(polys.features).enter()
    .append('path')
    .attrs({
      d: path,
      class: 'cellPath',
      fill: (d) => {
        const f = d.properties.tumorYN == 1 ? scales.tumorFill(d.properties.tumorCluster) : scales.immuneFill(d.properties.immunGroup);
        return f;
      }
    });
}

export function initializeHeatmap(root) {
  d3s.select(root)
    .selectAll('rect')
    .data(channels).enter()
    .append('rect')
    .attrs({
      x: (d) => scales.hmX(d.channel),
      y: (d) => scales.hmY(d.hm_order),
      width: scales.hmX.bandwidth(),
      height: scales.hmY.bandwidth(),
      fill: (d) => scales.hmFill(d.value),
      class: "hmCell"
    });
}
