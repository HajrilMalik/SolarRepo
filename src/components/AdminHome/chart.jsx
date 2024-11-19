// src/components/AdminHome/chart.jsx

import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Chart from 'chart.js/auto';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function ChartSR({ readings }) {
    // Pastikan readings didefinisikan dan memiliki data
    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>; // Menangani kasus tidak ada data
    }

    // Ambil label dan data dari readings
    const labels = Object.keys(readings).map(key => new Date(readings[key].timestamp * 1000).toLocaleString());
    const dataValues = Object.keys(readings).map(key => readings[key].Irradiance);

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
    };

    return (
  <div className="w-full h-52">
    <Line data={chartData} options={chartOptions} />
  </div>
    );
}