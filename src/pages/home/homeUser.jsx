import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

export function HomeUser() {
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Menentukan batas wilayah Indonesia
  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  return (
    <div className="flex">
      {isSidebarOpen && (
        <Card className="h-[calc(100vh-2rem)] w-64 p-4 shadow-xl shadow-blue-gray-900/5">
          <div className="mb-2 p-4 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">
              Sidebar
            </Typography>
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">X</button>
          </div>
          <List>
            <Accordion open={open === 1}>
              <ListItem onClick={() => handleOpen(1)} className="cursor-pointer">
                <AccordionHeader className="flex items-center">
                  <PresentationChartBarIcon className="h-5 w-5 mr-3" />
                  Dashboard
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`h-4 w-4 ml-auto transition-transform ${
                      open === 1 ? "rotate-180" : ""
                    }`}
                  />
                </AccordionHeader>
              </ListItem>
            </Accordion>
            <Accordion open={open === 2}>
              <ListItem onClick={() => handleOpen(2)} className="cursor-pointer">
                <AccordionHeader className="flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 mr-3" />
                  E-Commerce
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`h-4 w-4 ml-auto transition-transform ${
                      open === 2 ? "rotate-180" : ""
                    }`}
                  />
                </AccordionHeader>
              </ListItem>
            </Accordion>
          </List>
        </Card>
      )}
      
      <div className="flex-1">
        <Navbar className="w-full px-4 py-2 shadow-lg">
          <Typography variant="h6" color="blue-gray">Solar</Typography>
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
            <Marker
              position={[-6.200000, 106.816666]}
              eventHandlers={{
                click: toggleSidebar,
              }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default HomeUser;
