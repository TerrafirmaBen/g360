import 'ol/ol.css';
import './styles/example.css';
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
import {OverviewMap, FullScreen, Control, defaults as defaultControls, Attribution} from 'ol/control';
import {Fill, Stroke, Circle} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';
import {GeoJSON, TopoJSON, WKT} from 'ol/format';
import {Style} from 'ol/style';
import {Select} from 'ol/interaction';
import Overlay from 'ol/Overlay';
import "regenerator-runtime/runtime";
import Sortable from "sortablejs";

const sleep = ms => new Promise(res => setTimeout(res, ms));


var opacityValue = 1;



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

layers['tf'] = new TileLayer({
  source: new TileWMS({
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
  }),
  title: 'LR Haz NGRM ol tile set',
  minZoom: 9.5
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
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;',
});

var map = new Map({
  controls: [new Attribution(), mousePositionControl],
  layers: [layers['osm']],  // Start with just initial OSM basemap
  overlays: [overlay],
  target: 'map',
  view: new View({
    projection: 'EPSG:27700',
    center: [0, 0],
    zoom: 1,
  }),
});

var activeLayers = [];

var el = document.getElementById("layer-list");
var sortable = Sortable.create(el);

var regionLayerToggle = document.getElementById('region-layer-button')
var bngLayerToggle = document.getElementById('bng-layer-button')

var layer_toggle_pool = {'eer': regionLayerToggle,
                          'bng': bngLayerToggle}

function assign_layer_toggle(layer_name) {
    layer_toggle_pool[layer_name].onclick = function () {
      if (!activeLayers.includes(layer_name)) {
        layers[layer_name].setOpacity(opacityValue);
        updateRenderEdgesOnLayer(layers[layer_name]);
        map.getLayers().setAt(activeLayers.length + 1, layers[layer_name]);
        layer_toggle_pool[layer_name].style.backgroundColor = "palegreen"
        layer_toggle_pool[layer_name].style.fontStyle = "normal"
        activeLayers.push(layer_name)
      } else {
        map.getLayers().removeAt(activeLayers.indexOf(layer_name) + 1);
        activeLayers = activeLayers.filter(function (certain_layer_name) { return certain_layer_name !== layer_name})
        layer_toggle_pool[layer_name].style.backgroundColor = "palevioletred"
        layer_toggle_pool[layer_name].style.fontStyle = "italic"
      }
  }
}

for (var layer_toggle_name in layer_toggle_pool) {
  layer_toggle_pool[layer_toggle_name].style.backgroundColor = "palevioletred"
  assign_layer_toggle(layer_toggle_name)
}

var renderExtras = document.getElementById('show-extras');

var baseLayerSelect = document.getElementById('base-layer');
var overlayLayerSelect = document.getElementById('overlay-layer');
var renderOverlayCheckbox = document.getElementById('render-overlay');
var renderOverlay = false;
var opacitySlider = document.getElementById("opacitySliderElement");
var viewProjSelect = document.getElementById('view-projection');
var renderEdgesCheckbox = document.getElementById('render-edges');
var renderEdges = false;


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
    console.log('Adjusted zoom to: ' + newZoom);
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
overlayLayerSelect.onchange = function () {
  var layer = layers[overlayLayerSelect.value];
  if (layer && renderOverlay) {
    layer.setOpacity(opacityValue);
    updateRenderEdgesOnLayer(layer);
    map.getLayers().setAt(1, layer);
  }
};

renderOverlayCheckbox.onchange = function () {
  renderOverlay = renderOverlayCheckbox.checked;
  if (renderOverlay) {
    var layer = layers[overlayLayerSelect.value]
    map.getLayers().setAt(1, layer)
    layer.setOpacity(opacityValue);
  } else {
    map.getLayers().removeAt(1);
  }
};

renderExtras.onchange = function () {
  if (renderExtras.checked) {
    document.getElementById('extras').style.display = 'block'
  } else {
    document.getElementById('extras').style.display = 'none'
  }
}

// opacityDisplay.innerHTML = "Opacity: 1"

// Update the current slider value (each time you drag the slider handle)
opacitySlider.oninput = function() {
  opacityValue = this.value / 100;
  // opacityDisplay.innerHTML = "Opacity: " + opacityValue;
  if (renderOverlay) {
    layers[overlayLayerSelect.value].setOpacity(opacityValue);
  }
} 

/**
 * Handle change event.
 */
renderEdgesCheckbox.onchange = function () {
  renderEdges = renderEdgesCheckbox.checked;
  map.getLayers().forEach(function (layer) {
    updateRenderEdgesOnLayer(layer);
  });
};


var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


var select = new Select();
map.addInteraction(select);

map.on('singleclick', async function (evt) {
  var coordinate = evt.coordinate;
  var hdms = toStringHDMS(toLonLat(coordinate));
  await sleep(1);

  var region = select.getFeatures().getArray().map(function (feature) {
    return feature.get('EER13NM');
  });
  var regiontext = 'No electoral region selected';
  if (region.length > 0) {
    regiontext = region.join(', ');
  }
  content.innerHTML = '<p>You clicked here:</p><code>' + hdms + 
  '</code><p>Region:</p><code>' + regiontext + '</code>';

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
