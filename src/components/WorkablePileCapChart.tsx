import { useEffect, useRef, useState } from 'react';
import { lotLayer } from '../layers';
import { view } from '../Scene';
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter';
import Query from '@arcgis/core/rest/support/Query';
import * as am5 from '@amcharts/amcharts5';
import am5index from '@amcharts/amcharts5/index';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';
import { calculateWorkablePiers, thousands_separators } from '../Query';
import '../App.css';
import '@esri/calcite-components/dist/components/calcite-segmented-control';
import '@esri/calcite-components/dist/components/calcite-segmented-control-item';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-checkbox';
import {
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteCheckbox,
} from '@esri/calcite-components-react';
import { cutoff_days, updatedDateCategoryNames } from '../UniqueValues';

import { useContractPackageContext } from './ContractPackageContext';
import { useComponentListContext } from './ComponentContext';

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

///*** Others */
/// Draw chart
const WorkablePileCapChart = () => {
  const { cpValueSelected } = useContractPackageContext();
  const { componentSelected } = useComponentListContext();

  // 1. Land Acquisition
  const pieSeriesRef = useRef<unknown | any | undefined>({});
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [workableData, setWorkableData] = useState<unknown | any | undefined>([]);

  const chartID = 'pie-two';

  useEffect(() => {
    calculateWorkablePiers(cpValueSelected, componentSelected).then((result: any) => {
      setWorkableData(result);
    });
  }, [cpValueSelected, componentSelected]);

  useEffect(() => {
    // Dispose previously created root element
    maybeDisposeRoot(chartID);

    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    root.setThemes([am5themes_Animated.new(root), am5themes_Responsive.new(root)]);

    // Create chart
    var chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        // centerY: am5.percent(-10), //-10
        // y: am5.percent(10), // space between pie chart and div background
        // x: am5.percent(-3),
        layout: root.verticalLayout,
      }),
    );
    chartRef.current = chart;

    // Create series
    var pieSeries = chart.series.push(
      am5percent.PieSeries.new(root, {
        name: 'Series',
        categoryField: 'category',
        valueField: 'value',
        radius: am5.percent(45), // outer radius
        innerRadius: am5.percent(28),
        // marginTop: -50,
        // marginLeft: -50,
        // marginRight: -50,
        scale: 2,
        legendLabelText: '{category}[/] ([#000000; bold]{value.formatNumber("#.")}[/]) ',
        legendValueText: '', //"{valuePercentTotal.formatNumber('#.')}% ({value})"
      }),
    );
    pieSeriesRef.current = pieSeries;
    chart.series.push(pieSeries);

    // values inside a donut
    pieSeries.children.push(
      am5.Label.new(root, {
        text: '[#000000]{valueSum}[/]\n[fontSize: 0.4em; #000000; verticalAlign: super]TOTAL PILE CAP[/]',
        fontSize: '1.5em',
        centerX: am5.percent(50),
        centerY: am5.percent(40),
        populateText: true,
        oversizedBehavior: 'fit',
        textAlign: 'center',
      }),
    );

    // pieSeries.onPrivate('width', (width: any) => {
    //   inner_label.set('maxWidth', width * 0.7);
    // });

    // Set slice opacity and stroke color
    pieSeries.slices.template.setAll({
      toggleKey: 'none',
      fillOpacity: 0.9,
      stroke: am5.color('#ffffff'),
      strokeWidth: 0.5,
      strokeOpacity: 1,
      templateField: 'sliceSettings',
      tooltipText: '{category}: {valuePercentTotal.formatNumber("#.")}%',
    });

    // Disabling labels and ticksll
    pieSeries.labels.template.set('visible', false);
    pieSeries.ticks.template.set('visible', false);
    pieSeries.data.setAll(workableData);

    // Disabling labels and ticksll
    // pieSeries.labels.template.setAll({
    //   // fill: am5.color('#ffffff'),
    //   fontSize: '1.2rem',
    //   visible: true,
    //   scale: 0.8,
    //   oversizedBehavior: 'wrap',
    //   maxWidth: 140,
    //   // textType: 'circular',
    //   // centerX: 0,
    //   // centerY: 0,
    //   text: "{category}: [#000000; fontSize: 1.4rem; fontWeight: bold]{value.formatNumber('#.')}[/]",
    // });

    // pieSeries.ticks.template.setAll({
    //   // fillOpacity: 0.9,
    //   // stroke: am5.color('#ffffff'),
    //   // strokeWidth: 0.3,
    //   // strokeOpacity: 1,
    //   visible: true,
    //   // scale: 0.5,
    // });

    var legend = chart.children.push(
      am5.Legend.new(root, {
        // centerX: am5.percent(50),
        x: am5.percent(20),
        // y: am5.percent(35),
        // paddingTop: -200,
        // y: am5.percent(50),
        // centerY: am5.percent(50),
        scale: 0.9,
        // layout: root.verticalLayout,
      }),
    );
    legendRef.current = legend;
    legend.data.setAll(pieSeries.dataItems);

    // Change the size of legend markers
    legend.markers.template.setAll({
      width: 18,
      height: 18,
    });

    // Change the marker shape
    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 10,
      cornerRadiusTR: 10,
      cornerRadiusBL: 10,
      cornerRadiusBR: 10,
    });

    // Responsive legend
    // https://www.amcharts.com/docs/v5/tutorials/pie-chart-with-a-legend-with-dynamically-sized-labels/
    // This aligns Legend to Left
    // chart.onPrivate('width', function (width: any) {
    //   const boxWidth = 10; //props.style.width;
    //   var availableSpace = Math.max(width - chart.height() - boxWidth, boxWidth);
    //   // var availableSpace = (boxWidth - valueLabelsWidth) * 0.7;
    //   // legend.labels.template.setAll({
    //   //   width: availableSpace,
    //   //   maxWidth: availableSpace,
    //   // });
    // });

    // To align legend items: valueLabels right, labels to left
    // 1. fix width of valueLabels
    // 2. dynamically change width of labels by screen size

    // Change legend labelling properties
    // To have responsive font size, do not set font size
    legend.labels.template.setAll({
      // oversizedBehavior: 'wrap-no-break',
      fill: am5.color('#000000'),
      // maxWidth: 10,
      //textDecoration: "underline"
      // width: am5.percent(200),
      //fontWeight: "300"
    });

    legend.valueLabels.template.setAll({
      textAlign: 'right',
      //width: valueLabelsWidth,
      fill: am5.color('#000000'),
      // fontSize: '2em',
    });

    legend.itemContainers.template.setAll({
      // set space between legend items
      paddingTop: 3,
      paddingBottom: 1,
    });

    pieSeries.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, workableData]);

  useEffect(() => {
    pieSeriesRef.current?.data.setAll(workableData);
    legendRef.current?.data.setAll(pieSeriesRef.current.dataItems);
  });

  return (
    <>
      <div
        id={chartID}
        style={{
          height: '250px',
          width: '210px',
          position: 'fixed',
          zIndex: '10',
          top: 150,
          left: 10,
          backgroundColor: '#E1E1E1',
        }}
      ></div>
    </>
  );
}; // End of lotChartgs

export default WorkablePileCapChart;
