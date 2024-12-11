import { useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

export function ChartPower({ readings }) {
    const [selectedTimestamp, setSelectedTimestamp] = useState("");

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    // Dapatkan semua timestamp yang ada
    const timestamps = Object.keys(readings).sort((a, b) => b - a);

    // Pilih timestamp terbaru jika belum dipilih
    const activeTimestamp = selectedTimestamp || timestamps[0];
    const activeData = readings[activeTimestamp];

    if (!activeData || !activeData.Volt || !activeData.Current) {
        return <div>Invalid data for the selected timestamp</div>;
    }

    // Ambil data Volt dan Current, isi nilai null dengan 0
    const voltData = Object.values(activeData.Volt || {}).map((v) => v || 0);
    const currentData = Object.values(activeData.Current || {}).map((c) => c || 0);

    // Siapkan data untuk chart
    const chartData = {
        labels: voltData,
        datasets: [
            {
                label: "Current vs Volt",
                data: currentData.map((y, i) => ({ x: voltData[i], y })),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.4,
                fill: false,
            },
        ],
    };

    const initialRangeStart = voltData.length > 25 ? voltData.length - 25 : 0;
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Volt",
                },
                ticks: {
                    autoSkip: true,
                },
                min: initialRangeStart,
                max: voltData.length - 1,
            },
            y: {
                title: {
                    display: true,
                    text: "Current",
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `Volt: ${context.raw.x}, Current: ${context.raw.y}`,
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
                    wheel: { enabled: true },
                    pinch: { enabled: true },
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
            <div className="mb-2">
            <h1 className="text-center text-2xl font-bold mb-2 tracking-wider">
                Irradiance Chart
            </h1>
                <select
                    id="timestampSelect"
                    value={activeTimestamp}
                    onChange={(e) => setSelectedTimestamp(e.target.value)}
                    className="border rounded px-2 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    {timestamps.map((timestamp) => (
                        <option key={timestamp} value={timestamp}>
                            {new Date(timestamp * 1000).toLocaleString()}
                        </option>
                    ))}
                </select>
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
