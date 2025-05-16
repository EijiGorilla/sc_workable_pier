/* eslint-disable prettier/prettier */
import {
  dateTable,
  lotLayer,
  lotLayer_overview,
  nloLayer,
  nloLayer_overview,
  pileCapLayer,
  stripMapLayer,
  structureLayer,
  structureLayer_overview,
  utilityPointLayer,
  utilityPointLayer_overview,
} from './layers';
// import { overView, view } from './Scene';
import { view } from './Scene';
import {
  color_completed,
  color_nonworkable,
  color_workable,
  home_rotation,
  workable_fields,
} from './UniqueValues';
import StatisticDefinition from '@arcgis/core/rest/support/StatisticDefinition';
import * as am5 from '@amcharts/amcharts5';

export function lastDateOfMonth(date: Date) {
  const old_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const year = old_date.getFullYear();
  const month = old_date.getMonth() + 1;
  const day = old_date.getDate();
  const final_date = `${year}-${month}-${day}`;

  return final_date;
}

// Updat date
export async function dateUpdate(category: any) {
  const monthList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const query = dateTable.createQuery();
  const queryExpression = "project = 'N2'" + ' AND ' + "category = '" + category + "'";
  query.where = queryExpression; // "project = 'N2'" + ' AND ' + "category = 'Land Acquisition'";

  return dateTable.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const dates = stats.map((result: any) => {
      // get today and date recorded in the table
      const today = new Date();
      const date = new Date(result.attributes.date);

      // Calculate the number of days passed since the last update
      const time_passed = today.getTime() - date.getTime();
      const days_passed = Math.round(time_passed / (1000 * 3600 * 24));

      const year = date.getFullYear();
      const month = monthList[date.getMonth()];
      const day = date.getDate();
      const final = year < 1990 ? '' : `${month} ${day}, ${year}`;
      return [final, days_passed];
    });
    return dates;
  });
}

// Calculate summary statistics for workable piers
export async function calculateWorkablePiers(contractp: any, component: any) {
  let workable_component: any;
  component === 'All'
    ? (workable_component = workable_fields[0])
    : component === 'Land'
      ? (workable_component = workable_fields[1])
      : component === 'Structure'
        ? (workable_component = workable_fields[2])
        : component === 'ISF'
          ? (workable_component = workable_fields[3])
          : (workable_component = workable_fields[4]);

  var total_count = new StatisticDefinition({
    onStatisticField: workable_component,
    outStatisticFieldName: 'total_count',
    statisticType: 'count',
  });

  var count_nonworkable = new StatisticDefinition({
    onStatisticField: 'CASE WHEN ' + workable_component + ' = 0 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'count_nonworkable',
    statisticType: 'sum',
  });

  var count_workable = new StatisticDefinition({
    onStatisticField: 'CASE WHEN ' + workable_component + ' = 1 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'count_workable',
    statisticType: 'sum',
  });

  var count_completed = new StatisticDefinition({
    onStatisticField: 'CASE WHEN ' + workable_component + ' = 2 THEN 1 ELSE 0 END',
    outStatisticFieldName: 'count_completed',
    statisticType: 'sum',
  });

  const query = pileCapLayer.createQuery();
  const queryCP = "CP = '" + contractp + "'";
  query.where = queryCP;
  query.outStatistics = [total_count, count_nonworkable, count_workable, count_completed];

  const response = await pileCapLayer.queryFeatures(query);
  var stats = response.features[0].attributes;
  const total = stats.total_count;
  const nonworkable = stats.count_nonworkable;
  const workable = stats.count_workable;
  const completed = stats.count_completed;

  const data = [
    {
      category: 'Non-Workable',
      value: nonworkable,
      sliceSettings: {
        fill: am5.color(color_nonworkable),
      },
    },
    {
      category: 'Workable',
      value: workable,
      sliceSettings: {
        fill: am5.color(color_workable),
      },
    },
    {
      category: 'Completed',
      value: completed,
      sliceSettings: {
        fill: am5.color(color_completed),
      },
    },
  ];

  return data;
}

// Filter Pile CAP by CP
export function filterPileCapByCP(cp: any) {
  const query_cp = "CP = '" + cp + "'";
  pileCapLayer.definitionExpression = query_cp;

  lotLayer.definitionExpression = query_cp;
  structureLayer.definitionExpression = query_cp;
  nloLayer.definitionExpression = query_cp;
  utilityPointLayer.definitionExpression = query_cp;
  stripMapLayer.definitionExpression = query_cp;

  // Overview
  lotLayer_overview.definitionExpression = query_cp;
  structureLayer_overview.definitionExpression = query_cp;
  nloLayer_overview.definitionExpression = query_cp;
  utilityPointLayer_overview.definitionExpression = query_cp;
}

// Overview Map constraint
export function disableZooming(overView: any) {
  overView.popup.dockEnabled = true;

  // Removes the zoom action on the popup
  overView.popup.actions = [];

  // stops propagation of default behavior when an event fires
  function stopEvtPropagation(event: any) {
    event.stopPropagation();
  }

  // exlude the zoom widget from the default UI
  view.ui.components = [];
  overView.ui.components = [];

  // disable mouse wheel scroll zooming on the overView
  overView.on('mouse-wheel', stopEvtPropagation);

  // disable zooming via double-click on the overView
  overView.on('double-click', stopEvtPropagation);

  // disable zooming out via double-click + Control on the overView
  overView.on('double-click', ['Control'], stopEvtPropagation);

  // disables pinch-zoom and panning on the overView
  overView.on('drag', stopEvtPropagation);

  // disable the overView's zoom box to prevent the Shift + drag
  // and Shift + Control + drag zoom gestures.
  overView.on('drag', ['Shift'], stopEvtPropagation);
  overView.on('drag', ['Shift', 'Control'], stopEvtPropagation);

  // prevents zooming with the + and - keys
  overView.on('key-down', (event: any) => {
    const prohibitedKeys = [
      '+',
      '-',
      'Shift',
      '_',
      '=',
      'ArrowUp',
      'ArrowDown',
      'ArrowRight',
      'ArrowLeft',
    ];
    const keyPressed = event.key;
    if (prohibitedKeys.indexOf(keyPressed) !== -1) {
      event.stopPropagation();
    }
  });

  return overView;
}

// Zoom to layer
export function zoomToLayer(layer: any) {
  return layer.queryExtent().then((response: any) => {
    view
      .goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch(function (error) {
        if (error.name !== 'AbortError') {
          // console.error(error);
          console.log('error');
        }
      });
  });
}

// Return to home extent
const home_center: any = [120.9, 14.7832299];
export function homeExtentRenderer() {
  view.rotation = home_rotation;
  view.scale = 577790.5542885;
  view.center = home_center;
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    var num_parts = num.toString().split('.');
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return num_parts.join('.');
  } else {
    return 0;
  }
}
