import { useState } from "react";
import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import Chart from "chart.js/auto";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function ChartPower({ readings }) {
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
    
    // Ambil data Volt dan Current untuk chart
    const voltData = [];
    const currentData = [];
    
    filteredReadings.forEach((key) => {
        const reading = readings[key];
        const timestamp = reading.timestamp;  // Timestamp
    
        // Pastikan Volt dan Current ada dan berupa objek, kemudian ubah menjadi array
        const voltValues = reading.Volt ? Object.values(reading.Volt) : [];
        const currentValues = reading.Current ? Object.values(reading.Current) : [];
    
        // Gabungkan data untuk chart
        voltData.push(...voltValues);  // Tambahkan semua nilai Volt ke array
        currentData.push(...currentValues);  // Tambahkan semua nilai Current ke array
    });
    
    // Gabungkan data untuk chart
    const chartData = {
        labels: voltData.map((volt, index) => volt.toFixed(4)), // Gunakan Volt sebagai label di sumbu X
        datasets: [
            {
                label: "Current (A)",
                data: currentData, // Gunakan Current sebagai data di sumbu Y
                borderColor: "#42A5F5",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
                fill: true,
            },
        ],
    };
    
    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const voltValue = context.label;
                        const currentValue = context.raw;
    
                        // Mendapatkan timestamp berdasarkan index
                        const timestamp = filteredReadings[index];
                        const fullDate = new Date(timestamp * 1000);
                        const formattedDate = fullDate.toLocaleDateString();
                        const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
                        return `Volt: ${voltValue} V, Current: ${currentValue} A, Date: ${formattedDate}, Time: ${formattedTime}`;
                    },
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
    {/* Judul */}
    <h1 className="text-center text-2xl font-bold mb-4 tracking-wider">
        Power Chart
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
        className="w-full h-52 rounded-lg bg-white p-4 shadow-md"
        style={{
            border: "1px solid rgba(0, 0, 0, 0.1)", // Border ringan untuk chart area
        }}
    >
        <Line data={chartData} options={chartOptions} />
    </div>
</div>

    );
}
