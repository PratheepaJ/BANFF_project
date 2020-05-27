import * as d3s from 'd3-selection';
import polys from '../assets/polys.json';
import channels from '../assets/channels.json';
import { geoPath, geoIdentity } from 'd3-geo';
import { scales, state } from './globals';

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
        const f = d.properties.tumorYN == 1 ? scales.tumorFill(d.properties.tumorCluster) : scales.immuneFill(d.properties.immuneGroup);
        return f;
      }
    })
    .on("mouseover", cellOver);
}

export function initializeHeatmap(root) {
  console.log(channels);
  d3s.select(root)
    .selectAll('rect')
    .data(channels).enter()
    .append('rect')
    .attrs({
      x: (d) => scales.hmX(d.variable),
      y: (d) => scales.hmY(d.hm_order),
      width: scales.hmX.bandwidth(),
      height: scales.hmY.bandwidth(),
      fill: (d) => scales.hmFill(d.value),
      stroke: (d) => {
        const f = d.tumorYN == 1 ? scales.tumorFill(d.tumorCluster) : scales.immuneFill(d.immuneGroup);
        return f;
      },
      class: "hmCell"
    })
    .on("mouseover", hmOver);
}

function cellOver(data) {
  const curState = new Set([...state.cells, ...state.hm]);
  curState.add(data.properties.cellLabelInImage);
  updateHighlighted(curState);

  if (d3s.event.shiftKey) {
    state.cells.add(data.properties.cellLabelInImage);
  } else if (d3s.event.ctrlKey) {
    state.cells.delete(data.properties.cellLabelInImage);
  }
}

function hmOver(data) {
  const curState = new Set([...state.cells, ...state.hm]);
  curState.add(data.cellLabelInImage);
  updateHighlighted(curState);

  if (d3s.event.shiftKey) {
    state.hm.add(data.cellLabelInImage);
  } else if (d3s.event.ctrlKey) {
    state.hm.delete(data.cellLabelInImage);
  }
}

function updateHighlighted(curState) {
  d3s.select('#hm')
    .selectAll('.hmCell')
    .attrs({
      opacity: (d) => curState.has(d.cellLabelInImage) ? 1 : 0.2
    });

  d3s.select('#cells')
    .selectAll('.cellPath')
    .attrs({
      "stroke-width": (d) => curState.has(d.properties.cellLabelInImage) ? 1 : 0.2
    });
}
