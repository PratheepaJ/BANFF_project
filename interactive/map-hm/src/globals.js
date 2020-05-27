import * as d3sc from 'd3-scale';
import * as d3a from 'd3-array';

let immuneCols = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5'],
    tumorCols = ['#d9d9d9','#bc80bd','#ccebc5','#ffed6f'];
let projDims = d3a.range(7).map((d) => 'V' + d);

export const scales = {
  tumorFill: d3sc.scaleOrdinal().domain([4, 7, 10, 17]).range(immuneCols),
  immuneFill: d3sc.scaleOrdinal().domain([1, 2, 3, 4, 8, 10, 11, 12]).range(tumorCols),
  scatterX: d3sc.scaleLinear().domain([-3.5, 3.5]).range([0, 300]),
  scatterY: d3sc.scaleLinear().domain([-8, 7]).range([0, 300]),
  hmFill: d3sc.scaleLinear().domain([-2, 0, 2]).range(["white", "grey", "black"])
};

export const state = {
  cells: new Set([]),
  hm: new Set([])
};
