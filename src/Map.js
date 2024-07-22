// src/Map.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';

// Fix default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = () => {
  const [businesses, setBusinesses] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(4); // Default zoom level

  useEffect(() => {
    axios.get('/businesses.json')
      .then(response => {
        setBusinesses(response.data);
        console.log(response.data); // Check if data is fetched correctly
      })
      .catch(error => {
        console.error("There was an error fetching the businesses!", error);
      });
  }, []);

  // Functional component to listen for zoom events
  const ZoomListener = () => {
    useMapEvents({
      zoomend: (e) => {
        const zoom = e.target.getZoom();
        setZoomLevel(zoom);
        console.log(`Current zoom level: ${zoom}`); // Log the current zoom level
      },
    });
    return null;
  };

  return (
    <MapContainer 
      center={[37.7749, -122.4194]} 
      zoom={zoomLevel} 
      style={{ height: "100vh", width: "100%" }}
    >
      <ZoomListener /> {/* Listen for zoom events */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {businesses.map((business, index) => (
        zoomLevel >= 6 ? ( // Set a zoom threshold for marker visibility
          <Marker 
            key={index} 
            position={[business.latitude, business.longitude]}
            icon={L.icon({
              iconUrl: require('leaflet/dist/images/marker-icon.png'),
              iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
              shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
              iconSize: [25, 41], // size of the icon
              iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
              popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
              shadowSize: [41, 41] // size of the shadow
            })}
          >
            <Popup>
              <b>{business.name}</b><br />{business.address}
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}

export default Map;
