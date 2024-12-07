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
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from "@material-tailwind/react";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/firebase"; // Firebase config path
import { ChartSR } from "../AdminHome/chart";
import { ChartPower } from "./powerchart";
import { ChartVoltagePower } from "./voltagechart"; // Import the voltage chart component

export function CardDefault({ srData, srKey }) {
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const [lat, setLat] = useState(""); // Latitude state
  const [lng, setLng] = useState(""); // Longitude state
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState("chartSR"); // Active Tab State

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
      <Card className="mt-6  w-full md:w-[48%]" color="blue-gray">
        <CardBody>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabsHeader>
              <Tab value="chartSR">Irradience</Tab>
              <Tab value="chartPower">Power</Tab>
              <Tab value="voltage">Voltage</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel className="w-full" value="chartSR">
                <ChartSR readings={srData.readings} />
              </TabPanel>
              <TabPanel value="chartPower">
                <ChartPower readings={srData.readings} />
              </TabPanel>
              <TabPanel value="voltage">
                <ChartVoltagePower readings={srData.readings} /> {/* Use the voltage chart here */}
              </TabPanel>
            </TabsBody>
          </Tabs>
          <Typography variant="h5" color="blue-white" className="mb-2">
            {srKey} - Total Timestamps: {timestampCount}
          </Typography>
          <Typography>Range: {srData.charts?.range || "N/A"}</Typography>
        </CardBody>
        <CardFooter className="pt-0">
          <Button color="blue" onClick={toggleModal}>
            Add Location
          </Button>
          <Button color="green" onClick={() => handleSetVisibility(true)}>
            Public
          </Button>
          <Button color="red" onClick={() => handleSetVisibility(false)}>
            Private
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
