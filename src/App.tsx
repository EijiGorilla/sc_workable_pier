/* eslint-disable prettier/prettier */
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { CalciteShell } from '@esri/calcite-components-react';
import MapPanel from './components/MapPanel';
import { ContractPackageDataProvider } from './components/ContractPackageContext';
import { ComponentListDataProvider } from './components/ComponentContext';

function App() {
  return (
    <>
      <CalciteShell>
        {/* <ActionPanel /> */}
        <ContractPackageDataProvider>
          <ComponentListDataProvider>
            <MapPanel />
          </ComponentListDataProvider>
        </ContractPackageDataProvider>
      </CalciteShell>
    </>
  );
}

export default App;
