import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import {
  Navbar,
  Typography,
  IconButton,
  Button,
  Collapse,
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

export function NavbarWithSolidBackground() {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false),
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography as="li" variant="small" color="blue-gray" className="p-1 font-normal">
        <a href="#" className="flex items-center">Pages</a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="p-1 font-normal">
        <a href="#" className="flex items-center">Account</a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="p-1 font-normal">
        <a href="#" className="flex items-center">Blocks</a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="p-1 font-normal">
        <a href="#" className="flex items-center">Docs</a>
      </Typography>
    </ul>
  );

  return (
    <Navbar className="sticky top-0 z-10 h-max max-w-full bg-gray-100 rounded-none px-4 py-2 lg:px-8 lg:py-4">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography as="a" href="#" className="mr-4 cursor-pointer py-1.5 font-medium">
          Material Tailwind
        </Typography>
        <div className="mr-4 hidden lg:block">{navList}</div>
        <Button variant="gradient" size="sm" className="hidden lg:inline-block">
          <span>Get started</span>
        </Button>
        <IconButton
          variant="text"
          className="lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        {navList}
        <Button fullWidth variant="gradient" size="sm">
          <span>Get started</span>
        </Button>
      </Collapse>
    </Navbar>
  );
}

export function HomeUser() {
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]); // State untuk menyimpan koordinat marker

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const handleMarkerClick = (markerId) => setSelectedMarker(selectedMarker === markerId ? null : markerId);

  // Indonesia map bounds
  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  useEffect(() => {
    const mapsRef = ref(database, "Maps"); // Path ke data di Firebase

    // Ambil data dari Firebase
    onValue(mapsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Mengubah data menjadi array untuk setiap kota dengan lat dan lng
        const markerData = Object.entries(data).map(([city, coords]) => ({
          name: city,
          lat: coords.lat,
          lng: coords.lng,
        }));
        setMarkers(markerData); // Simpan data ke state markers
      }
    });
  }, []);

  return (
    <div className="flex">
      {selectedMarker && (
        <Card className="h-[calc(100vh-2rem)] w-64 p-4 shadow-xl shadow-blue-gray-900/5">
          <div className="mb-2 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">Sidebar {selectedMarker}</Typography>
            <button onClick={() => setSelectedMarker(null)} className="text-gray-500 hover:text-gray-700">X</button>
          </div>
          {renderSidebarContent()}
        </Card>
      )}

      <div className="flex-1">
        <NavbarWithSolidBackground />
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
            {/* Render marker untuk setiap koordinat dari Firebase */}
            {markers.map((marker) => (
              <Marker
                key={marker.name}
                position={[marker.lat, marker.lng]}
                eventHandlers={{
                  click: toggleSidebar,
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
