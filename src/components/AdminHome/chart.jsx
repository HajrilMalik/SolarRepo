import { useState } from "react";
import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Chart from "chart.js/auto";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function ChartSR({ readings }) {
    const [selectedDate, setSelectedDate] = useState(""); // State untuk menyimpan tanggal yang dipilih

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

    const labels = filteredReadings.map((key) =>
        new Date(readings[key].timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    const dataValues = filteredReadings.map((key) => readings[key].Irradiance);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Irradiance",
                data: dataValues,
                borderColor: "#42A5F5",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
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
                        const readingKey = filteredReadings[index];
                        const timestamp = readings[readingKey].timestamp;
                        const fullDate = new Date(timestamp * 1000);
                        const formattedDate = fullDate.toLocaleDateString();
                        const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                        return `Date: ${formattedDate}, Time: ${formattedTime}, Irradiance: ${context.raw}`;
                    },
                },
            },
        },
    };

    return (
<div
    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-12 rounded-lg shadow-lg"
    style={{
        background: "linear-gradient(135deg, #4A90E2, #50C9C3)", // Gradasi biru
    }}
>
    {/* Judul */}
    <h1 className="text-center text-2xl font-bold mb-4 tracking-wider">
        Irradiance Chart
    </h1>

    {/* Input tanggal untuk filter */}
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

    {/* Chart */}
    <div
        className="w-full h-64 rounded-lg bg-white p-4 shadow-md"
        style={{
            border: "1px solid rgba(0, 0, 0, 0.1)", // Border ringan untuk chart area
        }}
    >
        <Line data={chartData} options={chartOptions} />
    </div>
</div>

    );
}
