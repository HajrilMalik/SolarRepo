import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function HomeUser() {
  // Menentukan batas wilayah Indonesia
  const indonesiaBounds = L.latLngBounds([-10, 95], [6, 141]);

  return (
    <MapContainer
      center={[-2.5, 118.0]}  // Pusat Indonesia
      zoom={5} 
      style={{ height: "60vh", width: "60%" }}
      maxBounds={indonesiaBounds}  // Membatasi wilayah peta
      maxBoundsViscosity={1.0}     // Menjaga agar peta tidak bergeser dari batas
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[-2.5, 118.0]}>
        <Popup>
          Pusat Indonesia. <br /> Pulau terdekat: Kalimantan.
        </Popup>
      </Marker>
    </MapContainer>
    
  );
}

export default HomeUser;
  