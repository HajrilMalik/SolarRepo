import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Card,
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
import { ChartVoltagePower } from "./voltagechart";
import { ChartRumus } from "./rumusChart";
import { Data } from "./data";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";

export function CardDefault({ srData, srKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState("data");
  const [selectedChart, setSelectedChart] = useState("chartSR");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        console.log("Pengguna belum login");
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
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
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
        alert(
          `Marker set to ${visibility ? "Public" : "Private"} successfully!`
        );
      })
      .catch((error) => {
        console.error("Error updating visibility:", error);
        alert("Failed to update marker visibility. Please try again.");
      });
  };

  const timestampCount = Object.keys(srData.readings || {}).length;

  // Custom GeoSearch Component
  function MapWithSearch() {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: "bar",
        autoComplete: true,
        autoCompleteDelay: 250,
        retainZoomLevel: false,
        searchLabel: "Search location",
      });

      map.addControl(searchControl);

      map.on("geosearch/showlocation", (result) => {
        const { x, y } = result.location;
        setLng(x);
        setLat(y);
      });

      return () => map.removeControl(searchControl);
    }, [map]);

    return null;
  }

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLat(lat);
        setLng(lng);
      },
    });

    return lat && lng ? <Marker position={[lat, lng]} /> : null;
  }

  return (
    <>
      <Card className="mt-6 w-full md:w-[48%]" color="blue-gray">
        <CardBody>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <TabsHeader>
              <Tab value="data">Data</Tab>
              <Tab value="chartSR">Irradiance</Tab>
              <Tab value="chartPower">Power</Tab>
              <Tab value="voltage">Voltage</Tab>
            </TabsHeader>
            <TabsBody>
              <TabPanel className="w-full" value="chartSR">
                <div className="mb-4">
                  <label className="mr-2 text-gray-700">Select Chart:</label>
                  <select
                    value={selectedChart}
                    onChange={(e) => setSelectedChart(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="chartSR">ChartSR</option>
                    <option value="chartRumus">ChartRumus</option>
                  </select>
                </div>
                {selectedChart === "chartSR" ? (
                  <ChartSR readings={srData.readings} />
                ) : (
                  <ChartRumus readings={srData.readings} />
                )}
              </TabPanel>
              <TabPanel value="chartPower">
                <ChartPower readings={srData.readings} />
              </TabPanel>
              <TabPanel value="voltage">
                <ChartVoltagePower readings={srData.readings} />
              </TabPanel>
              <TabPanel value="data">
                <Data readings={srData.readings} />
              </TabPanel>
            </TabsBody>
          </Tabs>
          <Typography variant="h5" color="light-blue" className="mb-2">
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
            <MapContainer
              center={[lat || -6.1751, lng || 106.865]}
              zoom={13}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapWithSearch />
              <LocationMarker />
            </MapContainer>
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
