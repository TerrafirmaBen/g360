// import specific classes or functions from a file - useful for importing from external libraries
import {helloWorldClass, helloWorldFunction} from './modules/example.js';
// import an entire file
import * as hw from  './modules/example.js';
// import css
import './styles/example.css'
import "../node_modules/ol/ol.css";

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
var map = new Map({
  view: new View({
    center: [0, 0],
    zoom: 1
  }),
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map'
});

hw.helloWorldFunction()