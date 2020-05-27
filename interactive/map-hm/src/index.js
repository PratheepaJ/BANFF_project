import * as f from './funs';
import * as d3s from 'd3-selection';
import * as d3sm from 'd3-selection-multi';
import './style.css';

d3s.select("#root")
  .append("svg")
  .attrs({
    id: "svg",
    width: 700,
    height: 500
  });

d3s.select("#svg")
  .selectAll("g")
  .data(["cells", "hm"]).enter()
  .append("g")
  .attr("id", (d) => d);

f.initializeCells("#cells");
f.initializeHeatmap("#hm");

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
