import '@esri/calcite-components/dist/components/calcite-panel';
import '@esri/calcite-components/dist/components/calcite-list-item';
import '@esri/calcite-components/dist/components/calcite-shell-panel';
import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-action-bar';
import {
  CalciteShellPanel,
  CalciteActionBar,
  CalciteAction,
  CalcitePanel,
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import { basemaps, layerList } from '../Scene';

function ActionPanel() {
  const [activeWidget, setActiveWidget] = useState<undefined | any | unknown>(null);
  const [nextWidget, setNextWidget] = useState<undefined | any | unknown>(null);
  const layerListDiv = useRef<HTMLDivElement | undefined | any>(null);
  const calcitePanelBasemaps = useRef<HTMLDivElement | undefined | any>(null);

  useEffect(() => {
    basemaps.container = calcitePanelBasemaps.current;
    layerList.container = layerListDiv.current;
  });

  useEffect(() => {
    if (activeWidget) {
      const actionActiveWidget = document.querySelector(
        `[data-panel-id=${activeWidget}]`,
      ) as HTMLCalcitePanelElement;
      actionActiveWidget.hidden = true;
    }

    if (nextWidget !== activeWidget) {
      const actionNextWidget = document.querySelector(
        `[data-panel-id=${nextWidget}]`,
      ) as HTMLCalcitePanelElement;
      actionNextWidget.hidden = false;
    }
  });

  return (
    <>
      <CalciteShellPanel
        width-scale="1"
        slot="panel-start"
        position="start"
        id="left-shell-panel"
        displayMode="dock"
      >
        <CalciteActionBar slot="action-bar">
          <CalciteAction
            data-action-id="layers"
            icon="layers"
            text="layers"
            id="layers"
            //textEnabled={true}
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></CalciteAction>

          <CalciteAction
            data-action-id="basemaps"
            icon="basemap"
            text="basemaps"
            id="basemaps"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></CalciteAction>
        </CalciteActionBar>

        <CalcitePanel
          heading="Layers"
          height-scale="l"
          width-scale="l"
          data-panel-id="layers"
          style={{ width: '18vw' }}
          hidden
        >
          <div id="layers-container" ref={layerListDiv}></div>
        </CalcitePanel>

        <CalcitePanel
          heading="Basemaps"
          height-scale="l"
          data-panel-id="basemaps"
          style={{ width: '18vw' }}
          hidden
        >
          <div id="basemap-container" ref={calcitePanelBasemaps}></div>
        </CalcitePanel>
      </CalciteShellPanel>
    </>
  );
}

export default ActionPanel;
