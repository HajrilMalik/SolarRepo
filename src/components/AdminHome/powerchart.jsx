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

export function ChartPower({ readings }) {
    const [selectedDate, setSelectedDate] = useState("");

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    // Filter berdasarkan tanggal yang dipilih
    const filteredReadings = selectedDate
        ? Object.keys(readings).filter((key) => {
              const readingDate = new Date(readings[key].timestamp * 1000).toISOString().split("T")[0];
              return readingDate === selectedDate;
          })
        : Object.keys(readings);

    // Ambil data Volt dan Current
    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];
        return {
            timestamp: reading.timestamp,
            volt: reading.Volt ? Object.values(reading.Volt).reduce((a, b) => a + b, 0) : 0,
            current: reading.Current ? Object.values(reading.Current).reduce((a, b) => a + b, 0) : 0,
        };
    });

    // Urutkan berdasarkan timestamp
    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    // Ambil label dan dataset
    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const voltData = readingData.map((data) => data.volt);
    const currentData = readingData.map((data) => data.current);

    // Tentukan batas awal (7 data terbaru)
    const initialRangeStart = labels.length > 7 ? labels.length - 7 : 0;

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Current (A)",
                data: currentData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
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
                        const voltValue = voltData[index];
                        const currentValue = context.raw;

                        const timestamp = readingData[index].timestamp;
                        const fullDate = new Date(timestamp * 1000);
                        const formattedDate = fullDate.toLocaleDateString();
                        const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                        return `${voltValue.toFixed(2)}, ${currentValue.toFixed(2)}, \nDate: ${formattedDate}, Time: ${formattedTime}`;
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
                    autoSkip: false,
                },
                min: initialRangeStart,
                max: labels.length - 1, // Tampilkan hanya 7 data terbaru secara default
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
            <h1 className="text-center text-2xl font-bold mb-4 tracking-wider">
                Power Chart
            </h1>

            <div className="mb-4">
                <label
                    htmlFor="dateFilter"
                    className="block mb-2 font-medium text-white"
                >
                    Select Date:
                </label>
                <input
                    type="date"
                    id="dateFilter"
                    className="border rounded px-3 py-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <div
                className="w-full h-64 rounded-lg bg-white p-4 shadow-md"
                style={{
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                }}
            >
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
