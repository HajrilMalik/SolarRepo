import { useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

export function ChartVoltagePower({ readings }) {
    const [selectedTimestamp, setSelectedTimestamp] = useState("");
    const [showCurrent, setShowCurrent] = useState(true);
    const [showPower, setShowPower] = useState(true);

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    const timestamps = Object.keys(readings).sort((a, b) => b - a);
    const activeTimestamp = selectedTimestamp || timestamps[0];
    const activeData = readings[activeTimestamp];

    if (!activeData || !activeData.Volt || !activeData.Current) {
        return <div>Invalid data for the selected timestamp</div>;
    }

    const voltData = Object.values(activeData.Volt || {}).map((v) => v || 0);
    const currentData = Object.values(activeData.Current || {}).map((c) => c || 0);
    const powerData = voltData.map((v, i) => v * currentData[i]);

    const sortedData = voltData
        .map((v, i) => ({ x: v, y: currentData[i], power: powerData[i] }))
        .sort((a, b) => a.x - b.x);

    const chartData = {
        labels: sortedData.map((point) => point.x),
        datasets: [
            showCurrent && {
                label: "Current",
                data: sortedData.map((point) => point.y),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
                fill: false,
                yAxisID: 'yCurrent',
            },
            showPower && {
                label: "Power",
                data: sortedData.map((point) => point.power),
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.4,
                fill: false,
                yAxisID: 'yPower',
            },
        ].filter(Boolean),
    };

    const yAxisScales = {};

    if (showCurrent) {
        yAxisScales.yCurrent = {
            title: {
                display: true,
                text: "Current (A)",
            },
            position: "left",
            ticks: { beginAtZero: true },
        };
    }
    if (showPower) {
        yAxisScales.yPower = {
            title: {
                display: true,
                text: "Power (W)",
            },
            position: "right",
            ticks: { beginAtZero: true },
        };
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Voltage (V)",
                },
                type: "linear",
                ticks: {
                    stepSize: 0.2,
                    callback: (value) => value.toFixed(1),
                },
                beginAtZero: true,
            },
            ...yAxisScales,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const dataPoint = context.dataset.data[context.dataIndex];
                        return `${context.dataset.label}: ${dataPoint}`;
                    },
                },
            },
            zoom: {
                pan: { enabled: true, mode: "x" },
                zoom: {
                    enabled: true,
                    mode: "x",
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                },
            },
        },
    };

    return (
        <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg"
            style={{
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)",
            }}
        >
            <h1 className="text-2xl font-bold text-center text-green-600 mb-2">Current and Power vs Volt Chart</h1>

            <div className="mb-2">
                <label htmlFor="timestampSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Timestamp:
                </label>
                <select
                    id="timestampSelect"
                    value={activeTimestamp}
                    onChange={(e) => setSelectedTimestamp(e.target.value)}
                    className="border rounded px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    {timestamps.map((timestamp) => (
                        <option key={timestamp} value={timestamp}>
                            {new Date(timestamp * 1000).toLocaleString()}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <div>
                    <label className="inline-flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={showCurrent}
                            onChange={() => setShowCurrent(!showCurrent)}
                            className="form-checkbox text-blue-500"
                        />
                        <span className="ml-2">Show Current</span>
                    </label>
                </div>
                <div>
                    <label className="inline-flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={showPower}
                            onChange={() => setShowPower(!showPower)}
                            className="form-checkbox text-blue-500"
                        />
                        <span className="ml-2">Show Power</span>
                    </label>
                </div>
            </div>

            <div className="w-full h-96 rounded-lg bg-white p-4 shadow-md" style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
