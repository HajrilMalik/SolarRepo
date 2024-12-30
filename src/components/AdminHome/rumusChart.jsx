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

export function ChartRumus({ readings }) {
    const [startTimestamp, setStartTimestamp] = useState(0);
    const [endTimestamp, setEndTimestamp] = useState(0);
    const [panelDimensions, setPanelDimensions] = useState(0.00052); // Default panel dimension 1 m²
    const [efficiency, setEfficiency] = useState(80); // Default efficiency 80%
    const [timestamps, setTimestamps] = useState([]); // Array untuk menyimpan semua timestamp
    const [allTimestamps, setAllTimestamps] = useState([]);

    // States for manually selecting start and end date
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

        // State untuk checkbox
        const [showIrradiance, setShowIrradiance] = useState(true);
        const [showPmax, setShowPmax] = useState(true);
        const [showImax, setShowImax] = useState(false);  
        const [showVmax, setShowVmax] = useState(false);
        const [selectedCharts, setSelectedCharts] = useState([true, true, false, false]);

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

    const handlePanelDimensionsChange = (e) => {
        setPanelDimensions(parseFloat(e.target.value));
    };

    const handleEfficiencyChange = (e) => {
        setEfficiency(parseFloat(e.target.value));
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

    // Extract data for Irradiance, Pmax, and timestamp
    let readingData = filteredReadings.map((key) => {
        const reading = readings[key];
        const volt = reading.Volt || {};
        const current = reading.Current || {};

        let pmax = 0;
        let imax = 0;
        let vmax = 0;
        Object.keys(volt).forEach((index) => {
            const v = volt[index] || 0;
            const c = current[index] || 0;
            const power = v * c;
            if (power > pmax) {
                pmax = power;
                vmax = v;  // Update Vmax when power is highest
            }
            if (c > imax) {
                imax = c;  // Update Imax when current is highest
            }
        });

        // Perhitungan irradiance
        const irradiance = pmax / (1000 * panelDimensions * (efficiency / 100));

        return {
            timestamp: reading.timestamp,
            irradiance: irradiance,
            pmax: pmax,
            imax: imax,
            vmax: vmax
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
    const imaxData = readingData.map((data) => data.imax);
    const vmaxData = readingData.map((data) => data.vmax);

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
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-lg shadow-lg"
            style={{
                background: "linear-gradient(135deg, #4A90E2, #50C9C3)", // Gradasi biru
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

            {/* Dropdown untuk panel dimensions dan efficiency */}
            <div className="flex justify-between gap-4 mb-4">
                {/* Input untuk panel dimensions */}
                <div className="w-1/2">
                    <label htmlFor="panelDimensions" className="text-sm font-medium text-gray-700">
                        Panel Dimension (m²):
                    </label>
                    <input
                        type="number"
                        id="panelDimensions"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={panelDimensions}
                        onChange={handlePanelDimensionsChange}
                        step="0.00001"
                    />
                </div>

                {/* Input untuk efficiency */}
                <div className="w-1/2">
                    <label htmlFor="efficiency" className="text-sm font-medium text-gray-700">
                        Efficiency (%):
                    </label>
                    <input
                        type="number"
                        id="efficiency"
                        className="border rounded px-2 py-1 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={efficiency}
                        onChange={handleEfficiencyChange}
                        min="1"
                        max="100"
                        step="1"
                    />
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
