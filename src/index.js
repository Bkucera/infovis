import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto'
import * as d3 from 'd3'

d3.selection.prototype.translate = function (x, y, r) {
    if (x instanceof Function)
        return this.attr('transform', (d, i) => `translate(${x(d, i)})`)
    if (x instanceof Array)
        return this.attr('transform', `translate(${x})`)
    let ret = `translate(${x},${y})`
    if (r) ret += ` rotate(${r})`
    return this.attr('transform', ret)
}





ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
