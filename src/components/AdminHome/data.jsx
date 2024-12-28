import { useState } from "react";
import { Progress,Typography } from "@material-tailwind/react";
// Fungsi untuk memeriksa apakah SR masih aktif
export const isActive = (readings) => {
  const threshold = 1800; // Threshold dalam detik (30 menit)
  const now = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik
  const timestampKeys = Object.keys(readings);
  const latestTimestamp = Math.max(...timestampKeys.map((key) => parseInt(key))); // Timestamp terbaru
  const timeDiff = now - latestTimestamp;

  return timeDiff <= threshold; // Jika perbedaan waktu lebih kecil atau sama dengan threshold, berarti aktif
};

export function Data({ readings, srKey }) {  // Add srKey prop here
  const srStatus = isActive(readings) ? "Aktif" : "Tidak Aktif";
  // Urutkan timestamp berdasarkan waktu terbaru
  const timestampKeys = Object.keys(readings).sort((a, b) => b - a);
  
  // Pilih timestamp terbaru sebagai default
  const [selectedTimestamp, setSelectedTimestamp] = useState(timestampKeys[0]);
  
  const currentReading = readings[selectedTimestamp];

  const handleTimestampChange = (event) => {
    setSelectedTimestamp(event.target.value);
  };

  if (!currentReading) {
    return <div>No data available for the selected timestamp</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4 h-full">
      {/* Title and Timestamp Selector */}
      <div className="mb-2 flex justify-between items-center">
                  <Typography variant="h5" color="light-blue" className="mb-2">
                    {srKey}
                  </Typography>
        <select
          id="timestampSelect"
          value={selectedTimestamp}
          onChange={handleTimestampChange}
          className="border rounded px-2 py-2 w-[40%] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {timestampKeys.map((timestamp) => (
            <option key={timestamp} value={timestamp}>
              {new Date(Number(timestamp) * 1000).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {/* Status Keterangan */}
      <div className="mb-2">
        <span className={`text-xl font-semibold ${srStatus === 'Aktif' ? 'text-green-600' : 'text-red-600'}`}>
          {srStatus}
        </span>
      </div>



      {/* Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Irradiance */}
        <div className="p-4 rounded-lg shadow-md bg-gray-50 h-full">
          <h4 className="text-lg font-medium text-gray-800">Irradiance</h4>
          <Progress value={currentReading.Irradiance} color="amber" className="h-2" />
          <div className="text-center mt-1 text-gray-600 text-sm">{currentReading.Irradiance} W/m²</div>
        </div>

        {/* Power Output */}
        <div className="p-4 rounded-lg shadow-md bg-gray-50 h-full">
          <h4 className="text-lg font-medium text-gray-800">Power Output (Pmax)</h4>
          <Progress value={currentReading.Pmax} color="green" className="h-2" />
          <div className="text-center mt-1 text-gray-600 text-sm">{currentReading.Pmax} mW</div>
        </div>
      </div>

      {/* Voltage and Current */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="p-4 rounded-lg shadow-md bg-gray-50 h-full">
          <h4 className="text-lg font-medium text-gray-800">Max Voltage (Vmax)</h4>
          <Progress value={currentReading.Vmax} color="purple" className="h-2" />
          <div className="text-center mt-1 text-gray-600 text-sm">{currentReading.Vmax} V</div>
        </div>

        {/* Max Current (Imax) */}
        <div className="p-4 rounded-lg shadow-md bg-gray-50 h-full">
          <h4 className="text-lg font-medium text-gray-800">Max Current (Imax)</h4>
          <Progress value={currentReading.Imax} color="orange" className="h-2" />
          <div className="text-center mt-1 text-gray-600 text-sm">{currentReading.Imax} mA</div>
        </div>
      </div>
    </div>
  );
}
