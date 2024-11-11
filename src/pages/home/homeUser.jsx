// src/components/HomeUser .jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import { Button, Input, Navbar, Typography } from "@material-tailwind/react";
import { Card } from "@material-tailwind/react";

import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Impor Firebase Auth
import { DocSearch } from '@docsearch/react';

import { UsersData } from '@/components/AdminHome/AdminHome';

// Component untuk memfokuskan peta pada lokasi tertentu
function MapFocus({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 10);
    }
  }, [position, map]);

  return null;
}

const TABLE_HEAD = ["Name", "Job", "Employed", ""];

const TABLE_ROWS = [
  {
    name: "John Michael",
    job: "Manager",
    date: "23/04/18",
  },
  {
    name: "Alexa Liras",
    job: "Developer",
    date: "23/04/18",
  },
  {
    name: "Laurent Perrier",
    job: "Executive",
    date: "19/09/17",
  },
  {
    name: "Michael Levi",
    job: "Developer",
    date: "24/12/08",
  },
  {
    name: "Richard Gran",
    job: "Manager",
    date: "04/10/21",
  },
];

export function HomeUser () {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusPosition, setFocusPosition] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State untuk status autentikasi

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const toggleSidebar = (marker = null) => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedMarker(marker);
  };

    // data dummy


  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Update status autentikasi
    });

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

    return () => {
      unsubscribe(); // Unsubscribe dari listener saat komponen unmount
    };
  }, []);

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

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Logout berhasil
      console.log("User  logged out");
    }).catch((error) => {
      // Tangani kesalahan logout
      console.error("Logout error: ", error);
    });
  };

  return (
    <div className="flex">
      {isSidebarOpen && selectedMarker && (
        <Card className="h-[calc(100vh-2rem)] w-64 p-4 shadow-xl shadow-blue-gray-900/5">
          <div className="mb-2 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">Sidebar</Typography>
            <button onClick={() => toggleSidebar()} className="text-gray-500 hover:text-gray-700">X</button>
          </div>

          <Card className="h-full w-full overflow-scroll">
      <table className="w-full min-w-max table-auto text-left">
        <thead>
          <tr>
            {TABLE_HEAD.map((head) => (
              <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal leading-none opacity-70"
                >
                  {head}
                </Typography>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map(({ name, job, date }, index) => {
            const isLast = index === TABLE_ROWS.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";
 
            return (
              <tr key={name}>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {name}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {job}
                  </Typography>
                </td>
                <td className={classes}>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {date}
                  </Typography>
                </td>
                <td className={`${classes} bg-blue-gray-50/50`}>
                  <Typography as="a" href="#" variant="small" color="blue-gray" className="font-medium">
                    Edit
                  </Typography>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
        </Card>
      )}

      <div className="flex-1">
        <Navbar className="w-full px-4 py-2 shadow-lg flex items-center justify-between">
          <Typography variant="h6" color="blue-gray">SolarRep</Typography>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:!border-t-gray-900 group-hover:border-2 group-hover:!border-gray-900"
              labelProps={{ className: "hidden" }}
            />
            <Button onClick={handleSearch}>Search</Button>
            {isAuthenticated ? (
              <Button onClick={handleLogout} className="ml-2">Logout</Button>) : (
              <Button onClick={handleLogin} className="ml-2">Login</Button>
              )}
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

        {/* Tampilkan UsersData hanya jika pengguna sudah login */}
        <div className='p-4'>
        {isAuthenticated && <UsersData />}
        </div>
      </div>
    </div>
  );
}
export default HomeUser ;