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

export function ChartRumus({ readings }) {
    const [selectedDate, setSelectedDate] = useState("");
    const [panelDimensions, setPanelDimensions] = useState(0.00052); // Dimensi panel default 1 m²
    const [efficiency, setEfficiency] = useState(80); // Efisiensi default 0%

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
        // Jika Volt dan Current null, diisi dengan 0
        const volt = reading.Volt || {};
        const current = reading.Current || {};

        // Hitung Pmax (power maksimum) dengan mencari nilai maksimal dari hasil perkalian Volt dan Current
        let pmax = 0;
        Object.keys(volt).forEach((index) => {
            const v = volt[index] || 0;
            const c = current[index] || 0;
            const power = v * c; // Pmax = Volt * Current
            console.log(`Index: ${index}, Volt: ${v}, Current: ${c}, Power: ${power}`); // Cek nilai volt, current, dan power
            if (power > pmax) {
                pmax = power; // Ambil nilai maksimal Pmax
            }
        });
        console.log("Pmax calculated:", pmax);
        

        // Hitung Irradiance menggunakan rumus yang telah diperbaiki
        const irradiance = pmax / (1000 * panelDimensions * (efficiency / 100)); // Efisiensi dalam desimal

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax, // Tambahkan Pmax pada data untuk tooltip
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
    const pmaxData = readingData.map((data) => data.pmax); // Ambil data Pmax

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
                // Tambahkan data Pmax di titik tertentu untuk label atau tooltip
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(255, 99, 132, 1)", // Warna titik saat hover
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

                        // Tampilkan informasi Pmax di tooltip
                        const irradiance = context.raw;
                        const pmax = pmaxData[index]; // Ambil Pmax dari data
                        return `Irradiance: ${irradiance} W/m²\nPmax: ${pmax} W\nDate: ${formattedDate}, Time: ${formattedTime}`;
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

            {/* Input untuk memilih tanggal */}
            <div className="mb-2">
                <input
                    type="date"
                    id="dateFilter"
                    className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
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

            {/* Grafik */}
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
