/* eslint-disable prettier/prettier */
import { createContext, useContext, useState, ReactNode } from 'react';
import { useBetween } from 'use-between';
import '../index.css';
import '../App.css';
import '@esri/calcite-components/dist/components/calcite-segmented-control';
import '@esri/calcite-components/dist/components/calcite-segmented-control-item';
import '@esri/calcite-components/dist/calcite/calcite.css';
import {
  CalciteLabel,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
} from '@esri/calcite-components-react';

function ComponentListData() {
  const [componentSelected, setComponentValueSelected] = useState<any>('All');
  const projectLabel = ['All', 'Land', 'Structure', 'ISF', 'Utility', 'Others'];

  // handle change event of the project
  const handleComponentListChange = (obj: any) => {
    setComponentValueSelected(obj);
  };

  return {
    handleComponentListChange,
    componentSelected,
    projectLabel,
  };
}

function ComponentListDisplay() {
  const { handleComponentListChange, componentSelected, projectLabel } =
    useBetween(ComponentListData);

  return (
    <>
      <CalciteLabel>
        Pre-Construction Work
        <CalciteSegmentedControl
          scale="m"
          onCalciteSegmentedControlChange={(event: any) =>
            handleComponentListChange(event.target.selectedItem.id)
          }
        >
          {componentSelected &&
            projectLabel.map((project: any, index: any) => {
              return (
                <CalciteSegmentedControlItem
                  {...(componentSelected === project ? { checked: true } : {})}
                  key={index}
                  value={project}
                  id={project}
                >
                  {project}
                </CalciteSegmentedControlItem>
              );
            })}
        </CalciteSegmentedControl>
      </CalciteLabel>
    </>
  );
}

type ComponentContextType = {
  componentSelected: any;
};

type Props = {
  children: ReactNode;
};

const initialState = {
  componentSelected: undefined,
};

const ComponentListContext = createContext<ComponentContextType>({
  ...initialState,
});

export function ComponentListDataProvider({ children }: Props) {
  const { componentSelected } = useBetween(ComponentListData);

  return (
    <ComponentListContext.Provider
      value={{
        componentSelected,
      }}
    >
      {children}
    </ComponentListContext.Provider>
  );
}

export const useComponentListContext = () => useContext(ComponentListContext);
export default ComponentListDisplay;
