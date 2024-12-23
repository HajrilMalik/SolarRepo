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

export function ChartSR({ readings }) {
    const [startTimestamp, setStartTimestamp] = useState("");
    const [endTimestamp, setEndTimestamp] = useState("");

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    let readingData = Object.keys(readings).map((key) => {
        const reading = readings[key];
        return {
            timestamp: reading.timestamp,
            irradiance: reading.Irradiance,
        };
    }).sort((a, b) => a.timestamp - b.timestamp);

    const latestTimestamp = readingData[readingData.length - 1]?.timestamp || 0;
    const oneDayBefore = latestTimestamp - 1 * 24 * 60 * 60;

    useEffect(() => {
        if (!startTimestamp) {
            setStartTimestamp(oneDayBefore.toString());
        }
        setEndTimestamp(latestTimestamp.toString());
    }, [latestTimestamp, startTimestamp]);

    const filteredData = readingData.filter((data) => {
        const timestamp = data.timestamp;
        const start = startTimestamp ? parseInt(startTimestamp) : oneDayBefore;
        const end = endTimestamp ? parseInt(endTimestamp) : latestTimestamp;
        return timestamp >= start && timestamp <= end;
    });

    const labels = filteredData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const irradianceData = filteredData.map((data) => data.irradiance);

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
                        const timestamp = filteredData[index].timestamp;
                        const fullDate = new Date(timestamp * 1000);
                        const formattedDate = fullDate.toLocaleDateString();
                        const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        return `Irradiance: ${context.raw}, \nDate: ${formattedDate}, Time: ${formattedTime}`;
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
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)",
            }}
        >
            <h1 className="text-center text-2xl font-bold mb-2 tracking-wider">
                Irradiance Chart
            </h1>

            <div className="mb-2 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startTimestamp">Start Timestamp:</label>
                    <select
                        id="startTimestamp"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={startTimestamp}
                        onChange={(e) => setStartTimestamp(e.target.value)}
                    >
                        <option value={oneDayBefore}>{new Date(oneDayBefore * 1000).toLocaleString()}</option>
                        {readingData.map((data) => (
                            <option key={data.timestamp} value={data.timestamp}>
                                {new Date(data.timestamp * 1000).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="endTimestamp">End Timestamp:</label>
                    <select
                        id="endTimestamp"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={endTimestamp}
                        onChange={(e) => setEndTimestamp(e.target.value)}
                    >
                        {readingData.map((data) => (
                            <option key={data.timestamp} value={data.timestamp}>
                                {new Date(data.timestamp * 1000).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className="w-full h-96 rounded-lg bg-white p-4 shadow-md"
                style={{
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
            >
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
