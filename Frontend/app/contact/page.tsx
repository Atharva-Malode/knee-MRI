"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet"; // types only
import "leaflet/dist/leaflet.css";

import { Phone, MapPin, Stethoscope } from "lucide-react";

// ------------------ TYPES ------------------
interface Clinic {
  id: number;
  name: string;
  doctor: string;
  phone: string;
  specialization: string;
  lat: number;
  lng: number;
  address: string;
}

// ------------------ PAGE COMPONENT ------------------
export default function ContactPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  // Load clinics.json
  useEffect(() => {
    import("./clinics.json").then((m) => {
      const data = m.default;
      setClinics(data);
      setSelectedClinic(data[0]);
    });
  }, []);

  // Initialize map ONCE
  useEffect(() => {
    const loadLeaflet = async () => {
      const Llib = await import("leaflet");

      // Fix marker icon URLs
      Llib.Icon.Default.mergeOptions({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstance.current) return;

      mapInstance.current = Llib.map(mapRef.current).setView(
        [21.1458, 79.0882],
        12
      );

      Llib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance.current);
    };

    loadLeaflet();
  }, []);

  // Handle markers + popup + hover + flyTo
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstance.current || clinics.length === 0) return;

      const Llib = await import("leaflet");

      // Remove old markers
      Object.values(markersRef.current).forEach((m) =>
        mapInstance.current?.removeLayer(m)
      );
      markersRef.current = {};

      // Add markers
      clinics.forEach((clinic) => {
        const marker = Llib.marker([clinic.lat, clinic.lng]).addTo(
          mapInstance.current!
        );

        markersRef.current[clinic.id] = marker;

        const popupHTML = `
          <b>${clinic.doctor}</b><br/>
          ${clinic.specialization}<br/>
          ${clinic.name}<br/>
          <small>${clinic.address}</small><br/>
          <a href="tel:${clinic.phone}">${clinic.phone}</a>
        `;

        // Popup for click
        marker.bindPopup(popupHTML);

        // Popup on hover
        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());
      });

      // If a clinic is selected → open popup + flyTo
      if (selectedClinic) {
        const marker = markersRef.current[selectedClinic.id];
        if (marker) {
          marker.openPopup();
          mapInstance.current!.flyTo(
            [selectedClinic.lat, selectedClinic.lng],
            15,
            { duration: 1.2 }
          );
        }
      }
    };

    updateMarkers();
  }, [clinics, selectedClinic]);

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Find Our Knee Specialists
          </h1>
          <p className="text-gray-400 text-lg">
            Expert care for ACL tears, meniscus injuries, and knee MRI diagnostics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT PANEL */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Stethoscope className="text-blue-400" />
                Our Specialists
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    onClick={() => setSelectedClinic(clinic)}
                    className={`p-6 rounded-xl cursor-pointer transition ${
                      selectedClinic?.id === clinic.id
                        ? "bg-blue-600/20 border-2 border-blue-500 shadow-blue-500/20"
                        : "bg-gray-700/30 border border-gray-600 hover:bg-gray-700/50"
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-blue-300">
                      {clinic.doctor}
                    </h3>
                    <p className="text-gray-400">{clinic.specialization}</p>

                    <div className="space-y-2 mt-2 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        {clinic.name}
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-400" />
                        <a href={`tel:${clinic.phone}`}>{clinic.phone}</a>
                      </div>

                      <p className="text-gray-400 text-xs">{clinic.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL MAP */}
          <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 px-4">
              <MapPin className="text-cyan-400" /> Clinic Locations
            </h2>

            <div
              ref={mapRef}
              className="h-[700px] w-full rounded-xl overflow-hidden"
            />
          </div>

        </div>
      </div>

      {/* Scrollbar styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
