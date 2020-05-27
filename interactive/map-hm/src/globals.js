import * as d3sc from 'd3-scale';
import * as d3a from 'd3-array';

let immuneCols = ['#e41a1c','#377eb8','#4daf4a','#984ea3'];
let tumorCols = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5'];
let projDims = d3a.range(7).map((d) => 'V' + d);

export const scales = {
  tumorFill: d3sc.scaleOrdinal().domain([4, 7, 10, 17]).range(immuneCols),
  immuneFill: d3sc.scaleOrdinal().domain([1, 2, 3, 4, 8, 10, 11, 12]).range(tumorCols),
  hmY: d3sc.scaleBand().domain(d3a.range(1300)).range([500, 0]),
  hmX: d3sc.scaleBand().domain(projDims).range([500, 700]),
  hmFill: d3sc.scaleLinear().domain([-2, 0, 2]).range(["white", "grey", "black"])
};

export const state = {
  cells: new Set([]),
  hm: new Set([])
};
