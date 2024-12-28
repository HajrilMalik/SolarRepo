import React, { useState } from "react";
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
import { ChartRumus } from "./rumusChart"; // Pastikan path ke ChartRumus benar
import { ChartVoltagePower } from "./voltagechart"; // Import komponen ChartVoltagePower

export function TabsDefault({ selectedReadings, selectedMarker, srKey }) {
  const [chartType, setChartType] = useState("auto"); // State untuk memilih chart type
  
  const data = [
    {
      label: "Data SR",
      value: "dataSR",
      component: <Data readings={selectedReadings} srKey={srKey} selectedMarker={selectedMarker} />
    },
    {
      label: "Irradience",
      value: "chartSR",
      component: (
        <>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="mb-4 p-2 border rounded"
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
          {chartType === "auto" ? (
            <ChartSR readings={selectedReadings} />
          ) : (
            <ChartRumus readings={selectedReadings} />
          )}
        </>
      ),
    },
    {
      label: "Power",
      value: "chartPower",
      component: <ChartPower readings={selectedReadings} />,
    },
    {
      label: "Volt x Power",
      value: "chartVoltagePower",
      component: <ChartVoltagePower readings={selectedReadings} />, // Tambahkan komponen baru
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
          <TabPanel
            key={value}
            value={value}
            className="overflow-y-auto max-h-[calc(100vh-150px)] p-4"
          >
            {component}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
