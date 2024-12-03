import React, { useState, useEffect } from "react";
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
import { database } from "../../firebase/firebase";
import { ChartSR } from "../AdminHome/chart";
import { ChartPower } from "./powerchart";

export function CardDefault({ srData, srKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [uid, setUid] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        console.log('Pengguna belum login');
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setLat("");
    setLng("");
  };

  const handleSaveLocation = () => {
    if (!lat || !lng) {
      alert("Please fill in both Latitude and Longitude.");
      return;
    }

    const mapsRef = ref(database, `UsersData/${uid}/${srKey}/Maps`);

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

  const handleSetVisibility = (visibility) => {
    const mapsRef = ref(database, `UsersData/${uid}/${srKey}/Maps`);

    update(mapsRef, { isPublic: visibility })
      .then(() => {
        alert(`Marker set to ${visibility ? "Public" : "Private"} successfully!`);
      })
      .catch((error) => {
        console.error("Error updating visibility:", error);
        alert("Failed to update marker visibility. Please try again.");
      });
  };

  const timestampCount = Object.keys(srData.readings || {}).length;

  return (
    <>
      <Card className="mt-6 w-full" color="blue-gray">
        <CardBody>
          <Typography variant="h5" color="blue-white" className="mb-2">
            {srKey} - Total Timestamps: {timestampCount}
          </Typography>
          <Typography className="m-4">TEJA GANTENG: {srData.charts?.range || "N/A"}</Typography>
          <div className="h-4"></div> 
          
          <div className={`
            grid 
            ${isMobile 
              ? 'grid-cols-1 gap-4' 
              : 'grid-cols-2 gap-4'
            }
          `}>
            <div className="w-full">
              <CardHeader color="blue-white" className="relative h-full"> 
                <ChartSR readings={srData.readings} />
              </CardHeader>
            </div>
            <div className="w-full">
              <CardHeader color="blue-white" className="relative h-full"> 
                <ChartPower readings={srData.readings} />
              </CardHeader>
            </div>
          </div>
        </CardBody>

        <CardFooter className="pt-0 flex flex-wrap justify-start space-x-2"> 
          <Button color="blue" onClick={toggleModal} className="mb-2">
            Add Location
          </Button>
          <Button color="green" onClick={() => handleSetVisibility(true)} className="mb-2">
            Public
          </Button>
          <Button color="red" onClick={() => handleSetVisibility(false)} className="mb-2">
            Private
          </Button>
        </CardFooter>
      </Card>

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