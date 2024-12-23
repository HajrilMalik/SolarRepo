import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

// Register zoom plugin
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);

export function ChartRumus({ readings }) {
    const [startTimestamp, setStartTimestamp] = useState(0);
    const [endTimestamp, setEndTimestamp] = useState(0);
    const [panelDimensions, setPanelDimensions] = useState(0.00052); // Default panel dimension 1 m²
    const [efficiency, setEfficiency] = useState(80); // Default efficiency 80%
    const [timestamps, setTimestamps] = useState([]); // Array untuk menyimpan semua timestamp

    useEffect(() => {
        if (readings && Object.keys(readings).length > 0) {
            const allTimestamps = Object.keys(readings).map(key => readings[key].timestamp);
            const readingData = allTimestamps.map(ts => ({
                timestamp: ts,
                reading: readings[ts]
            })).sort((a, b) => a.timestamp - b.timestamp);
    
            const latestTimestamp = readingData[readingData.length - 1]?.timestamp || 0;
            const oneDayBefore = latestTimestamp - (1 * 24 * 60 * 60);
    
            // Filter timestamps untuk 1 hari terakhir
            const filteredTimestamps = allTimestamps.filter(ts => ts >= oneDayBefore);
            
            setTimestamps(filteredTimestamps);  // Hanya set timestamps dari 1 hari terakhir
            setEndTimestamp(latestTimestamp);
            setStartTimestamp(oneDayBefore);
        }
    }, [readings]);
    

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    // Filter readings based on selected start and end timestamps
    const filteredReadings = Object.keys(readings).filter((key) => {
        const readingTimestamp = readings[key].timestamp;
        return readingTimestamp >= startTimestamp && readingTimestamp <= endTimestamp;
    });

    // Extract data for Irradiance and timestamp
    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];
        const volt = reading.Volt || {};
        const current = reading.Current || {};

        let pmax = 0;
        Object.keys(volt).forEach((index) => {
            const v = volt[index] || 0;
            const c = current[index] || 0;
            const power = v * c;
            if (power > pmax) {
                pmax = power;
            }
        });

        const irradiance = pmax / (1000 * panelDimensions * (efficiency / 100));

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax,
        };
    });

    // Sort by timestamp
    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    // Prepare labels and datasets
    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const irradianceData = readingData.map((data) => data.irradiance);
    const pmaxData = readingData.map((data) => data.pmax);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Irradiance",
                data: irradianceData,
                borderColor: "rgba(66, 165, 245, 1)",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const timestamp = readingData[index].timestamp;
                        const fullDate = new Date(timestamp * 1000);
                                                const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        const irradiance = context.raw;
                        const pmax = pmaxData[index];
                        return `Irradiance: ${irradiance} W/m²\nPmax: ${pmax} W\nDate: ${fullDate.toLocaleDateString()}, Time: ${formattedTime}`;
                    },
                },
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: "x",
                },
                zoom: {
                    enabled: true,
                    mode: "x",
                    wheel: {
                        enabled: true,
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                },
            },
        },
    };

    return (
        <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow-lg"
            style={{
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)", // Gradasi biru
            }}
        >
            <h1 className="text-center text-2xl font-bold mb-2 tracking-wider">
                Irradiance Chart
            </h1>

            {/* Dropdown untuk memilih start timestamp */}
            <div className="mb-2">
                <label htmlFor="startTimestamp" className="text-sm font-medium text-gray-700">
                    Start Timestamp:
                </label>
                <select
                    id="startTimestamp"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={startTimestamp}
                    onChange={(e) => setStartTimestamp(parseInt(e.target.value))}
                >
                    {timestamps.map((timestamp) => (
                        <option key={timestamp} value={timestamp}>
                            {new Date(timestamp * 1000).toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Dropdown untuk memilih end timestamp */}
            <div className="mb-2">
                <label htmlFor="endTimestamp" className="text-sm font-medium text-gray-700">
                    End Timestamp:
                </label>
                <select
                    id="endTimestamp"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={endTimestamp}
                    onChange={(e) => setEndTimestamp(parseInt(e.target.value))}
                >
                    {timestamps.map((timestamp) => (
                        <option key={timestamp} value={timestamp}>
                            {new Date(timestamp * 1000).toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            {/* Input untuk memilih dimensi panel PV */}
            <div className="mb-2">
                <label htmlFor="panelDimensions" className="text-sm font-medium text-gray-700">
                    Panel Dimensions (m²):
                </label>
                <input
                    type="number"
                    id="panelDimensions"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={panelDimensions}
                    onChange={(e) => setPanelDimensions(parseFloat(e.target.value))}
                    min="0.1"
                    step="0.1"
                />
            </div>

            {/* Input untuk memilih efisiensi panel PV */}
            <div className="mb-2">
                <label htmlFor="efficiency" className="text-sm font-medium text-gray-700">
                    Efficiency (%):
                </label>
                <input
                    type="number"
                    id="efficiency"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={efficiency}
                    onChange={(e) => setEfficiency(parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="1"
                />
            </div>

            {/* Chart area */}
            <div
                className="w-full h-96 rounded-lg bg-white p-4 shadow-md"
                style={{
                    border: "1px solid rgba(0, 0, 0, 0.1)", // Border ringan untuk chart area
                }}
            >
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}