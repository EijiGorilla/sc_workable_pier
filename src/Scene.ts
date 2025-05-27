/* eslint-disable prettier/prettier */
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import LayerList from '@arcgis/core/widgets/LayerList';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Print from '@arcgis/core/widgets/Print';
// import { home_center, home_rotation, home_scale, overViewCenter, zoom } from './UniqueValues';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import {
  cp_break_lines,
  lotLayer,
  lotLayer_overview,
  scCenterlineOverView,
  scStationLayer,
  scStationLayer_overview,
  nloLayer,
  nloLayer_overview,
  pileCapLayer,
  pileCapLayer_overview,
  prowLayer,
  prowLayer_overview,
  stripMapLayer,
  stripMapLayer_overview,
  structureLayer,
  structureLayer_overview,
  utilityPointLayer,
  utilityPointLayer_overview,
  tunnelLayer,
} from './layers';
import Basemap from '@arcgis/core/Basemap';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Compass from '@arcgis/core/widgets/Compass';
import {
  home_center,
  home_rotation,
  home_scale,
  overViewCenter,
  zoom_overview,
} from './UniqueValues';

const basemap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      portalItem: {
        id: 'c62a1769441f4dfca8ef64dd860d6d15', // dark-gray: '824fe99ab989479f83b9a6d7f2da0bcb',
      },
    }),
  ],
});

export const map = new Map({
  basemap: basemap, // 'gray-vector', // basemap, //basemap, // "streets-night-vector", basemap
  ground: 'world-elevation',
});

export const view = new MapView({
  map: map,
  container: undefined,
  rotation: home_rotation,
  center: home_center,
  scale: home_scale,
  background: {
    color: [0, 0, 0, 0.5],
  },
});

export const basemaps = new BasemapGallery({
  view,
  container: undefined,
});

export const overViewMap = new Map({
  basemap: 'gray-vector', // "streets-night-vector", basemap
});

export const overView = new MapView({
  map: overViewMap,
  container: undefined,
  center: overViewCenter,
  zoom: 16,
  rotation: 305,
  //extent: fixedExtent,
  // constraints: {
  //   rotationEnabled: false,
  // },
  ui: {
    components: [],
  },
});

// add layer
map.add(prowLayer);
map.add(lotLayer);
map.add(structureLayer);
map.add(pileCapLayer);
map.add(nloLayer);
map.add(utilityPointLayer);
map.add(scStationLayer);
map.add(cp_break_lines);
map.add(stripMapLayer);
map.add(tunnelLayer);

overViewMap.add(prowLayer_overview);
overViewMap.add(scCenterlineOverView);
overViewMap.add(lotLayer_overview);
overViewMap.add(structureLayer_overview);
overViewMap.add(pileCapLayer_overview);
overViewMap.add(nloLayer_overview);
overViewMap.add(utilityPointLayer_overview);
overViewMap.add(scStationLayer_overview);
overViewMap.add(stripMapLayer_overview);

// Compass
export const compass = new Compass({
  view: view,
  container: undefined,
});

export const compass_overview = new Compass({
  view: overView,
  container: undefined,
});

// Control panel
export const controlPanelExpand = new Expand({
  view,
  expanded: true,
  content: undefined,
});

// Scale bar
export const scaleBar_overview = new ScaleBar({
  view: overView,
  container: undefined,
});

// Overview expand
export const overViewExpand = new Expand({
  view,
  expanded: false,
  content: undefined,
});

export const layerList = new LayerList({
  view: view,
  selectionMode: 'multiple',
  visibilityAppearance: 'checkbox',
  container: undefined,
  listItemCreatedFunction: (event) => {
    const item = event.item;
    if (item.layer.type !== 'group') {
      item.panel = {
        content: 'legend',
        open: true,
      };
    }

    item.title === 'Chainage' ? (item.visible = false) : (item.visible = true);
  },
});

export const legend_workable_overview = new Legend({
  view: overView,
  container: 'workable-legend-overview',
  layerInfos: [
    {
      layer: pileCapLayer_overview,
      title: 'Pile Cap',
    },
    {
      layer: lotLayer_overview,
      title: 'Land',
    },
    {
      layer: structureLayer_overview,
      title: 'Structure',
    },
    {
      layer: nloLayer_overview,
      title: 'NLO (Non-Land Owner)',
    },
    {
      layer: utilityPointLayer_overview,
      title: 'Utility Work (Incomplete)',
    },
  ],
});

export const legend_workable = new Legend({
  view,
  container: 'workable-legend',
  layerInfos: [
    {
      layer: pileCapLayer,
      title: 'Piers',
    },
    {
      layer: lotLayer,
      title: 'Land',
    },
    {
      layer: structureLayer,
      title: 'Structure',
    },
    {
      layer: nloLayer,
      title: 'NLO (Non-Land Owner)',
    },
    {
      layer: utilityPointLayer,
      title: 'Utility Work (Incomplete)',
    },
  ],
});

// Print widget
const print = new Print({
  view: view,
  // specify your own print service
  printServiceUrl:
    'https://gis.railway-sector.com/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
});

export const printExpand = new Expand({
  view: view,
  expanded: false,
  content: print,
  expandTooltip: 'Print screen',
  expandIcon: 'print',
});
