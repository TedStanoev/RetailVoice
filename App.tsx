import React, { useState, useEffect } from 'react';
import MapHomePage from './pages/MapHomePage';
import GasStationDetailsPage from './pages/GasStationDetailsPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar';
import { gasStations } from './data/mockData';

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const parts = hash.replace('#/', '').split('/');
  const route = parts[0] || 'home';
  const param = parts[1];
  
  let page;
  if (route === 'station' && param) {
    page = <GasStationDetailsPage stationId={param} />;
  } else if (route === 'map') {
    page = <MapHomePage />;
  } else {
    page = <DashboardPage />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar stations={gasStations} currentRoute={route} currentStationId={param} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {route === 'map' && (
          <header className="text-center p-6 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm flex-shrink-0">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
               RetailVoice.AI
             </h2>
             <p className="mt-2 text-md text-slate-400 max-w-2xl mx-auto">
               An AI-powered tool to analyze client feedback, using Google Maps reviews and ratings
             </p>
           </header>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900/30 p-4 sm:p-6 lg:p-8">
          {page}
        </main>
        
        <footer className="text-center p-4 text-slate-500 text-sm bg-transparent border-t border-slate-800">
            <p>Powered by Gemini API and React</p>
        </footer>
      </div>
    </div>
  );
};

export default App;