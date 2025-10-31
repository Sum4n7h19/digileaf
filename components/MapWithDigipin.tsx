"use client";

import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ---------- Improved H3 dynamic import detection ----------
// Some bundlers / versions expose h3-js differently. This code probes
// the imported module for plausible function names and shapes and logs
// the module keys to the console to help debugging.

// ---------- Plus Code / DIGIPIN / ULPIN helpers (unchanged) ----------
const SEPARATOR = "+";
const SEPARATOR_POSITION = 8;
const PADDING_CHARACTER = "0";
const CODE_ALPHABET = "23456789CFGHJMPQRVWX";
const ENCODING_BASE = CODE_ALPHABET.length;
const LATITUDE_MAX = 90;
const LONGITUDE_MAX = 180;
const PAIR_CODE_LENGTH = 10;
const GRID_ROWS = 5;
const GRID_COLUMNS = 4;

function clip(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function encodeOpenLocationCode(lat: number, lon: number, codeLength = PAIR_CODE_LENGTH): string {
  if (codeLength < 2 || (codeLength < SEPARATOR_POSITION && codeLength % 2 === 1)) {
    throw new Error("Invalid code length");
  }

  let latitude = clip(lat, -LATITUDE_MAX, LATITUDE_MAX);
  let longitude = clip(lon, -LONGITUDE_MAX, LONGITUDE_MAX);

  latitude += LATITUDE_MAX;
  longitude += LONGITUDE_MAX;

  let code = "";

  const pairs = Math.min(Math.floor(codeLength / 2), SEPARATOR_POSITION / 2);

  let latRange = LATITUDE_MAX * 2;
  let lonRange = LONGITUDE_MAX * 2;

  for (let i = 0; i < pairs; i++) {
    latRange /= ENCODING_BASE;
    lonRange /= ENCODING_BASE;

    const latIndex = Math.floor(latitude / latRange);
    const lonIndex = Math.floor(longitude / lonRange);

    const firstDigit = Math.floor(latIndex % ENCODING_BASE);
    const secondDigit = Math.floor(lonIndex % ENCODING_BASE);
    code += CODE_ALPHABET.charAt(firstDigit) + CODE_ALPHABET.charAt(secondDigit);

    latitude -= latIndex * latRange;
    longitude -= lonIndex * lonRange;
  }

  if (code.length < SEPARATOR_POSITION) {
    code = code + PADDING_CHARACTER.repeat(SEPARATOR_POSITION - code.length);
  }
  code = code.slice(0, SEPARATOR_POSITION) + SEPARATOR + code.slice(SEPARATOR_POSITION);

  if (code.replace(SEPARATOR, "").length < codeLength) {
    let latGrid = latitude;
    let lonGrid = longitude;
    let gridLatSize = latRange;
    let gridLonSize = lonRange;

    while (code.replace(SEPARATOR, "").length < codeLength) {
      gridLatSize /= GRID_ROWS;
      gridLonSize /= GRID_COLUMNS;

      const row = Math.floor(latGrid / gridLatSize);
      const col = Math.floor(lonGrid / gridLonSize);

      const index = row * GRID_COLUMNS + col;
      code += CODE_ALPHABET.charAt(index);

      latGrid -= row * gridLatSize;
      lonGrid -= col * gridLonSize;
    }
  }

  const withoutSep = code.replace(SEPARATOR, "");
  if (withoutSep.length > codeLength) {
    let trimmed = withoutSep.slice(0, codeLength);
    trimmed = trimmed.slice(0, SEPARATOR_POSITION) + SEPARATOR + trimmed.slice(SEPARATOR_POSITION);
    return trimmed;
  }

  return code;
}

const Get_DIGIPIN = (lat: number, lon: number): string => {
  const L = [
    ["F", "C", "9", "8"],
    ["J", "3", "2", "7"],
    ["K", "4", "5", "6"],
    ["L", "M", "P", "T"],
  ];

  let vDIGIPIN = "";
  let row = 0,
    column = 0;
  let MinLat = 2.5,
    MaxLat = 38.5,
    MinLon = 63.5,
    MaxLon = 99.5;
  const LatDivBy = 4,
    LonDivBy = 4;
  let LatDivDeg = 0,
    LonDivDeg = 0;

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

function ulpinTS(lat: number, lon: number, floor: number): string {
  const base14 = "0123456789ABCD";
  const base19 = "0123456789ABCDEFGHI";
  const base32 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const latInt = Math.trunc(lat);
  const latFrac = Math.abs(lat - latInt);

  const lat1 = 90 + latInt;
  const lat1_floor = Math.floor(lat1 / 14);
  const lat1_modu = lat1 % 14;
  const lat1_14 = base14.charAt(lat1_floor) + base14.charAt(lat1_modu);

  let latFracStr = latFrac.toFixed(8);
  if (latFracStr.startsWith("0.")) latFracStr = latFracStr.slice(2);
  latFracStr = (latFracStr + "00000000").slice(0, 8);

  const lat2 = parseInt(latFracStr.slice(0, 3), 10);
  const lat2_floor = Math.floor(lat2 / 32);
  const lat2_modu = lat2 % 32;
  const lat3_32 = base32.charAt(lat2_floor) + base32.charAt(lat2_modu);

  const lat4 = parseInt(latFracStr.slice(3, 6), 10);
  const lat4_floor = Math.floor(lat4 / 32);
  const lat4_modu = lat4 % 32;
  const lat4_32 = base32.charAt(lat4_floor) + base32.charAt(lat4_modu);

  const latitude = lat1_14 + lat3_32 + lat4_32;

  const lonInt = Math.trunc(lon);
  const lonFrac = Math.abs(lon - lonInt);

  const lon1 = 180 + lonInt;
  const lon1_floor = Math.floor(lon1 / 19);
  const lon1_modu = lon1 % 19;
  const lon1_19 = base19.charAt(lon1_floor) + base19.charAt(lon1_modu);

  let lonFracStr = lonFrac.toFixed(8);
  if (lonFracStr.startsWith("0.")) lonFracStr = lonFracStr.slice(2);
  lonFracStr = (lonFracStr + "00000000").slice(0, 8);

  const lon3 = parseInt(lonFracStr.slice(0, 3), 10);
  const lon3_floor = Math.floor(lon3 / 32);
  const lon3_modu = lon3 % 32;
  const lon3_32 = base32.charAt(lon3_floor) + base32.charAt(lon3_modu);

  const lon4 = parseInt(lonFracStr.slice(3, 6), 10);
  const lon4_floor = Math.floor(lon4 / 32);
  const lon4_modu = lon4 % 32;
  const lon4_32 = base32.charAt(lon4_floor) + base32.charAt(lon4_modu);

  const f1 = floor + 544;
  const f1_floor = Math.floor(f1 / 32);
  const f1_modu = f1 % 32;
  const f1_32 = base32.charAt(f1_floor) + base32.charAt(f1_modu);

  const longitude = lon1_19 + lon3_32 + lon4_32 + f1_32;

  let ulpin = latitude + longitude;

  if (ulpin.includes("I") || ulpin.includes("O")) {
    ulpin = ulpin.replace(/I/g, "Y").replace(/O/g, "Z");
  }

  return ulpin;
}

// ---------- Map interaction & robust H3 detection ----------
interface MapEventsProps {
  setCursorLat: Dispatch<SetStateAction<number | null>>;
  setCursorLon: Dispatch<SetStateAction<number | null>>;
  setDigipin: Dispatch<SetStateAction<string>>;
  setPlusCode: Dispatch<SetStateAction<string>>;
  setULPIN: Dispatch<SetStateAction<string>>;
  setH3Index: Dispatch<SetStateAction<string>>;
  geoToH3?: (lat: number, lon: number, res: number) => string | null;
}

const MapEvents = ({ setCursorLat, setCursorLon, setDigipin, setPlusCode, setULPIN, setH3Index, geoToH3 }: MapEventsProps) => {
  useMapEvents({
    mousemove(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      setCursorLat(lat);
      setCursorLon(lon);
      setDigipin(Get_DIGIPIN(lat, lon));
      try {
        const pc = encodeOpenLocationCode(lat, lon, 10);
        setPlusCode(pc);
      } catch (err) {
        console.error(err);
        setPlusCode("Error encoding Plus Code");
      }
      try {
        const u = ulpinTS(lat, lon, 0); // default floor = 0
        setULPIN(u);
      } catch (err) {
        console.error(err);
        setULPIN("Error encoding ULPIN");
      }

      // H3 at finest resolution (15)
      if (geoToH3) {
        try {
          const h3idx = geoToH3(lat, lon, 15);
          setH3Index(h3idx || "");
        } catch (err) {
          console.error(err);
          setH3Index("Error computing H3");
        }
      } else {
        setH3Index("h3-js missing or not exposing geoToH3");
      }
    },
  });
  return null;
};

// ---------- Main component ----------
export default function MapWithDigipinPlusCode() {
  const [digipin, setDigipin] = useState<string>("");
  const [plusCode, setPlusCode] = useState<string>("");
  const [ulpin, setULPIN] = useState<string>("");
  const [h3Index, setH3Index] = useState<string>("");
  const [cursorLat, setCursorLat] = useState<number | null>(null);
  const [cursorLon, setCursorLon] = useState<number | null>(null);

  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState<string | null>(null);
  const [geoToH3, setGeoToH3] = useState<((lat: number, lon: number, res: number) => string) | null>(null);

  useEffect(() => {
    setIsClient(true);
    setMapKey(`leaflet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

    (async () => {
      try {
        const mod = await import("h3-js");
        // Log module keys so you can inspect them in the browser console
        // eslint-disable-next-line no-console
        //console.info("h3-js module keys:", Object.keys(mod));

        // Type hack: treat as any for probing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyMod: any = mod;

        // Candidate function names to try
        const candidates = [
          anyMod.geoToH3,
          anyMod.geo_to_h3,
          anyMod.geoToH3?.bind(anyMod),
          anyMod.default?.geoToH3,
          anyMod.default?.geo_to_h3,
          anyMod.default,
          anyMod.latLngToCell,
          anyMod.latlngToCell,
          anyMod.latLngToH3,
          anyMod.latLngToH3?.bind(anyMod),
        ];

        // Find a usable function
        let fn: any = null;
        for (const c of candidates) {
          if (typeof c === "function") {
            fn = c;
            break;
          }
        }

        // Special case: some builds export a namespace with the function under different names
        if (!fn) {
          // scan object keys for anything containing 'geo' and 'h3'
          const keys = Object.keys(anyMod || {});
          for (const k of keys) {
            const val = (anyMod as any)[k];
            if (typeof val === "function" && /geo.*h3|h3.*geo|lat.*lng/i.test(k)) {
              fn = val;
              // eslint-disable-next-line no-console
             // console.info("Selected h3 function by key:", k);
              break;
            }
          }
        }

        if (typeof fn === "function") {
          // Wrap into consistent signature (lat, lon, res)
          setGeoToH3(() => (lat: number, lon: number, res: number) => fn(lat, lon, res));
          // eslint-disable-next-line no-console
          //console.info("h3-js: geoToH3 function bound successfully");
        } else {
          // eslint-disable-next-line no-console
          //console.warn("h3-js loaded but no suitable geoToH3-like function was found. Module keys:", Object.keys(mod));
          setGeoToH3(null);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        //console.warn("h3-js could not be loaded at runtime:", e);
        setGeoToH3(null);
      }
    })();

    return () => setMapKey(null);
  }, []);

  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 500;

  return (
    <div className="p-4">
      <div className="border shadow rounded mx-auto" style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }}>
        {isClient && mapKey ? (
          <MapContainer key={mapKey} center={[12.9716, 77.5946]} zoom={6} style={{ width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px` }} scrollWheelZoom={true}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Carto Light">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Carto Dark">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CartoDB" />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="ESRI Satellite">
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
              </LayersControl.BaseLayer>
            </LayersControl>

            <MapEvents setCursorLat={setCursorLat} setCursorLon={setCursorLon} setDigipin={setDigipin} setPlusCode={setPlusCode} setULPIN={setULPIN} setH3Index={setH3Index} geoToH3={geoToH3} />
          </MapContainer>
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>

      <div className="text-lg mt-2 text-center">
        {cursorLat !== null && cursorLon !== null ? (
          <>
            <p>
              <strong>Lat:</strong> {cursorLat.toFixed(6)} | <strong>Lon:</strong> {cursorLon.toFixed(6)}
            </p>
            <p className="mt-2 font-semibold">ULPIN: {ulpin} &nbsp;&nbsp; &nbsp;
              DIGIPIN: {digipin}
              &nbsp;&nbsp;&nbsp;
              Plus Code: {plusCode}
              &nbsp;&nbsp;&nbsp;
              Uber H3: {h3Index}
              </p>
            
    
          </>
        ) : (
          <p>Move your mouse over the map...</p>
        )}
      </div>
    </div>
  );
}
