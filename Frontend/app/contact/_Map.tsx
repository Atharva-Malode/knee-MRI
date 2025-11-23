"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function FlyTo({ clinic }) {
  const map = useMap();
  useEffect(() => {
    if (clinic) {
      map.flyTo([clinic.lat, clinic.lng], 15, { duration: 1.2 });
    }
  }, [clinic]);
  return null;
}

export default function Map({ clinics, selectedClinic }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <MapContainer
      center={[21.1458, 79.0882]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <FlyTo clinic={selectedClinic} />

      {clinics.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]}>
          <Popup>{c.doctor}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
