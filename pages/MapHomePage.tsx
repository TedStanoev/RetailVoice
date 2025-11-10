import React, { useEffect, useRef } from 'react';
import { useData } from '../data/dataService';

declare const L: any; // Use Leaflet from the global scope

const MapHomePage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const { gasStations, reviews } = useData();

  // Define custom SVG icons for different colors
  const createIcon = (color: string) => {
    // This SVG creates a map pin shape with a hole in the middle.
    const html = `
      <div style="width: 36px; height: 48px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" style="width: 100%; height: 100%; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
          <!-- The main map marker shape with a hole -->
          <path d="M12 0C7.03 0 3 4.03 3 9c0 6.17 7.73 15.35 8.33 16.03a1 1 0 001.34 0C13.27 24.35 21 15.17 21 9c0-4.97-4.03-9-9-9z M12 9 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0-8 0z" fill="${color}" fill-rule="evenodd"/>
        </svg>
      </div>`;
    
    return L.divIcon({
      html: html,
      className: 'bg-transparent border-0',
      iconSize: [36, 48],
      iconAnchor: [18, 48], // bottom center
      popupAnchor: [0, -48] // top center of the anchor point
    });
  };

  const greenIcon = createIcon('#4ade80'); // green-400
  const yellowIcon = createIcon('#facc15'); // yellow-400
  const redIcon = createIcon('#f87171'); // red-400
  const greyIcon = createIcon('#94a3b8'); // slate-400

  const getStationRatingColor = (stationId: string) => {
    const stationReviews = reviews.filter(r => r.stationId === stationId);
    if (stationReviews.length === 0) {
      return greyIcon;
    }
    const avgRating = stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length;
    
    if (avgRating >= 4) return greenIcon;
    if (avgRating >= 3) return yellowIcon;
    if (avgRating < 3) return redIcon;
  };

  const getStationAverageRatingText = (stationId: string) => {
    const stationReviews = reviews.filter(r => r.stationId === stationId);
    if (stationReviews.length === 0) {
      return "No reviews yet";
    }
    const avgRating = stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length;
    return `Avg. Rating: ${avgRating.toFixed(1)} / 5`;
  };

  // Effect to initialize the map instance. Runs only once.
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([42.6977, 23.3219], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    }
    
    // Cleanup function to remove the map on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once

  // Effect to update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return; // Don't run if map isn't initialized

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each station
    gasStations.forEach(station => {
      const marker = L.marker([station.location.latitude, station.location.longitude], {
          icon: getStationRatingColor(station.id)
      }).addTo(mapRef.current!);
      
      const avgRatingText = getStationAverageRatingText(station.id);
      marker.bindTooltip(
        `<div class="font-bold">${station.name}</div><div>${avgRatingText}</div>`, 
        {
          className: 'bg-slate-100 text-slate-800 border-purple-500 border rounded-md p-2 shadow-lg',
          offset: L.point(0, -30),
          permanent: false,
          direction: 'top'
        }
      );

      marker.on('click', () => {
        window.location.hash = `#/station/${station.id}`;
      });

      markersRef.current.push(marker); // Store marker instance
    });
  }, [gasStations, reviews]); // Rerun this effect if stations or reviews data changes

  return (
    <div className="h-full w-full">
      <div 
        ref={mapContainerRef} 
        className="h-full w-full rounded-lg shadow-lg border border-purple-500/30 bg-gray-200"
        aria-label="Map of gas stations in Sofia"
      ></div>
    </div>
  );
};

export default MapHomePage;