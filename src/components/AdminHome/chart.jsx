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
    const [showImax, setShowImax] = useState(false);  
    const [showVmax, setShowVmax] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState([true, true, false, false]); // Menyimpan status checkbox

    const handleCheckboxChange = (setState, chartType) => {
        if (selectedCharts.filter(Boolean).length >= 2 && !selectedCharts[chartType]) {
            alert("Anda hanya dapat memilih hingga 2 grafik.");
            return;
        }
    
        setState((prevState) => {
            const updatedState = !prevState;
            const updatedSelectedCharts = [...selectedCharts];
            updatedSelectedCharts[chartType] = updatedState;
            setSelectedCharts(updatedSelectedCharts);
            return updatedState;
        });
    };

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
        const imax = reading.Imax || 0; // Ambil data Imax
        const vmax = reading.Vmax || 0; // Ambil data Vmax

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax,
            imax: imax,
            vmax: vmax,
 };
    });

    readingData = readingData.sort((a, b) => a.timestamp - b.timestamp);

    const labels = readingData.map((data) => {
        const date = new Date(data.timestamp * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });

    const irradianceData = readingData.map((data) => data.irradiance);
    const pmaxData = readingData.map((data) => data.pmax);
    const imaxData = readingData.map((data) => data.imax); // Data Imax
    const vmaxData = readingData.map((data) => data.vmax); // Data Vmax

    
    
    const chartData = {
        labels: labels,
        datasets: [
            showIrradiance && {
                label: "Irradiance (W/m²)",
                data: irradianceData,
                borderColor: "rgba(66, 165, 245, 1)",
                backgroundColor: "rgba(66, 165, 245, 0.2)",
                yAxisID: 'y1',
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
                yAxisID: (showIrradiance  ? 'y2' : 'y1'),
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(255, 159, 64, 1)",
            },
            showImax && {
                label: "Imax (A)",
                data: imaxData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                yAxisID: (showIrradiance || showPmax ? 'y2' : 'y1'),
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(75, 192, 192, 1)",
            },
            showVmax && {
                label: "Vmax (V)",
                data: vmaxData,
                borderColor: "rgba(153, 102, 255, 1)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                yAxisID: (showIrradiance || showPmax || showImax ? 'y2' : 'y1'),
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgba(153, 102, 255, 1)",
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
                    display: showIrradiance || showPmax || showVmax || showImax,
                    text: showIrradiance ? 'Irradiance (W/m²)' : (showPmax ? 'Pmax (W)' : (showVmax ? 'Vmax (V)' : 'Imax (A)')),
                },
                min: 0, // Set titik 0 untuk y1
                display: showIrradiance || showPmax || showVmax || showImax,
            },
            y2: {
                type: 'linear',
                position: 'right',
                title: {
                    display: showIrradiance || showPmax || showImax || showVmax,
                    text: showPmax ? 'Power (W)' : (showImax ? 'Current (A)' : (showVmax ? 'Voltage (V)' : '')),
                },
                min: 0, // Set titik 0 untuk y2
                display: showIrradiance && showPmax || showIrradiance && showImax || showPmax && showImax || showIrradiance && showVmax || showPmax && showVmax || showImax && showVmax,
                ticks: {
                    // Menyesuaikan rentang untuk y2
                    beginAtZero: false, // Pastikan angka mulai dari 0
                    max: Math.max(...vmaxData, ...imaxData, ...pmaxData), // Menyesuaikan rentang data vmax, imax, dan pmax
                },
            },
        },
    };
    
    
        
    
    
    
    
    
    
    

    return (
        <div
            className="bg-gradient-to-r from-blue-500 to-blue-700 text -white p-4 rounded-lg shadow-lg"
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
                        onChange={() => handleCheckboxChange(setShowIrradiance, 0)}
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
                        onChange={() => handleCheckboxChange(setShowPmax, 1)}
                        className="ml-2"
                    />
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                    <label htmlFor="showImax" className="text-sm font-medium text-gray-700">
                        Show Imax
                    </label>
                    <input
                        type="checkbox"
                        id="showImax"
                        checked={showImax}
                        onChange={() => handleCheckboxChange(setShowImax, 2)}
                        className="ml-2"
                    />
                </div>

                <div className="w-1/2">
                    <label htmlFor="showVmax" className="text-sm font-medium text-gray-700">
                        Show Vmax
                    </label>
                    <input
                        type="checkbox"
                        id="showVmax"
                        checked={showVmax}
                        onChange={() => handleCheckboxChange(setShowVmax, 3)}
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