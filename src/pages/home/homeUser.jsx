import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import { Button } from "@material-tailwind/react";
import { Line } from "react-chartjs-2";
import {
  Navbar,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import {
  Card,
  List,
  ListItem,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

// Import chart.js and register necessary components
import { CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Chart from 'chart.js/auto';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function HomeUser() {
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]); 
  const [selectedMarker, setSelectedMarker] = useState(null);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const toggleSidebar = (marker = null) => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedMarker(marker);
  };

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

  return (
    <div className="flex">
      {isSidebarOpen && (
        <Card className="h-[calc(100vh-2rem)] w-64 p-4 shadow-xl shadow-blue-gray-900/5">
          <div className="mb-2 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">
              Sidebar
            </Typography>
            <button onClick={() => toggleSidebar()} className="text-gray-500 hover:text-gray-700">X</button>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      )}
      
      <div className="flex-1">
        <Navbar className="w-full px-4 py-2 shadow-lg">
          <Typography variant="h6" color="blue-gray">SolarRep</Typography>
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
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default HomeUser;
