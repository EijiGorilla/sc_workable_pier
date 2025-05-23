/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/alt-text */
import { useRef, useEffect, useState } from 'react';
import {
  compass,
  compass_overview,
  controlPanelExpand,
  legend_workable,
  legend_workable_overview,
  map,
  overView,
  overViewExpand,
  printExpand,
  scaleBar_overview,
  view,
} from '../Scene';
import '../index.css';
import '../App.css';
// import { disableZooming, setup, dateUpdate, zoomToLayer } from '../Query';
import { dateUpdate, disableZooming, filterPileCapByCP, zoomToLayer } from '../Query';
import '@esri/calcite-components/dist/components/calcite-card';
import '@esri/calcite-components/dist/components/calcite-button';
import { CalciteCard, CalciteButton } from '@esri/calcite-components-react';
import ComponentListDisplay, {
  ComponentListDataProvider,
  useComponentListContext,
} from './ComponentContext';
import ContractPackageDisplay, {
  ContractPackageDataProvider,
  useContractPackageContext,
} from './ContractPackageContext';
import { contractPackage, cutoff_days, updatedDateCategoryNames } from '../UniqueValues';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {
  lotLayer,
  pierNumberLayer_label_all,
  pierNumberLayer_label_nlo,
  pierNumberLayer_label_land,
  pierNumberLayer_label_struc,
  pierNumberLayer_label_utility,
  pile_cap_renderer_all,
  pile_cap_renderer_nlo,
  pile_cap_renderer_land,
  pile_cap_renderer_structure,
  pile_cap_renderer_utility,
  pileCapLayer,
  structureLayer,
  nloLayer,
  utilityPointLayer,
  stripMapLayer,
  stripMapLayer_overview,
  lotLayer_overview,
  structureLayer_overview,
  nloLayer_overview,
  utilityPointLayer_overview,
  pileCapLayer_overview,
  pile_cap_renderer_others,
  pierNumberLayer_label_others,
} from '../layers';
import Extent from '@arcgis/core/geometry/Extent';
import WorkablePileCapChart from './WorkablePileCapChart';

function MapPanel() {
  const mapDiv = useRef(null);
  const overviewMapDiv = useRef<any>(null);
  const compassDiv = useRef<HTMLDivElement | undefined | any>(null);
  const scaleBarDiv_overview = useRef<HTMLDivElement | undefined | any>(null);
  const compassDiv_overview = useRef<HTMLDivElement | undefined | any>(null);
  const { cpValueSelected } = useContractPackageContext();
  const { componentSelected } = useComponentListContext();
  const [controlPanelExpanded, setControlPanelExpanded] = useState<boolean>(true);

  // 0. Updated date
  const [asOfDate, setAsOfDate] = useState<undefined | any | unknown>(null);
  const [daysPass, setDaysPass] = useState<boolean>(false);

  // Pile cap progress chart
  const [pileCapChartOpen, setPileCapChartOpen] = useState<boolean>(true);

  // Strip map
  const [selectedStrip, setSelectedStrip] = useState<any | undefined | null>(null);

  useEffect(() => {
    dateUpdate(updatedDateCategoryNames).then((response: any) => {
      setAsOfDate(response[0][0]);
      setDaysPass(response[0][1] >= cutoff_days ? true : false);
    });
  }, []);

  // Legend
  useEffect(() => {
    if (overViewExpand?.expanded === true) {
      view.ui.add(legend_workable_overview, 'bottom-right');
      view.ui.remove(legend_workable);
    } else {
      view.ui.remove(legend_workable_overview);
      view.ui.add(legend_workable, 'bottom-right');
    }
  }, [overViewExpand.expanded]);

  useEffect(() => {
    if (mapDiv.current) {
      map.ground.navigationConstraint = {
        type: 'none',
      };

      // view.when(() => {
      //   zoomToLayer(pileCapLayer);
      // });

      // legend;
      view.ui.add(legend_workable, 'bottom-right');

      view.container = mapDiv.current;
      // view.ui.components = [];
      // view.ui.empty('top-left');

      // Compass
      compass.container = compassDiv.current;
      view.ui.add(compass, 'top-left');

      // Printer widget
      view.ui.add(printExpand, 'top-left');

      // Control Panel
      controlPanelExpand.content = document.querySelector(`[id="controlpanel"]`) as HTMLDivElement;
      view.ui.add(controlPanelExpand, 'top-right');

      // overview
      overViewExpand.content = document.querySelector(`[id="overviewpanel"]`) as HTMLDivElement;
      view.ui.add(overViewExpand, 'bottom-right');

      // pile cap chart
      const pileCapChartButton = document.querySelector(
        `[id="pile-cap-chart-id"]`,
      ) as HTMLDivElement;
      view.ui.add(pileCapChartButton, 'top-left');
    }
  }, []);

  useEffect(() => {
    if (overviewMapDiv.current) {
      overView.container = overviewMapDiv.current;
      // view.ui.add(overviewMapDiv.current, 'bottom-left');

      // scale bar
      scaleBar_overview.container = scaleBarDiv_overview.current;
      overView.ui.add(scaleBar_overview, 'bottom-right');

      // compass
      compass_overview.container = compassDiv_overview.current;
      overView.ui.add(compass_overview, 'top-left');

      overView.when(disableZooming);

      // overView.when(() => {
      //   view.when(() => {
      //     // setup();
      //     zoomToLayer(pileCapLayer);
      //   });
      // });
    }
  }, []);

  // Control Panle Expand
  reactiveUtils.when(
    () => controlPanelExpand?.expanded === false,
    () => setControlPanelExpanded(false),
  );

  reactiveUtils.when(
    () => controlPanelExpand?.expanded === true,
    () => setControlPanelExpanded(true),
  );

  // Overview
  reactiveUtils.when(
    () => overViewExpand?.expanded === false,
    () => view.ui.remove(overviewMapDiv.current),
  );

  reactiveUtils.when(
    () => overViewExpand?.expanded === true,
    () => view.ui.add(overviewMapDiv.current, 'bottom-left'),
  );

  // Filter pile cap
  useEffect(() => {
    if (cpValueSelected === 'S-01') {
      view.when(() => {
        view
          .goTo({
            center: [120.9820412, 14.6226221],
            zoom: 14,
          })
          .catch(function (err) {
            // A rejected view indicates a fatal error making it unable to display.
            // Use the errback function to handle when the view doesn't load properly
            console.error('MapView rejected:', err);
          });
      });
    } else {
      zoomToLayer(stripMapLayer);
    }
  }, [cpValueSelected]);

  useEffect(() => {
    if (cpValueSelected || componentSelected) {
      // For the second CP for stripMap Index layer to
      // show pile caps with overlapping CPs
      const selectedIdx = contractPackage.indexOf(cpValueSelected);
      const cp2nd = contractPackage[selectedIdx + 1];
      console.log(cp2nd);
      filterPileCapByCP(cpValueSelected);
      // zoomToLayer(pileCapLayer);

      if (componentSelected === 'All') {
        pileCapLayer.renderer = pile_cap_renderer_all;
        pileCapLayer.labelingInfo = pierNumberLayer_label_all;
        lotLayer.visible = true;
        structureLayer.visible = true;
        nloLayer.visible = true;
        utilityPointLayer.visible = true;

        // overview
        pileCapLayer_overview.renderer = pile_cap_renderer_all;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_all;
        lotLayer_overview.visible = true;
        structureLayer_overview.visible = true;
        nloLayer_overview.visible = true;
        utilityPointLayer_overview.visible = true;
      } else if (componentSelected === 'Land') {
        pileCapLayer.renderer = pile_cap_renderer_land;
        pileCapLayer.labelingInfo = pierNumberLayer_label_land;
        lotLayer.visible = true;
        structureLayer.visible = false;
        nloLayer.visible = false;
        utilityPointLayer.visible = false;

        // overview
        pileCapLayer_overview.renderer = pile_cap_renderer_land;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_land;
        lotLayer_overview.visible = true;
        structureLayer_overview.visible = false;
        nloLayer_overview.visible = false;
        utilityPointLayer_overview.visible = false;
      } else if (componentSelected === 'Structure') {
        pileCapLayer.renderer = pile_cap_renderer_structure;
        pileCapLayer.labelingInfo = pierNumberLayer_label_struc;
        lotLayer.visible = false;
        structureLayer.visible = true;
        nloLayer.visible = false;
        utilityPointLayer.visible = false;

        // Overview
        pileCapLayer_overview.renderer = pile_cap_renderer_structure;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_struc;
        lotLayer_overview.visible = false;
        structureLayer_overview.visible = true;
        nloLayer_overview.visible = false;
        utilityPointLayer_overview.visible = false;
      } else if (componentSelected === 'ISF') {
        pileCapLayer.renderer = pile_cap_renderer_nlo;
        pileCapLayer.labelingInfo = pierNumberLayer_label_nlo;
        lotLayer.visible = false;
        structureLayer.visible = false;
        nloLayer.visible = true;
        utilityPointLayer.visible = false;

        // Overview
        pileCapLayer_overview.renderer = pile_cap_renderer_nlo;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_nlo;
        lotLayer_overview.visible = false;
        structureLayer_overview.visible = false;
        nloLayer_overview.visible = true;
        utilityPointLayer_overview.visible = false;
      } else if (componentSelected === 'Utility') {
        pileCapLayer.renderer = pile_cap_renderer_utility;
        pileCapLayer.labelingInfo = pierNumberLayer_label_utility;
        lotLayer.visible = false;
        structureLayer.visible = false;
        nloLayer.visible = false;
        utilityPointLayer.visible = true;

        // Overview
        pileCapLayer_overview.renderer = pile_cap_renderer_utility;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_utility;
        lotLayer_overview.visible = false;
        structureLayer_overview.visible = false;
        nloLayer_overview.visible = false;
        utilityPointLayer_overview.visible = true;
      } else if (componentSelected === 'Others') {
        pileCapLayer.renderer = pile_cap_renderer_others;
        pileCapLayer.labelingInfo = pierNumberLayer_label_others;
        lotLayer.visible = false;
        structureLayer.visible = false;
        nloLayer.visible = false;
        utilityPointLayer.visible = false;

        // Overview
        pileCapLayer_overview.renderer = pile_cap_renderer_others;
        pileCapLayer_overview.labelingInfo = pierNumberLayer_label_others;
        lotLayer_overview.visible = false;
        structureLayer_overview.visible = false;
        nloLayer_overview.visible = false;
        utilityPointLayer_overview.visible = false;
      }
    }
  }, [cpValueSelected, componentSelected]);

  // Legend for Alignment & Progress
  useEffect(() => {
    if (componentSelected !== 'All') {
      // view.rotation = 360;
    }
  }, [cpValueSelected, componentSelected]);

  // Feature Selection
  useEffect(() => {
    stripMapLayer.when(() => {
      view.on('click', (event: any) => {
        view.hitTest(event).then((response: any) => {
          const result = response.results[0];
          // const title = result?.graphic.layer.title;
          if (result) {
            if (result.graphic.layer) {
              const layer_name = result.graphic.layer.title;
              if (layer_name === 'Strip Map') {
                // view rotate
                view.rotation = 305;

                // overview new extent
                const page_number = result.graphic.attributes['PageNumber'];
                const angle = result.graphic.attributes['Angle'];
                stripMapLayer_overview.definitionExpression = 'PageNumber = ' + page_number;

                const xmax = result.graphic.geometry.extent.xmax;
                const ymax = result.graphic.geometry.extent.ymax;
                const xmin = result.graphic.geometry.extent.xmin;
                const ymin = result.graphic.geometry.extent.ymin;

                const new_extent = new Extent({
                  xmax: xmax,
                  ymax: ymax,
                  xmin: xmin,
                  ymin: ymin,
                  spatialReference: {
                    wkid: 102100,
                  },
                });
                overView.extent = new_extent;
                overView.rotation = 360 - angle;
                overView.zoom = 17;

                setSelectedStrip(result.graphic.attributes['OBJECTID']);
              }
            }
          }
        });
      });
    });
  }, []);

  // Higlight selected strip
  useEffect(() => {
    let highlight: any;
    selectedStrip &&
      view.whenLayerView(stripMapLayer).then((layerView: any) => {
        highlight = layerView.highlight(selectedStrip);
        view.on('click', () => {
          highlight.remove();
        });
      });
  }, [selectedStrip]);

  return (
    <>
      <div className="mapDiv" ref={mapDiv}></div>

      <CalciteButton
        icon-end="graph-pie-slice"
        onClick={(event: any) => setPileCapChartOpen(pileCapChartOpen === false ? true : false)}
        id="pile-cap-chart-id"
      ></CalciteButton>

      {/* Workable Pile Cap Chart */}
      <div style={{ display: pileCapChartOpen === true ? 'block' : 'none' }}>
        <ContractPackageDataProvider>
          <ComponentListDataProvider>
            <WorkablePileCapChart />
          </ComponentListDataProvider>
        </ContractPackageDataProvider>
      </div>

      {/* Control Panel*/}
      <div
        id="controlpanel"
        style={{ borderStyle: 'solid', borderColor: '#bfbfbf', borderWidth: '0.5px' }}
      >
        <CalciteCard style={{ fontSize: '0.5rem' }}>
          <ContractPackageDisplay />
          <ComponentListDisplay />
        </CalciteCard>
      </div>

      <div id="overviewpanel">
        <div className="overviewMapdDiv" ref={overviewMapDiv}></div>
      </div>

      {/* Updated date */}
      <div
        style={{
          color: daysPass === true ? 'red' : 'gray',
          fontSize: '0.6rem',
          float: 'right',
          marginRight: '5px',
          marginTop: '5px',
          zIndex: '1',
          position: 'fixed',
          bottom: 0,
          right: 5,
        }}
      >
        {!asOfDate ? '' : 'As of ' + asOfDate}
      </div>
    </>
  );
}

export default MapPanel;
