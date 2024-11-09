import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import { Button, Input, Navbar, Typography } from "@material-tailwind/react";
import { Card } from "@material-tailwind/react";
import { Line } from "react-chartjs-2";
import { DocSearch } from '@docsearch/react';
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Chart from 'chart.js/auto';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Component untuk memfokuskan peta pada lokasi
function MapFocus({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 10);
    }
  }, [position, map]);

  return null;
}

export function HomeUser() {
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusPosition, setFocusPosition] = useState(null);
  const APP_ID = "1:499406911147:web:5970d609596a6357fc29ee";
  const INDEX_NAME = "solar";
  const API_KEY = "AIzaSyBFrYcwWKfN9zLepg0P3tlFNmlLP7TDSMw";

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const toggleSidebar = (marker = null) => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedMarker(marker);
  };

  // data dummy
  const chartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Data Dummy",
        data: [10, 20, 15, 30, 25, 35],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  useEffect(() => {
    const mapsRef = ref(database, "Maps");

    onValue(mapsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const markerData = Object.entries(data).map(([city, coords]) => ({
          name: city,
          lat: coords.lat,
          lng: coords.lng,
        }));
        setMarkers(markerData);
      }
    });
  }, []);

  // Fungsi pencarian
  const handleSearch = () => {
    const marker = markers.find((m) => m.name.toLowerCase() === searchTerm.toLowerCase());
    if (marker) {
      setFocusPosition([marker.lat, marker.lng]);
      setSelectedMarker(marker);
      setIsSidebarOpen(true);
    } else {
      alert("Marker tidak ditemukan");
    }
  };

  // Fungsi untuk menangani login (contoh sederhana)
  const handleLogin = () => {
    alert("Login clicked!");
  };

  return (
    <div className="flex">
      {isSidebarOpen && selectedMarker && (
        <Card className="h-[calc(100vh-2rem)] w-64 p-4 shadow-xl shadow-blue-gray-900/5">
          <div className="mb-2 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">Sidebar</Typography>
            <button onClick={() => toggleSidebar()} className="text-gray-500 hover:text-gray-700">X</button>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      )}

      <div className="flex-1">
        <Navbar className="w-full px-4 py-2 shadow-lg flex items-center justify-between">
          <Typography variant="h6" color="blue-gray">SolarRep</Typography>

          {/* tombol searchbar dan login */}
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:!border-t-gray-900 group-hover:border-2 group-hover:!border-gray-900"
              labelProps={{ className: "hidden" }}
            />
            <Button onClick={handleSearch} className="ml-2">Search</Button>
            <Button onClick={handleLogin} className="ml-4 bg-blue-500">Login</Button>
          </div>
        </Navbar>

        <div className="relative h-[calc(100vh-4rem)] p-4">
          <MapContainer
            center={[-2.548926, 118.0148634]}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            bounds={indonesiaBounds}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers.map((marker) => (
              <Marker
                key={marker.name}
                position={[marker.lat, marker.lng]}
                eventHandlers={{
                  click: () => toggleSidebar(marker),
                }}
              >
                <Popup>
                  <strong>{marker.name}</strong><br />
                  Latitude: {marker.lat}, Longitude: {marker.lng}
                </Popup>
              </Marker>
            ))}
            {focusPosition && <MapFocus position={focusPosition} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default HomeUser;
