import { useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

export function ChartVoltagePower({ readings }) {
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

    // Hitung data Power (Volt * Current)
    const powerData = voltData.map((v, i) => v * currentData[i]);

    // Gabungkan Volt dan Power menjadi pasangan {x, y}, lalu urutkan berdasarkan Volt (x)
    const sortedData = voltData
        .map((v, i) => ({ x: v, y: powerData[i] }))
        .sort((a, b) => a.x - b.x);

    // Siapkan data untuk grafik dari data yang sudah diurutkan
    const chartDataPower = {
        labels: sortedData.map((point) => point.x), // Sumbu x setelah diurutkan
        datasets: [
            {
                label: "Power vs Volt",
                data: sortedData, // Data sudah dalam format {x, y}
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                tension: 0.4,
                fill: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Volt",
                },
                type: "linear", // Pastikan skala X bersifat linear
                ticks: {
                    stepSize: 0.2, // Interval sumbu X
                    callback: (value) => value.toFixed(1), // Format label menjadi 1 desimal
                },
                beginAtZero: true, // Mulai dari 0
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
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg"
            style={{
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)", // Gradasi biru
            }}
        >
            <h1 className="text-2xl font-bold text-center text-green-600 mb-2">Power vs Volt Chart</h1>

            <div className="mb-2">
                <label
                    htmlFor="timestampSelect"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
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

            <div
                className="w-full h-96 rounded-lg bg-white p-4 shadow-md"
                style={{
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
            >
                <Line data={chartDataPower} options={chartOptions} />
            </div>
        </div>
    );
}
