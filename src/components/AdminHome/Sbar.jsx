import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { ChartSR } from "../AdminHome/chart"; // Pastikan path ke ChartSR benar
import { ChartPower } from "./powerchart";   // Pastikan path ke ChartPower benar

export function TabsDefault({ selectedReadings, selectedMarker }) {
  const data = [
    {
      label: "Data Marker",
      value: "markerData",
      component: (
        <div>
          <p><strong>Nama Marker:</strong> {selectedMarker.name}</p>
          <p><strong>Latitude:</strong> {selectedMarker.lat}</p>
          <p><strong>Longitude:</strong> {selectedMarker.lng}</p>
        </div>
      ),
    },
    {
      label: "Chart SR",
      value: "chartSR",
      component: <ChartSR readings={selectedReadings} />,
    },
    {
      label: "Chart Power",
      value: "chartPower",
      component: <ChartPower readings={selectedReadings} />,
    },
  ];

  return (
    <Tabs value="markerData">
      <TabsHeader>
        {data.map(({ label, value }) => (
          <Tab key={value} value={value}>
            {label}
          </Tab>
        ))}
      </TabsHeader>

      <TabsBody>
        {data.map(({ value, component }) => (
          <TabPanel key={value} value={value}>
            {component}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
