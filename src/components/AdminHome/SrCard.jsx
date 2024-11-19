import React, { useState,useEffect } from "react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/firebase"; // Firebase config path
import { ChartSR } from "../AdminHome/chart";

export function CardDefault({ srData, srKey }) {
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const [lat, setLat] = useState(""); // Latitude state
  const [lng, setLng] = useState(""); // Longitude state
  const [uid, setUid] = useState(null);

      useEffect(() => {
        const auth = getAuth();

        // Mendapatkan UID pengguna yang sedang login
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid); // Simpan UID pengguna ke state
            } else {
                console.log('Pengguna belum login');
            }
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);
  // Toggle modal visibility
  const toggleModal = () => {
    setIsOpen(!isOpen);
    setLat("");
    setLng("");
  };

  // Handle form submission
  const handleSaveLocation = () => {
    if (!lat || !lng) {
      alert("Please fill in both Latitude and Longitude.");
      return;
    }

    // Firebase reference for Maps key
    const mapsRef = ref(database, `UsersData/${uid}/${srKey}/Maps`);

    // Save data to Firebase
    update(mapsRef, {
      latitude: lat,
      longitude: lng,
    })
      .then(() => {
        alert("Location added successfully!");
        toggleModal();
      })
      .catch((error) => {
        console.error("Error adding location:", error);
        alert("Failed to add location. Please try again.");
      });
  };

  const timestampCount = Object.keys(srData.readings || {}).length;

  return (
    <>
      <Card className="mt-6 w-96" color="blue-gray">
        <CardBody>
          <CardHeader color="blue-white" className="relative h-56 m-1">
            <ChartSR readings={srData.readings} /> {/* Kirim data readings ke ChartSR */}
          </CardHeader>
          <Typography variant="h5" color="blue-white" className="mb-2">
            {srKey} - Total Timestamps: {timestampCount}
          </Typography>
          <Typography>Range: {srData.charts?.range || "N/A"}</Typography>
        </CardBody>
        <CardFooter className="pt-0">
          <Button color="blue" onClick={toggleModal}>
            Add Location
          </Button>
        </CardFooter>
      </Card>

      {/* Modal for Adding Location */}
      <Dialog open={isOpen} handler={toggleModal}>
        <DialogHeader>Add Location for {srKey}</DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              type="number"
              step="any"
            />
            <Input
              label="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              type="number"
              step="any"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button color="red" onClick={toggleModal} className="mr-2">
            Cancel
          </Button>
          <Button color="blue" onClick={handleSaveLocation}>
            Save Location
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
