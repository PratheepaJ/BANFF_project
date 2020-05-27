const root = document.getElementById('root');
import * as f from './funs';

f.initializeCells(root);
f.initializeHeatmap(root);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept();
}
