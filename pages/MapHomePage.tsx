import React, { useEffect, useRef } from 'react';
import { useData } from '../data/dataService';

declare const L: any; // Use Leaflet from the global scope

const MapHomePage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const { gasStations, reviews } = useData();

  // Define custom SVG icons for different colors
  const createIcon = (color: string) => {
    const html = `
      <div style="position: relative; width: 40px; height: 40px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" class="w-10 h-10" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">
          <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 005.16-4.242 12.082 12.082 0 002.16-6.164c0-3.6-2.24-6.592-6.072-6.592s-6.072 2.992-6.072 6.592c0 2.338.832 4.542 2.16 6.164.814 1.282 1.838 2.544 3.012 3.734zM12 10.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clip-rule="evenodd" />
        </svg>
      </div>`;
    
    return L.divIcon({
      html: html,
      className: 'bg-transparent border-0', // Leaflet requires a class
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
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

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([42.6977, 23.3219], 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);

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
      });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gasStations, reviews]);

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
