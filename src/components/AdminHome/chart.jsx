import { useState } from "react";
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

// Registrasi plugin zoom
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
    const [selectedDate, setSelectedDate] = useState("");

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    // Filter readings berdasarkan tanggal yang dipilih
    const filteredReadings = selectedDate
        ? Object.keys(readings).filter((key) => {
              const readingDate = new Date(readings[key].timestamp * 1000).toISOString().split("T")[0];
              return readingDate === selectedDate;
          })
        : Object.keys(readings);

    // Ambil data Irradiance dan timestamp
    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];
        return {
            timestamp: reading.timestamp,
            irradiance: reading.Irradiance,
        };
    });

    // Urutkan berdasarkan timestamp
    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    // Ambil label dan dataset
    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const irradianceData = readingData.map((data) => data.irradiance);

    // Tentukan batas awal (7 data terbaru)
    const initialRangeStart = labels.length > 20 ? labels.length - 20 : 0;

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
                        const timestamp = readingData[index].timestamp;
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
                min: initialRangeStart,
                max: labels.length - 1, // Tampilkan hanya 7 data terbaru secara default
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

            <div className="mb-2">
                <input
                    type="date"
                    id="dateFilter"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

    {/* Chart */}
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
