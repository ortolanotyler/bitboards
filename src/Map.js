import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet-defaulticon-compatibility';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import axios from 'axios';

// Fix default icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = () => {
  const [businesses, setBusinesses] = useState([]);
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/venues');
        const data = response.data.venues.map(venue => ({
          name: venue.name || 'Unknown Name',
          address: venue.address || 'No address provided',
          latitude: parseFloat(venue.lat),
          longitude: parseFloat(venue.lon),
        }));
        console.log("Fetched data:", data);
        setBusinesses(data);
      } catch (error) {
        console.error("There was an error fetching the businesses!", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (businesses.length > 0 && !mapRef.current) {
      // Initialize the map
      const map = L.map('map').setView([37.7749, -122.4194], 4);
      mapRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Initialize marker cluster group
      markerClusterRef.current = L.markerClusterGroup();

      // Define the icon to be used for the markers
      const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add unique markers to the cluster group
      const addedMarkers = new Set(); // Use Set to track unique latitude and longitude combinations
      businesses.forEach(business => {
        const key = `${business.latitude},${business.longitude}`;
        if (!addedMarkers.has(key) && !isNaN(business.latitude) && !isNaN(business.longitude)) { // Ensure valid and unique coordinates
          addedMarkers.add(key);
          const marker = L.marker([business.latitude, business.longitude], { icon: defaultIcon })
            .bindPopup(`<b>${business.name}</b><br>${business.address}`)
            .on('click', function (e) {
              console.log(`Marker clicked: ${business.name}`);
            });
          markerClusterRef.current.addLayer(marker);
        } else {
          console.log("Duplicate or invalid location skipped:", business);
        }
      });

      // Add cluster group to the map
      map.addLayer(markerClusterRef.current);

      // Log zoom level changes
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        console.log(`Current zoom level: ${zoom}`);
      });

      // Cleanup map instance on unmount
      return () => {
        map.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
      };
    }
  }, [businesses]);

  return (
    <div id="map" style={{ height: "100vh", width: "100%" }}></div>
  );
};

export default MapComponent;


