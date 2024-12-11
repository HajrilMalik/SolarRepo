import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { ChartSR } from "../AdminHome/chart"; // Pastikan path ke ChartSR benar
import { ChartPower } from "./powerchart";   // Pastikan path ke ChartPower benar
import { Data } from "./data"; // Import komponen Data

export function TabsDefault({ selectedReadings, selectedMarker }) {
  const data = [
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
    {
      label: "Data SR",
      value: "dataSR",
      component: <Data readings={selectedReadings} selectedMarker={selectedMarker} />, // Hanya di sini
    },
  ];

  return (
    <Tabs value="dataSR">
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

