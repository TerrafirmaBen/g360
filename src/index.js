import 'ol/ol.css';
import './styles/style_sheet.css';
import Map from 'ol/Map';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import proj4 from 'proj4';
import {OSM, TileImage, TileWMS} from 'ol/source';
import {getCenter, getWidth} from 'ol/extent';
import {get as getProjection, toLonLat} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY, toStringHDMS} from 'ol/coordinate';
import {OverviewMap,  ScaleLine, Attribution} from 'ol/control';
import {Fill, Stroke, Circle} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';
import {GeoJSON, TopoJSON, WKT} from 'ol/format';
import {Style} from 'ol/style';
import {Select} from 'ol/interaction';
import Overlay from 'ol/Overlay';
import "regenerator-runtime/runtime";
import Sortable from "sortablejs";
const arrayMove = require('array-move');

const sleep = ms => new Promise(res => setTimeout(res, ms));



proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
proj4.defs(
  'EPSG:23032',
  '+proj=utm +zone=32 +ellps=intl ' +
    '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:5479',
  '+proj=lcc +lat_1=-76.66666666666667 +lat_2=' +
    '-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 ' +
    '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:21781',
  '+proj=somerc +lat_0=46.95240555555556 ' +
    '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:3413',
  '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
    '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'
);
proj4.defs(
  'EPSG:2163',
  '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
    '+a=6370997 +b=6370997 +units=m +no_defs'
);
proj4.defs(
  'ESRI:54009',
  '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' + '+units=m +no_defs'
);
register(proj4);

var proj27700 = getProjection('EPSG:27700');
proj27700.setExtent([0, 0, 700000, 1300000]);

var proj23032 = getProjection('EPSG:23032');
proj23032.setExtent([-1206118.71, 4021309.92, 1295389.0, 8051813.28]);

var proj5479 = getProjection('EPSG:5479');
proj5479.setExtent([6825737.53, 4189159.8, 9633741.96, 5782472.71]);

var proj21781 = getProjection('EPSG:21781');
proj21781.setExtent([485071.54, 75346.36, 828515.78, 299941.84]);

var proj3413 = getProjection('EPSG:3413');
proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

var proj2163 = getProjection('EPSG:2163');
proj2163.setExtent([-8040784.5135, -2577524.921, 3668901.4484, 4785105.1096]);

var proj54009 = getProjection('ESRI:54009');
proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);

var layers = {};

layers['osm'] = new TileLayer({
  source: new OSM(),
});

layers['wms4326'] = new TileLayer({
  source: new TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    crossOrigin: '',
    params: {
      'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
      'TILED': true,
    },
    projection: 'EPSG:4326',
  }),
});

layers['wms21781'] = new TileLayer({
  source: new TileWMS({
    attributions:
      '© <a href="http://www.geo.admin.ch/internet/geoportal/' +
      'en/home.html">Pixelmap 1:1000000 / geo.admin.ch</a>',
    crossOrigin: 'anonymous',
    params: {
      'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
      'FORMAT': 'image/jpeg',
    },
    url: 'https://wms.geo.admin.ch/',
    projection: 'EPSG:21781',
  }),
});

var parser = new WMTSCapabilities();

layers['wmts3413'] = new TileLayer();
var urlA =
  'https://map1.vis.earthdata.nasa.gov/wmts-arctic/' +
  'wmts.cgi?SERVICE=WMTS&request=GetCapabilities';
fetch(urlA)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var result = parser.read(text);
    var options = optionsFromCapabilities(result, {
      layer: 'OSM_Land_Mask',
      matrixSet: 'EPSG3413_250m',
    });
    options.crossOrigin = '';
    options.projection = 'EPSG:3413';
    options.wrapX = false;
    layers['wmts3413'].setSource(new WMTS(options));
  });

layers['bng'] = new TileLayer();
var urlB =
  'https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/OS_Open_Raster/MapServer/WMTS';
fetch(urlB)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    var result = parser.read(text);
    var options = optionsFromCapabilities(result, {
      layer: 'OS_Open_Raster',
    });
    options.attributions =
      'Contains OS data © Crown Copyright and database right 2019';
    options.crossOrigin = '';
    options.projection = 'EPSG:27700';
    options.wrapX = false;
    layers['bng'].setSource(new WMTS(options));
  });

var startResolution = getWidth(getProjection('EPSG:27700').getExtent()) / 256;
var resolutions = new Array(22);
for (var i = 0, ii = resolutions.length; i < ii; ++i) {
  resolutions[i] = startResolution / Math.pow(2, i);
}

layers['states'] = new TileLayer({
  source: new TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    crossOrigin: '',
    params: {'LAYERS': 'topp:states'},
    serverType: 'geoserver',
    tileGrid: new TileGrid({
      extent: [-13884991, 2870341, -7455066, 6338219],
      resolutions: resolutions,
      tileSize: [512, 256],
    }),
    projection: 'EPSG:3857',
  }),
});
let ngrmwmssource = new TileWMS({
  url: 'http://ec2-3-8-5-157.eu-west-2.compute.amazonaws.com:8080/geoserver/terrafirma/wms?',
  attributions: 'Metadata © <a href="https://www.terrafirmaidc.co.uk/">Terrafirma IDC Ltd.</a> 2020. Polygons subject to Crown and GeoPlace LLP copyright and database rights 2020 Ordnance Survey 100026316',
  params: {
    'FORMAT': 'image/png',
    'VERSION': '1.3.0',
    'LAYERS': 'terrafirma:tf_lr_haz',
    'exceptions': 'application/vnd.ogc.se_inimage',
    tiled: true,
    tilesOrigin: -118397.00155160861 + "," + -15982.135610342928
  },
  serverType: 'geoserver',
  projection: 'EPSG:27700',
});
layers['tf'] = new TileLayer({
  source: ngrmwmssource,
  title: 'LR Haz NGRM ol tile set',
  minZoom: 9.5
});


let miningpointsource = new TileWMS({
  url: 'http://ec2-3-8-5-157.eu-west-2.compute.amazonaws.com:8080/geoserver/terrafirma/wms?',
  attributions: 'Metadata © <a href="https://www.terrafirmaidc.co.uk/">Terrafirma IDC Ltd.</a> 2020. Polygons subject to Crown and GeoPlace LLP copyright and database rights 2020 Ordnance Survey 100026316',
  params: {
    'FORMAT': 'image/png',
    'VERSION': '1.3.0',
    'LAYERS': 'terrafirma:tf_miningpoint',
    'exceptions': 'application/vnd.ogc.se_inimage',
    tiled: true,
    tilesOrigin: -118397.00155160861 + "," + -15982.135610342928
  },
  serverType: 'geoserver',
  projection: 'EPSG:27700',
});
layers['tf_miningpoint'] = new TileLayer({
  source: miningpointsource,
  title: 'Mining point data',
  minZoom: 6
});

let miningpointcoalsource = new TileWMS({
  url: 'http://ec2-3-8-5-157.eu-west-2.compute.amazonaws.com:8080/geoserver/terrafirma/wms?',
  attributions: 'Metadata © <a href="https://www.terrafirmaidc.co.uk/">Terrafirma IDC Ltd.</a> 2020. Polygons subject to Crown and GeoPlace LLP copyright and database rights 2020 Ordnance Survey 100026316',
  params: {
    'FORMAT': 'image/png',
    'VERSION': '1.3.0',
    'LAYERS': 'terrafirma:tf_miningpointcoal',
    'exceptions': 'application/vnd.ogc.se_inimage',
    tiled: true,
    tilesOrigin: -118397.00155160861 + "," + -15982.135610342928
  },
  serverType: 'geoserver',
  projection: 'EPSG:27700',
});
layers['tf_miningpointcoal'] = new TileLayer({
  source: miningpointcoalsource,
  title: 'Mining point coal data',
  minZoom: 6
});


var fillStyle = new Fill({
  color: [255, 0, 0, 0.1]
});
var lineStyle = new Stroke({
  color: [0, 0, 0, 1],
  width: 1.5,
  lineDash: [10, 5]
});
var pointStyle = new Circle({
  fill: new Fill({
    color: [0, 102, 0, 0.5]
  }),
  stroke: new Stroke({
    color: [155, 0, 0, 1],
    width: 2
  }),
  radius: 5
});

layers['eer'] = new VectorLayer({
  source: new VectorSource({
    url: 'https://martinjc.github.io/UK-GeoJSON/json/eng/topo_eer.json',
    format: new TopoJSON(),
    //projection: document.getElementById('view-projection').value
  }),
  title: 'eer',
  style: new Style({
    fill: fillStyle,
    stroke: lineStyle,
    image: pointStyle
  })
});

var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
  text: new Text(),
});

layers['countries'] = new VectorLayer({
  imageRatio: 2,
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'https://openlayers.org/en/v4.6.5/examples/data/geojson/countries.geojson',

  }),
})

var wkt = "Polygon ((385219.76934220944531262 275120.31611970614176244, " +
  "510206.33200901799136773 374468.60952152829850093, " +
  "611691.14784958900418133 249482.04685471975244582, " +
  "385219.76934220944531262 275120.31611970614176244))";

var feature = new WKT().readFeature(wkt, {
  dataProjection: 'EPSG:27700',
  featureProjection: 'EPSG:27700'
})
layers['wkt_example'] = new VectorLayer( {
  source: new VectorSource( {
    features: [feature]
  })
})

var container = document.getElementById('popup');


var orientation;
function viewport_orientation() {
  var l = window.matchMedia("(orientation: landscape)")
  var p = window.matchMedia("(orientation: portrait)");
  if (l.matches) {
    orientation = "landscape";
  } else if (p.matches) {
    orientation = "portrait";
  }
}
viewport_orientation();

var sidebar_visible = false;
var active_tab = "layer-select-tab";

let open_sidebar_btn = document.querySelector(".open-sidebar");
open_sidebar_btn.addEventListener("click", () => {
  if (sidebar_visible) {
    hide_sidebar(orientation);
    // sidebar_visible = false;
  } else {
    show_sidebar(orientation);
    // sidebar_visible = true;
  }
});



function show_sidebar(orientation) {

  if (orientation == "landscape") {
    console.log(activeLayers.length, inactiveLayers.length)

    //document.querySelector("#tab-list").style.width = '20%';
    document.querySelector("#sidebar").style.width = "25%";
    document.querySelector("#map").style.width = "75%";
    document.querySelector('#map').style.marginLeft = "25%";
  } else if (orientation == "portrait") {
    document.querySelector("#sidebar").style.height = "25vh";
    document.querySelector("#map").style.height = "75vh";
    //document.querySelector('#map').style.marginTop = "25vh";
  }
  sidebar_visible = true;
  }

function hide_sidebar(orientation) {
  // document.querySelector("#active-layers-section").style.display = "none";
  // document.querySelector("#layer-pool-section").style.display = "none";
  //document.querySelector("#tab-list").style.width = '100%';

  if (orientation == "landscape") {
    document.querySelector("#sidebar").style.width = "100px";
    document.querySelector("#map").style.width = "100%"
    document.querySelector('#map').style.marginLeft = "0";
  } else if (orientation == "portrait") {
    document.querySelector("#sidebar").style.height = "100px";
    document.querySelector("#map").style.height = "100vh"
    //document.querySelector('#map').style.marginTop = "0vh";
  }
  sidebar_visible = false;

}

let layers_btn = document.querySelector("#layer-select-tab");
layers_btn.addEventListener("click", () => {
  show_layer_select();
  if (sidebar_visible && active_tab == "layer-select-tab") {
    hide_sidebar(orientation);
  } else {
    active_tab = "layer-select-tab";
    if (!sidebar_visible) {
    show_sidebar(orientation);
    }
  }

});

function show_layer_select() {
  document.querySelector("#layer-button-list").style.display = "inline-block";
  if (activeLayers.length > 1) {
    document.querySelector("#active-layers-section").style.display = 'block';
  }
  if (inactiveLayers.length > 0) {
    document.querySelector("#layer-pool-section").style.display = 'block';
  }
  document.querySelector("#settings").style.display = "none";
};


let settings_btn = document.querySelector("#settings-tab");
settings_btn.addEventListener("click", () => {
  show_settings();
  if (sidebar_visible && active_tab == "settings-tab") {
    hide_sidebar(orientation);
  } else {
    active_tab = "settings-tab";
    if (!sidebar_visible) {
      show_sidebar(orientation);
    }
  }
});

function show_settings() {
  document.querySelector("#layer-button-list").style.display = "none";
  document.querySelector("#settings").style.display = "inline-block";
}

var overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  },
});

var overviewMapControl = new OverviewMap({
  layers: [new TileLayer({
    source: new OSM(),
  })],
  view: new View({
    projection: 'EPSG:27700',
    center: [0, 0],
    zoom: 1,
  }),

})

var mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(2),
  projection: document.getElementById('view-projection').value,
  // comment the following two lines to have the mouse position
  // be placed within the map.
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;',
});

var scaleline = new ScaleLine({
  target: document.getElementById("scaleline-id"),
});

var map = new Map({
  controls: [new Attribution({
    // target: document.getElementById("attribution"),
  }), 
  mousePositionControl, scaleline],
  layers: [layers['osm']],  // Start with just initial OSM basemap
  overlays: [overlay],
  target: 'map',
  view: new View({
    projection: 'EPSG:27700',
    center: [0, 0],
    zoom: 1,
  }),
});

var active_layers_el = document.getElementById("active-layers");
var layer_pool_el = document.getElementById("layer-pool");


var activeLayers = ['osm'];
var inactiveLayers = ['eer', 'bng', 'wkt_example'];

var regionLayerToggle = document.getElementById('region-layer-button')
var bngLayerToggle = document.getElementById('bng-layer-button')
var wktLayerToggle = document.getElementById('wkt-layer-button')
var ngrmLayerToggle = document.getElementById('ngrm-layer-button')
var miningpointLayerToggle = document.getElementById('miningpoint-layer-button')
var miningpointcoalLayerToggle = document.getElementById('miningpointcoal-layer-button')
var layer_toggle_pool = {'eer': regionLayerToggle,
                          'bng': bngLayerToggle,
                          'wkt_example': wktLayerToggle,
                        'tf': ngrmLayerToggle,
                      'tf_miningpoint': miningpointLayerToggle,
                    'tf_miningpointcoal': miningpointcoalLayerToggle,
}

function activate_layer(layer_name,layer_position=activeLayers.length) {
        console.log("Active layers before:", activeLayers);
        layers[layer_name].setOpacity(1);
        updateRenderEdgesOnLayer(layers[layer_name]);
        layer_toggle_pool[layer_name].firstElementChild.style.backgroundColor = "palegreen"
        layer_toggle_pool[layer_name].firstElementChild.style.fontStyle = "normal"
        var node = document.createElement("div");                 // Create a div
        node.setAttribute("id",layer_name+"_slider")
        node.setAttribute("class", "slidecontainer");
        node.style.paddingTop = "5px";
        var br = document.createElement("br");
        node.appendChild(br);
        
        var slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("class", "slider");
        slider.setAttribute("max", "100");
        slider.setAttribute("min", "0");
        slider.setAttribute("value", "100");
        slider.classList.remove('ol-unselectable');
        slider.oninput = function() {
          layers[layer_name].setOpacity(this.value/100);
        };
        node.appendChild(slider);
        layer_toggle_pool[layer_name].append(node);
        inactiveLayers = inactiveLayers.filter(function (certain_layer_name) { return certain_layer_name !== layer_name})
        console.log("Setting layer at:", layer_position)
        map.getLayers().setAt(layer_position, layers[layer_name]);
        activeLayers.push(layer_name)
        active_layers_el.prepend(layer_toggle_pool[layer_name]);
        document.querySelector("#active-layers-section").style.display = 'block';
        if (inactiveLayers.length == 0) {
          document.querySelector("#layer-pool-section").style.display = 'none';
        }

        console.log("Active layers:", activeLayers)
        console.log("Inactive layers:", inactiveLayers)
        console.log("Trying to change list")
        console.log(activeLayers.length)

}

function deactivate_layer(layer_name) {
        layer_toggle_pool[layer_name].firstElementChild.style.backgroundColor = "palevioletred"
        layer_toggle_pool[layer_name].firstElementChild.style.fontStyle = "italic"
        console.log("Attempting to deactivate layer..")
        map.getLayers().removeAt(activeLayers.indexOf(layer_name));
        inactiveLayers.push(layer_name)
        activeLayers = activeLayers.filter(function (certain_layer_name) { return certain_layer_name !== layer_name})
        layer_pool_el.append(layer_toggle_pool[layer_name])
        layer_toggle_pool[layer_name].removeChild(document.getElementById(layer_name+"_slider"))
        if (activeLayers.length == 1) {
          document.querySelector("#active-layers-section").style.display = 'none';
        }
        document.querySelector("#layer-pool-section").style.display = 'block';

}

function assign_layer_toggle(layer_name) {
    layer_toggle_pool[layer_name].firstElementChild.onclick = function () {
      if (!activeLayers.includes(layer_name)) {
        console.log("Trying to activate", layer_name)
        activate_layer(layer_name)

      } else {
        console.log("Trying to deactivate", layer_name)
        deactivate_layer(layer_name)
      }
  }
}


// Assigns layer toggles to the buttons themselves
// TODO: Reassign from layer pool
for (var layer_toggle_name in layer_toggle_pool) {
  layer_toggle_pool[layer_toggle_name].firstElementChild.style.backgroundColor = "palevioletred"
  assign_layer_toggle(layer_toggle_name)
}

function layer_target(layer_id){
  return (activeLayers.length) - layer_id;
}

function swap_active_layers(old_index, new_index) {  // Move layer at old_index to new_index
  if (old_index > 0 & new_index > 0) {
    var layer_target_old_index = layer_target(old_index);
    var layer_target_new_index = layer_target(new_index);
    var layer_name_old_index = activeLayers[layer_target_old_index];  // Name of layer being moved
    var layer_name_new_index = activeLayers[layer_target_new_index];

  // Reassign activeLayers array

  activeLayers = arrayMove(activeLayers, layer_target_old_index, layer_target_new_index)
  if (old_index < new_index) {  // Corresponds to moving a layer down
    // Remove layers from top to bottom
    map.getLayers().removeAt(layer_target_old_index);
    map.getLayers().removeAt(layer_target_new_index)
    // Set layers from bottom to top
    map.getLayers().insertAt(layer_target_new_index, layers[layer_name_old_index]);
    map.getLayers().insertAt(layer_target_old_index, layers[layer_name_new_index]);

  } else {  // Corresponds to moving a layer up
    // Remove layers from top to bottom
    map.getLayers().removeAt(layer_target_new_index)
    map.getLayers().removeAt(layer_target_old_index)
    // Set layers from bottom to top
    map.getLayers().insertAt(layer_target_old_index, layers[layer_name_new_index]);
    map.getLayers().insertAt(layer_target_new_index, layers[layer_name_old_index]);

  }

  console.log("Active layers after swap:", activeLayers)

}


}

function swap_pool_layers(layer_a_id, layer_b_id) {
  console.log("First layer selected:", inactiveLayers[layer_a_id]);
  console.log("Second layer selected:", inactiveLayers[layer_b_id]);
  if (layer_a_id < layer_b_id) {
    inactiveLayers = [inactiveLayers[layer_b_id], inactiveLayers[layer_a_id]]
  } else {
    inactiveLayers = [inactiveLayers[layer_a_id], inactiveLayers[layer_b_id]]
  }

}


var active_layers_sortable = new Sortable(active_layers_el, {
  // variables

  group: "layer-list-group", // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
  // sort: true, // sorting inside list
  // delay: 0, // time in milliseconds to define when the sorting should start
  // delayOnTouchOnly: false, // only delay if user is using touch
  // touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
  // disabled: false, // Disables the sortable if set to true.
  // store: null, // @see Store
  animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
  // easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.
  // handle: ".my-handle", // Drag handle selector within list items
  // filter: ".ignore-elements", // Selectors that do not lead to dragging (String or Function)
  filter: ".slider",
  preventOnFilter: false,
  // preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
  // draggable: ".item", // Specifies which items inside the element should be draggable
  // draggable: ".layer-button",

  // dataIdAttr: "data-id",

  // ghostClass: "sortable-ghost", // Class name for the drop placeholder
  // chosenClass: "sortable-chosen", // Class name for the chosen item
  // dragClass: "sortable-drag", // Class name for the dragging item

  // swapThreshold: 1, // Threshold of the swap zone
  // invertSwap: false, // Will always use inverted swap zone if set to true
  // invertedSwapThreshold: 1, // Threshold of the inverted swap zone (will be set to swapThreshold value by default)
  // direction: "horizontal", // Direction of Sortable (will be detected automatically if not given)

  // forceFallback: false, // ignore the HTML5 DnD behaviour and force the fallback to kick in

  // fallbackClass: "sortable-fallback", // Class name for the cloned DOM Element when using forceFallback
  // fallbackOnBody: false, // Appends the cloned DOM Element into the Document's Body
  // fallbackTolerance: 0, // Specify in pixels how far the mouse should move before it's considered as a drag.

  // dragoverBubble: false,
  // removeCloneOnHide: true, // Remove the clone element when it is not showing, rather than just hiding it
  // emptyInsertThreshold: 5, // px, distance mouse must be from empty sortable to insert drag element into it

  // // handlers/hooks - listen to sortable events here.

  // setData: function (
  //   /** DataTransfer */ dataTransfer,
  //   /** HTMLElement*/ dragEl
  // ) {
  //   dataTransfer.setData("Text", dragEl.textContent); // `dataTransfer` object of HTML5 DragEvent
  // },

  // // Element is chosen
  // onChoose: function (/**Event*/ evt) {
  //   console.log("elt chosen");
  //   deactivate_layer(activeLayers[evt.oldIndex + 1])
  // },

  // // Element is unchosen
  // onUnchoose: function (/**Event*/ evt) {
  //   // same properties as onEnd
  // },

  // // Element dragging started
  // onStart: function (/**Event*/ evt) {
  //   evt.oldIndex; // element index within parent
  // },

  // // Element dragging ended
  onEnd: function (/**Event*/ evt) {
  //   var itemEl = evt.item; // dragged HTMLElement
  //   evt.to; // target list
  //   evt.from; // previous list
  //   evt.oldIndex; // element's old index within old parent
  //   evt.newIndex; // element's new index within new parent
    // console.log("Initial list index:", evt.oldIndex, "New list index:", evt.newIndex);
    if (evt.newIndex != evt.oldIndex && evt.to == evt.from) {
      swap_active_layers(evt.oldIndex + 1, evt.newIndex + 1);
    }
    // console.log(evt.to, evt.from)


  //   evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
  //   evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
  //   evt.clone; // the clone element
  //   evt.pullMode; // when item is in another sortable: `"clone"` if cloning, `true` if moving
  },

  // // Element is dropped into the list from another list
  // onAdd: function (/**Event*/ evt) {
  //   // same properties as onEnd
  // },

  // // Changed sorting within list
  // onUpdate: function (/**Event*/ evt) {
  //   // same properties as onEnd
  // },

  // // Called by any change to the list (add / update / remove)
  // onSort: function (/**Event*/ evt) {
  //   // same properties as onEnd
  // },

  // // Element is removed from the list into another list
  onRemove: function (/**Event*/ evt) {
    if (evt.to != evt.from) {
    console.log("deactivating", activeLayers[evt.oldIndex + 1])
    deactivate_layer(activeLayers[evt.oldIndex + 1])
    }
    // same properties as onEnd
  },

  // // Attempt to drag a filtered element
  // onFilter: function (/**Event*/ evt) {
  //   var itemEl = evt.item; // HTMLElement receiving the `mousedown|tapstart` event.
  // },

  // // Event when you move an item in the list or between lists
  // onMove: function (/**Event*/ evt, /**Event*/ originalEvent) {
  //   // Example: https://jsbin.com/nawahef/edit?js,output
  //   evt.dragged; // dragged HTMLElement
  //   evt.draggedRect; // DOMRect {left, top, right, bottom}
  //   evt.related; // HTMLElement on which have guided
  //   evt.relatedRect; // DOMRect
  //   evt.willInsertAfter; // Boolean that is true if Sortable will insert drag element after target by default
  //   originalEvent.clientY; // mouse position
  //   // return false; — for cancel
  //   // return -1; — insert before target
  //   // return 1; — insert after target
  //   // return true; — keep default insertion point based on the direction
  //   // return void; — keep default insertion point based on the direction
  // },

  // // Called when creating a clone of element
  // onClone: function (/**Event*/ evt) {
  //   var origEl = evt.item;
  //   var cloneEl = evt.clone;
  // },

  // // Called when dragging element changes position
  // onChange: function (/**Event*/ evt) {
  //   evt.newIndex; // most likely why this event is used is to get the dragging element's current index
  //   // same properties as onEnd
  // },
});

var layer_pool_sortable = new Sortable(layer_pool_el, {
  group: "layer-list-group", // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
  animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
  onEnd: function (/**Event*/ evt) {
      console.log("Initial list index:", evt.oldIndex, "New list index:", evt.newIndex);
      swap_pool_layers(evt.oldIndex, evt.newIndex);
    },
  // // Element is removed from the list into another list
  onRemove: function (/**Event*/ evt) {
    console.log(evt.oldIndex)
    console.log(inactiveLayers[evt.oldIndex])
    activate_layer(inactiveLayers[evt.oldIndex])
    console.log(evt.from, evt.to)
    // same properties as onEnd
  },
  // onChoose: function (/**Event*/ evt) {
  //   console.log("Selected an elt");
  //   console.log(evt.item)
  //   // evt.item.remove()

  //   // layer_pool_el.remove(evt.item.firstChild)
  //   // evt.item.detach().appendTo(active_layers_el)
  // },
})


var locationSearch = document.getElementById('location-search');
var baseLayerSelect = document.getElementById('base-layer');
var viewProjSelect = document.getElementById('view-projection');
var renderEdgesCheckbox = document.getElementById('render-edges');
var renderEdges = false;

locationSearch.onsubmit = function (event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  var json_string = JSON.stringify(Object.fromEntries(formData));
  var parse = JSON.parse(json_string)
  searchterm = parse.searchterm;
  if (searchterm.length < 9) {
  var xhttp = new XMLHttpRequest(); 
  var test_url = 'https://nominatim.openstreetmap.org/search?q=17+Strada+Pictor+Alexandru+Romano%2C+Bukarest&format=geojson'
  var api_url = 'https://twm-development.herokuapp.com/get_address_by_postcode?session_id=999&postcode=' + searchterm;
  console.log(api_url)
  xhttp.open("GET", api_url, true);
  xhttp.send(); 
  xhttp.onreadystatechange = function() {
    var parsed_xhttp_response_api_url = JSON.parse(xhttp.responseText);
    var search_x = parsed_xhttp_response_api_url.x_coordinate[0][0];
    var search_y = parsed_xhttp_response_api_url.y_coordinate[0][0];
    map.getView().setZoom(11);
    map.getView().setCenter([search_x, search_y]);  
  }
  
  } else {
    var split = searchterm.split(", ")
    map.getView().setZoom(11);
    map.getView().setCenter([split[0], split[1]]);  
  }
  
  document.getElementById('searchterm').value = "";
  closer_func()
  // var lonLat = new OpenLayers.LonLat(random_x,random_y).transform(epsg4326, proj27700);
  // var parsed_xhttp_response_test_url = JSON.parse(xhttp.responseText);
  // console.log(parsed_xhttp_response_test_url)
  // console.log(parsed_xhttp_response_test_url.features)
  // console.log(parsed_xhttp_response_test_url.features[0].geometry.coordinates)
  
}


function updateViewProjection() {
  var newProj = getProjection(viewProjSelect.value);
  var newProjExtent = newProj.getExtent();
  var newView = new View({
    projection: newProj,
    center: getCenter(newProjExtent || [0, 0, 0, 0]),
    zoom: 0,
    extent: newProjExtent || undefined,
  });
  map.setView(newView);

  // Example how to prevent double occurrence of map by limiting layer extent
  if (newProj == getProjection('EPSG:3857')) {
    layers['bng'].setExtent([-1057216, 6405988, 404315, 8759696]);
  } else {
    layers['bng'].setExtent(undefined);
  }
}



/**
 * Handle change event.
 */
viewProjSelect.onchange = function () {
  updateViewProjection();
  mousePositionControl.setProjection(getProjection(viewProjSelect.value));
};

updateViewProjection();  // update on startup




var minZoom = 2.5;
var maxZoom = 18.5;

map.getView().setMinZoom(minZoom);
map.getView().setMaxZoom(maxZoom);

var currZoom = map.getView().getZoom();
map.on('moveend', function(e) {
  var newZoom = map.getView().getZoom();
  if (currZoom != newZoom) {
    currZoom = newZoom;
    };
  });

var updateRenderEdgesOnLayer = function (layer) {
  if (layer instanceof TileLayer) {
    var source = layer.getSource();
    if (source instanceof TileImage) {
      source.setRenderReprojectionEdges(renderEdges);
    }
  }
};

/**
 * Handle change event.
 */
baseLayerSelect.onchange = function () {
  var layer = layers[baseLayerSelect.value];
  if (layer) {
    layer.setOpacity(1);
    updateRenderEdgesOnLayer(layer);
    map.getLayers().setAt(0, layer);
  }
};


/**
 * Handle change event.
 */
renderEdgesCheckbox.onchange = function () {
  renderEdges = renderEdgesCheckbox.checked;
  map.getLayers().forEach(function (layer) {
    updateRenderEdgesOnLayer(layer);
  });
};


var popup_content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

function closer_func () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
}

closer.onclick = function () {
  closer_func()
};


var select = new Select();
map.addInteraction(select);
var ngrm_return_html = ''
map.on('singleclick', async function (evt) {
  var coordinate = evt.coordinate;
  // var hdms = toStringHDMS(toLonLat(coordinate));
  var hdms = createStringXY(2)(coordinate)
  await sleep(1);

  // Define functions for each layer here

  // eer layer
  async function getRegionText () {
    var region = select.getFeatures().getArray().map(function (feature) {
      return feature.get('EER13NM');
    });
    var regiontext = 'Region: No electoral region selected';
    if (region.length > 0) {
      regiontext = 'Region: ' + region.join(', ');
    }
    return(Promise.resolve(regiontext))
  }
  

  // ngrm layer
  async function getNGRMTable() {
    var viewResolution = /** @type {number} */ (map.getView().getResolution());
    var mapproj = document.getElementById('view-projection').value
    var html_return = "";
    // Forces to wait for url to be received
      var url = ngrmwmssource.getFeatureInfoUrl( 
        evt.coordinate, viewResolution, mapproj,
        {
          'INFO_FORMAT': 'text/html',
          'FEATURE_COUNT': '6'
        })
      await fetch(url)
        .then(function (response) { return response.text(); })
        .then(function (htmlres) {
          html_return = htmlres
        });
      // Returns promise that resolves to NGRM table
      return (Promise.resolve(html_return))
  }

  async function getMiningPointTable() {
    var viewResolution = /** @type {number} */ (map.getView().getResolution());
    var mapproj = document.getElementById('view-projection').value
    var html_return = "";
    // Forces to wait for url to be received
      var url = miningpointsource.getFeatureInfoUrl( 
        evt.coordinate, viewResolution, mapproj,
        {
          'INFO_FORMAT': 'text/html',
          'FEATURE_COUNT': '6'
        })
      await fetch(url)
        .then(function (response) { return response.text(); })
        .then(function (htmlres) {
          html_return = htmlres
        });
      // Returns promise that resolves to NGRM table
      return (Promise.resolve(html_return))
  }

  async function getMiningPointCoalTable() {
    var viewResolution = /** @type {number} */ (map.getView().getResolution());
    var mapproj = document.getElementById('view-projection').value
    var html_return = "";
    // Forces to wait for url to be received
      var url = miningpointcoalsource.getFeatureInfoUrl( 
        evt.coordinate, viewResolution, mapproj,
        {
          'INFO_FORMAT': 'text/html',
          'FEATURE_COUNT': '6'
        })
      await fetch(url)
        .then(function (response) { return response.text(); })
        .then(function (htmlres) {
          html_return = htmlres
        });
      // Returns promise that resolves to NGRM table
      return (Promise.resolve(html_return))
  }

  const layer_function_dict = {
      eer: function() {return getRegionText();},
      tf: function () {return getNGRMTable();},
      tf_miningpoint: function () {return getMiningPointTable();},
      tf_miningpointcoal: function () {return getMiningPointCoalTable();},
  }
  

  var content_html = ''
  var content_dict = {}
activeLayers.reverse()
for (const layer_name of activeLayers) {
  if (Object.keys(layer_function_dict).includes(layer_name)) {
    content_dict[layer_name] = await layer_function_dict[layer_name]()
  }
}
// For ensuring layers are presented in correct order
for (const layer_name of activeLayers) {
  if (Object.keys(content_dict).includes(layer_name)) {
    content_html = content_html + content_dict[layer_name];
  }
}
activeLayers.reverse()
  var popup_html = '<p>Location: ' + hdms + '</p>' + content_html;
  popup_content.innerHTML = popup_html;
  overlay.setPosition(coordinate);

  
  
});

document.getElementById('export-png').addEventListener('click', function () {
  map.once('rendercomplete', function () {
    var mapCanvas = document.createElement('canvas');
    var size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    var mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      function (canvas) {
        if (canvas.width > 0) {
          var opacity = canvas.parentNode.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          var transform = canvas.style.transform;
          // Get the transform parameters from the style's transform matrix
          var matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    if (navigator.msSaveBlob) {
      // link download attribuute does not work on MS browsers
      navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
    } else {
      var link = document.getElementById('image-download');
      link.href = mapCanvas.toDataURL();
      link.click();
    }
  });
  map.renderSync();
});


show_layer_select();  // Run at startup as default tab is select-layers