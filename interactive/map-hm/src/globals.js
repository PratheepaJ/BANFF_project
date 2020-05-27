import * as d3sc from 'd3-scale';
import * as d3a from 'd3-array';

let immuneCols = ['#e41a1c','#377eb8','#4daf4a','#984ea3'];
let tumorCols = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5'];
let  channels = ['C','Na','Si','P','Ca','Fe','dsDNA','Vimentin','SMA','B7H3','FoxP3','Lag3','CD4','CD16','CD56','OX40','PD1','CD31','PD-L1','EGFR','Ki67','CD209','CD11c','CD138','CD163','CD68','CSF-1R','CD8','CD3','IDO','Keratin17','CD63','CD45RO','CD20','p53','Beta catenin','HLA-DR','CD11b','CD45','H3K9ac','Pan-Keratin','H3K27me3','phospho-S6','MPO','Keratin6','HLA_Class_1','Ta','Au'];

export const scales = {
  tumorFill: d3sc.scaleOrdinal().domain([4, 7, 10, 17]).range(immuneCols),
  immuneFill: d3sc.scaleOrdinal().domain([1, 2, 3, 4, 8, 10, 11, 12]).range(tumorCols),
  hmY: d3sc.scaleBand().domain(d3a.range(95)).range([500, 0]),
  hmX: d3sc.scaleBand().domain(channels).range([500, 900]),
  hmFill: d3sc.scaleLinear().domain([0, 0.5, 1]).range(["white", "grey", "black"])
};

export const state = {
  cells: new Set([]),
  hm: new Set([])
};
