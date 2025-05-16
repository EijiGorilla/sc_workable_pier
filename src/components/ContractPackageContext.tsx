import { createContext, useContext, useState, ReactNode } from 'react';
import { useBetween } from 'use-between';
import '../index.css';
import '../App.css';
import '@esri/calcite-components/dist/components/calcite-segmented-control';
import '@esri/calcite-components/dist/components/calcite-segmented-control-item';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/calcite/calcite.css';
import {
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteLabel,
} from '@esri/calcite-components-react';

function ContractPackageData() {
  const [cpValueSelected, setCpValueSelected] = useState<any>('S-01');
  const contractPackage = ['S-01', 'S-02', 'S-03a', 'S-03b', 'S-03c', 'S-04', 'S-05', 'S-06'];

  // handle change event of the Municipality dropdown
  const handleContractPackageChange = (obj: any) => {
    setCpValueSelected(obj);
  };

  return {
    handleContractPackageChange,
    cpValueSelected,
    contractPackage,
  };
}

function ContractPackageDisplay() {
  const { handleContractPackageChange, cpValueSelected, contractPackage } =
    useBetween(ContractPackageData);

  return (
    <>
      <CalciteLabel>
        Contract Package
        <CalciteSegmentedControl
          scale="m"
          onCalciteSegmentedControlChange={(event: any) =>
            handleContractPackageChange(event.target.selectedItem.id)
          }
        >
          {cpValueSelected &&
            contractPackage.map((contractp: any, index: any) => {
              return (
                <CalciteSegmentedControlItem
                  {...(cpValueSelected === contractp ? { checked: true } : {})}
                  key={index}
                  value={contractp}
                  id={contractp}
                >
                  {contractp}
                </CalciteSegmentedControlItem>
              );
            })}
        </CalciteSegmentedControl>
      </CalciteLabel>
    </>
  );
}

type ContractPackageContextType = {
  cpValueSelected: any;
};

type Props = {
  children: ReactNode;
};

const initialState = {
  cpValueSelected: undefined,
};

const ContractPackageContext = createContext<ContractPackageContextType>({
  ...initialState,
});

export function ContractPackageDataProvider({ children }: Props) {
  const { cpValueSelected } = useBetween(ContractPackageData);

  return (
    <ContractPackageContext.Provider
      value={{
        cpValueSelected,
      }}
    >
      {children}
    </ContractPackageContext.Provider>
  );
}

export const useContractPackageContext = () => useContext(ContractPackageContext);
export default ContractPackageDisplay;
