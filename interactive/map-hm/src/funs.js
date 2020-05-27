import * as d3s from 'd3-selection';
import polys from '../assets/polys.json';
import channels from '../assets/channels.json';
import { geoPath, geoIdentity } from 'd3-geo';
import { scales, state } from './globals';

export function initializeCells(root) {
  const proj = geoIdentity().fitExtent([[0, 0], [scales.scatterX.range()[1], scales.scatterX.range()[1]]], polys);
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
      },
      "stroke-width": 0.1
    })
    .on("mouseover", cellOver);
}

export function initializeScatter(root) {
  d3s.select(root)
    .selectAll('circle')
    .data(channels).enter()
    .append('circle')
    .attrs({
      cx: (d) => scales.scatterX(d.V1),
      cy: (d) => scales.scatterY(d.V2),
      fill: (d) => {
        const f = d.tumorYN == 1 ? scales.tumorFill(d.tumorCluster) : scales.immuneFill(d.immuneGroup);
        return f;
      },
      "stroke-width": 0.1,
      class: "scatterCircle"
    })
    .on("mouseover", scatterOver);
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

function scatterOver(data) {
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
  d3s.select('#scatter')
    .selectAll('.scatterCircle')
    .attrs({
      "stroke-width": (d) => curState.has(d.cellLabelInImage) ? .5 : 0,
      "fill-opacity": (d) => curState.has(d.cellLabelInImage) ? 1 : 0.2
    });

  d3s.select('#cells')
    .selectAll('.cellPath')
    .attrs({
      "stroke-width": (d) => curState.has(d.properties.cellLabelInImage) ? 1 : 0.1
    });
}
