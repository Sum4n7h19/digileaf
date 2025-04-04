"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Get_DIGIPIN = (lat: number, lon: number) => {
  const L = [
    ["F", "C", "9", "8"],
    ["J", "3", "2", "7"],
    ["K", "4", "5", "6"],
    ["L", "M", "P", "T"],
  ];

  let vDIGIPIN = "";
  let row = 0, column = 0;
  let MinLat = 2.5, MaxLat = 38.5, MinLon = 63.5, MaxLon = 99.5;
  const LatDivBy = 4, LonDivBy = 4;
  let LatDivDeg = 0, LonDivDeg = 0;

  if (lat < MinLat || lat > MaxLat || lon < MinLon || lon > MaxLon) {
    return "Out of Range";
  }

  for (let Lvl = 1; Lvl <= 10; Lvl++) {
    LatDivDeg = (MaxLat - MinLat) / LatDivBy;
    LonDivDeg = (MaxLon - MinLon) / LonDivBy;

    let NextLvlMaxLat = MaxLat;
    let NextLvlMinLat = MaxLat - LatDivDeg;

    for (let x = 0; x < LatDivBy; x++) {
      if (lat >= NextLvlMinLat && lat < NextLvlMaxLat) {
        row = x;
        break;
      } else {
        NextLvlMaxLat = NextLvlMinLat;
        NextLvlMinLat = NextLvlMaxLat - LatDivDeg;
      }
    }

    let NextLvlMinLon = MinLon;
    let NextLvlMaxLon = MinLon + LonDivDeg;

    for (let x = 0; x < LonDivBy; x++) {
      if (lon >= NextLvlMinLon && lon < NextLvlMaxLon) {
        column = x;
        break;
      } else if (NextLvlMinLon + LonDivDeg < MaxLon) {
        NextLvlMinLon = NextLvlMaxLon;
        NextLvlMaxLon = NextLvlMinLon + LonDivDeg;
      } else {
        column = x;
      }
    }

    if (Lvl === 1 && L[row][column] === "0") {
      return "Out of Bound";
    }

    vDIGIPIN += L[row][column];
    if (Lvl === 3 || Lvl === 6) vDIGIPIN += "-";

    MinLat = NextLvlMinLat;
    MaxLat = NextLvlMaxLat;
    MinLon = NextLvlMinLon;
    MaxLon = NextLvlMaxLon;
  }

  return vDIGIPIN;
};

const MapEvents = ({ setCursorLat, setCursorLon, setDigipin }: any) => {
  useMapEvents({
    mousemove(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      setCursorLat(lat);
      setCursorLon(lon);
      setDigipin(Get_DIGIPIN(lat, lon));
    },
  });
  return null;
};

export default function MapWithDigipin() {
  const [digipin, setDigipin] = useState("");
  const [cursorLat, setCursorLat] = useState<number | null>(null);
  const [cursorLon, setCursorLon] = useState<number | null>(null);

  return (
    <>
      <div className="w-full h-[500px] max-w-4xl border shadow rounded">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Carto Light">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; CartoDB"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Carto Dark">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; CartoDB"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="ESRI Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <MapEvents
            setCursorLat={setCursorLat}
            setCursorLon={setCursorLon}
            setDigipin={setDigipin}
          />
        </MapContainer>
      </div>

      <div className="text-lg mt-2">
        {cursorLat && cursorLon ? (
          <>
            <p>
              <strong>Lat:</strong> {cursorLat.toFixed(6)} |{" "}
              <strong>Lon:</strong> {cursorLon.toFixed(6)}
            </p>
            <p>
              <strong>DIGIPIN:</strong> {digipin}
            </p>
          </>
        ) : (
          <p>Move your mouse over the map...</p>
        )}
      </div>
    </>
  );
}
