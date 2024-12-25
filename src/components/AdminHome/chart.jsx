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
    const [timestamps, setTimestamps] = useState([]); // Array untuk menyimpan semua timestamp
    const [allTimestamps, setAllTimestamps] = useState([]);

    // States for manually selecting start and end date
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (readings && Object.keys(readings).length > 0) {
            const allTimestamps = Object.keys(readings).map(key => readings[key].timestamp);
            setAllTimestamps(allTimestamps);  // Simpan semua timestamp
    
            const readingData = allTimestamps.map(ts => ({
                timestamp: ts,
                reading: readings[ts]
            })).sort((a, b) => a.timestamp - b.timestamp);
    
            const latestTimestamp = readingData[readingData.length - 1]?.timestamp || 0;
            const oneDayBefore = latestTimestamp - (1 * 24 * 60 * 60);
    
            setTimestamps(allTimestamps);  // Tetap simpan semua timestamp di dropdown
            setEndTimestamp(latestTimestamp);
    
            // Temukan timestamp terdekat 1 hari sebelum
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

    // Filter timestamps berdasarkan startDate dan endDate
    const filteredTimestamps = allTimestamps.filter((timestamp) => {
        return timestamp >= startTimestamp && timestamp <= endTimestamp;
    });

    if (!readings || Object.keys(readings).length === 0) {
        return <div>No data available</div>;
    }

    // Filter readings berdasarkan selected timestamps
    const filteredReadings = Object.keys(readings).filter((key) => {
        const readingTimestamp = readings[key].timestamp;
        return readingTimestamp >= startTimestamp && readingTimestamp <= endTimestamp;
    });

    // Extract data for Irradiance and timestamp directly from Firebase
    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];
        const volt = reading.Volt || {};
        const current = reading.Current || {};

        let pmax = 0;
        Object.keys(volt).forEach((index) => {
            const v = volt[index] || 0;
            const c = current[index] || 0;
            const power = v * c;
            if (power > pmax) {
                pmax = power;
            }
        });

        // Directly use irradiance if available in the Firebase data
        const irradiance = reading.Irradiance || pmax / 1000;  // Default to calculated value if not available

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax,
        };
    });

    // Sort by timestamp
    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    // Prepare labels and datasets
    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const irradianceData = readingData.map((data) => data.irradiance);
    const pmaxData = readingData.map((data) => data.pmax);

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
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
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
                        const formattedTime = fullDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                        const irradiance = context.raw;
                        const pmax = pmaxData[index];
                        return `Irradiance: ${irradiance} W/m²\nPmax: ${pmax} W\nDate: ${fullDate.toLocaleDateString()}, Time: ${formattedTime}`;
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
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)", // Gradasi biru
            }}
        >
            <h1 className="text-center text-2xl font-bold mb-2 tracking-wider">
                Irradiance Chart
            </h1>

            {/* Flexbox untuk menata form input */}
            <div className="flex justify-between gap-4 mb-4">
                {/* Input untuk memilih start tanggal */}
                <div className="w-1/2">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                        Start Date and Time:
                    </label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </div>

                {/* Input untuk memilih end tanggal */}
                <div className="w-1/2">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                        End Date and Time:
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

            {/* Flexbox untuk select timestamp start dan end */}
            <div className="flex justify-between gap-4 mb-4">
                {/* Select untuk memilih start timestamp */}
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

                {/* Select untuk memilih end timestamp */}
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

            {/* Chart area */}
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
