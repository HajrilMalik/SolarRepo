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

// Register zoom plugin
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
    const [startTimestamp, setStartTimestamp] = useState(0);
    const [endTimestamp, setEndTimestamp] = useState(0);
    const [timestamps, setTimestamps] = useState([]);
    const [allTimestamps, setAllTimestamps] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State untuk checkbox
    const [showIrradiance, setShowIrradiance] = useState(true);
    const [showPmax, setShowPmax] = useState(true);

    useEffect(() => {
        if (readings && Object.keys(readings).length > 0) {
            const allTimestamps = Object.keys(readings).map(key => readings[key].timestamp);
            setAllTimestamps(allTimestamps);
    
            const readingData = allTimestamps.map(ts => ({
                timestamp: ts,
                reading: readings[ts]
            })).sort((a, b) => a.timestamp - b.timestamp);
    
            const latestTimestamp = readingData[readingData.length - 1]?.timestamp || 0;
            const oneDayBefore = latestTimestamp - (1 * 24 * 60 * 60);
    
            setTimestamps(allTimestamps);
            setEndTimestamp(latestTimestamp);
    
            const nearestStartTimestamp = allTimestamps.find(ts => ts >= oneDayBefore) || allTimestamps[0];
            setStartTimestamp(nearestStartTimestamp);
        }
    }, [readings]);

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
        if (e.target.value) {
            const startDateTimestamp = new Date(e.target.value).getTime() / 1000;
            setStartTimestamp(startDateTimestamp);
        }
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
        if (e.target.value) {
            const endDateTimestamp = new Date(e.target.value).getTime() / 1000;
            setEndTimestamp(endDateTimestamp);
        }
    };

    const filteredTimestamps = allTimestamps.filter((timestamp) => {
        return timestamp >= startTimestamp && timestamp <= endTimestamp;
    });

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    const filteredReadings = Object.keys(readings).filter((key) => {
        const readingTimestamp = readings[key].timestamp;
        return readingTimestamp >= startTimestamp && readingTimestamp <= endTimestamp;
    });

    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];

        const irradiance = reading.Irradiance || 0;
        const pmax = reading.Pmax || 0;

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax,
        };
    });

    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });

    const irradianceData = readingData.map((data) => data.irradiance);
    const pmaxData = readingData.map((data) => data.pmax);

const chartData = {
    labels: labels,
    datasets: [
        showIrradiance && {
            label: "Irradiance (W/m²)",
            data: irradianceData,
            borderColor: "rgba(66, 165, 245, 1)",
            backgroundColor: "rgba(66, 165, 245, 0.2)",
            yAxisID: showPmax && showIrradiance ? 'y1' : 'y1', // Tetap di sumbu kiri jika satu grafik
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
        },
        showPmax && {
            label: "Pmax (W)",
            data: pmaxData,
            borderColor: "rgba(255, 159, 64, 1)",
            backgroundColor: "rgba(255, 159, 64, 0.2)",
            yAxisID: showPmax && showIrradiance ? 'y2' : 'y1',  // Pindah ke y1 jika hanya satu grafik
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(255, 159, 64, 1)",
        },
    ].filter(Boolean),
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
                    const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const value = context.raw;
                    const label = context.dataset.label;
                    return `${label}: ${value} W\nDate: ${fullDate.toLocaleDateString()}, Time: ${formattedTime}`;
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
        y1: {
            type: 'linear',
            position: 'left',
            title: {
                display: true,
                text: showIrradiance ? 'Irradiance (W/m²)' : 'Pmax (W)',
            },
            min: showIrradiance ? Math.min(...irradianceData) - 15 : Math.min(...pmaxData) - 15,
        },
        y2: showIrradiance && showPmax ? {
            type: 'linear',
            position: 'right',
            title: {
                display: true,
                text: 'Pmax (W)',
            },
        } : undefined,  // Hilangkan y2 jika hanya satu grafik
    },
};

    
    

    return (
        <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow-lg"
            style={{
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)",
            }}
        >
            {/* Checkbox untuk memilih data yang akan ditampilkan */}
            <div className="flex gap-4 mb-4">
    <div className="w-1/2">
        <label htmlFor="showIrradiance" className="text-sm font-medium text-gray-700">
            Show Irradiance
        </label>
        <input
            type="checkbox"
            id="showIrradiance"
            checked={showIrradiance}
            onChange={(e) => setShowIrradiance(e.target.checked)}
            className="ml-2"
        />
    </div>

    <div className="w-1/2">
        <label htmlFor="showPmax" className="text-sm font-medium text-gray-700">
            Show Pmax
        </label>
        <input
            type="checkbox"
            id="showPmax"
            checked={showPmax}
            onChange={(e) => setShowPmax(e.target.checked)}
            className="ml-2"
        />
    </div>
</div>


            {/* Input untuk memilih start dan end date */}
            <div className="flex justify-between gap-4 mb-4">
                <div className="w-1/2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date
                    </label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </div>

                <div className="w-1/2">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </div>
            </div>

            {/* Timestamp selector */}
            <div className="flex justify-between gap-4 mb-4">
                <div className="w-1/2">
                    <label htmlFor="startTimestamp" className="text-sm font-medium text-gray-700">
                        Select Start Timestamp:
                    </label>
                    <select
                        id="startTimestamp"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={startTimestamp}
                        onChange={(e) => setStartTimestamp(Number(e.target.value))}
                    >
                        {filteredTimestamps.map((timestamp) => (
                            <option key={timestamp} value={timestamp}>
                                {new Date(timestamp * 1000).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-1/2">
                    <label htmlFor="endTimestamp" className="text-sm font-medium text-gray-700">
                        Select End Timestamp:
                    </label>
                    <select
                        id="endTimestamp"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={endTimestamp}
                        onChange={(e) => setEndTimestamp(Number(e.target.value))}
                    >
                        {filteredTimestamps.map((timestamp) => (
                            <option key={timestamp} value={timestamp}>
                                {new Date(timestamp * 1000).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-full h-96 rounded-lg bg-white p-4 shadow-md">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
