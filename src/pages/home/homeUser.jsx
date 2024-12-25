import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase"; 
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Button, Input, Navbar, Typography } from "@material-tailwind/react";
import { Card } from "@material-tailwind/react";
import { ChartSR } from "@/components/AdminHome/chart"; 
import { UsersData } from '@/components/AdminHome/AdminHome';
import { TabsDefault } from '@/components/AdminHome/Sbar';

function MapFocus({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 10);
    }
  }, [position, map]);

  return null;
}

export function HomeUser () {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [markers, setMarkers] = useState([]); 
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedReadings, setSelectedReadings] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [focusPosition, setFocusPosition] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const toggleSidebar = (marker = null) => {
    setIsSidebarOpen(!isSidebarOpen);
    setSelectedMarker(marker);

    if (marker) {
      const srRef = ref(database, `UsersData/${marker.userId}/${marker.name}/readings`);

      onValue(srRef, (snapshot) => {
        const data = snapshot.val();
        setSelectedReadings(data || null); // Simpan data readings di state
      });
    } else {
      setSelectedReadings(null);
    }
  };

  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        const uid = user.uid;
        const userRef = ref(database, `UsersData/${uid}`);

        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const markerData = [];
            Object.keys(data).forEach((srKey) => {
              const sr = data[srKey];
              if (sr.Maps) {
                markerData.push({
                  name: srKey,
                  lat: parseFloat(sr.Maps.latitude),
                  lng: parseFloat(sr.Maps.longitude),
                  lastReadingTime: sr.readings ? Math.max(...Object.keys(sr.readings)) : 0, // Get last reading timestamp
                });
              }
            });

            setMarkers(markerData);
          }
        });
      } else {
        setIsAuthenticated(false);
      }

      const allMarkersRef = ref(database, `UsersData`);
      onValue(allMarkersRef, (snapshot) => {
        const allData = snapshot.val();
        const allMarkerData = [];
      
        if (allData) {
          Object.keys(allData).forEach((userId) => {
            const userMarkers = allData[userId];
            Object.keys(userMarkers).forEach((srKey) => {
              const sr = userMarkers[srKey];
              
            
              if (sr.Maps && sr.Maps.latitude && sr.Maps.longitude) {
                const isOwner = userId === (user?.uid || "");
                const isPublic = sr.Maps.isPublic === true;
      
                const lastReadingTime = sr.readings ? Math.max(...Object.keys(sr.readings)) : 0;
                const currentTime = Date.now() / 1000; // Current time in seconds
                const oneDayInSeconds = 1800; 
                
                const isActive = currentTime - lastReadingTime <= oneDayInSeconds;

                if (isPublic || isOwner) {
                  allMarkerData.push({
                    name: srKey,
                    lat: parseFloat(sr.Maps.latitude),
                    lng: parseFloat(sr.Maps.longitude),
                    userId: userId,
                    isPublic: isPublic,
                    isActive: isActive, // Add isActive flag
                  });
                }
              }
            });
          });
        }
      
        setMarkers(allMarkerData);
      });
      
    });

    return () => {
      unsubscribe();
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
      console.log("User logged out");
    }).catch((error) => {
      console.error("Logout error: ", error);
    });
  };

  return (
    <>
      <div className={`flex ${isMobile && isSidebarOpen ? "flex-col" : ""}`}>
        {isSidebarOpen && selectedMarker && (
          <Card
            className={`h-[calc(100vh-2rem)] ${isMobile ? "w-full" : "w-[45%]"} p-4 shadow-xl shadow-blue-gray-900/5`}
            style={isMobile ? { marginTop: '1rem' } : {}}>

            <div className="mb-2 p-2 flex justify-between items-center relative">
              <div className='w-[97%]'>
                <TabsDefault selectedReadings={selectedReadings} selectedMarker={selectedMarker} />
              </div>
              <button 
                onClick={() => toggleSidebar()} 
                className="absolute top-4 right-1 text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
          </Card>
        )}

        <div className={`flex-1 ${isMobile && isSidebarOpen ? "order-first" : ""}`}>
          <Navbar className="w-full px-4 py-2 shadow-lg flex items-center justify-between">
            <Typography variant="h6" color="blue-gray">SolarRep</Typography>
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Cari"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:!border-t-gray-900 group-hover:border-2 group-hover:!border-gray-900"
                labelProps={{ className: "hidden" }}
              />
              <Button onClick={handleSearch}>Cari</Button>
              {isAuthenticated ? (
                <Button onClick={handleLogout} className="ml-2">Logo-ut</Button>
              ) : (
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
                  key={`${marker.userId}-${marker.name}`}
                  position={[marker.lat, marker.lng]}
                  icon={new L.Icon({
                    iconUrl: marker.isActive ? 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png' : 'img/Red-Mark.png',
                    iconSize: marker.isActive ? [25, 41] : [36, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                  })}
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
      <div className="p-4">
        {isAuthenticated && <UsersData />}
      </div>
    </>
  );
}

export default HomeUser;
