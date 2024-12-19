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

export function TabsDefault({ selectedReadings, selectedMarker }) {
  const [chartType, setChartType] = useState("auto"); // State untuk memilih chart type

  const data = [
    {
      label: "Chart SR",
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
      label: "Chart Power",
      value: "chartPower",
      component: <ChartPower readings={selectedReadings} />,
    },
    {
      label: "Data SR",
      value: "dataSR",
      component: <Data readings={selectedReadings} selectedMarker={selectedMarker} />,
    },
  ];

  return (
    <Tabs value="chartSR">
      <TabsHeader>
        {data.map(({ label, value }) => (
          <Tab key={value} value={value}>
            {label}
          </Tab>
        ))}
      </TabsHeader>

      <TabsBody>
        {data.map(({ value, component }, index) => (
          <TabPanel
            key={value}
            value={value}
            className="overflow-y-auto max-h-[calc(100vh-150px)] p-4"
          >
            {index === 0 ? (
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
            ) : (
              component
            )}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
