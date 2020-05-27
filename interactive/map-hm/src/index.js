import * as f from './funs';
import * as d3s from 'd3-selection';
import * as d3sm from 'd3-selection-multi';
import './style.css';
import { scales } from './globals';

d3s.select("#root")
  .append("svg")
  .attrs({
    id: "svg",
    width: 700,
    height: 500
  });

d3s.select("#svg")
  .selectAll("g")
  .data(["cells", "scatter"]).enter()
  .append("g")
  .attr("id", (d) => d);

d3s.select("#scatter")
  .attrs({
    transform: `translate(${scales.scatterX.range()[1]}, 10)`
  });

f.initializeCells("#cells");
f.initializeScatter("#scatter");

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
