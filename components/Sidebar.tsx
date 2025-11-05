import React from 'react';
import { useData } from '../data/dataService';

interface SidebarProps {
  currentRoute: string;
  currentStationId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, currentStationId }) => {
  const { gasStations: stations } = useData();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetHash = e.currentTarget.hash;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const NavLink: React.FC<{ href: string; isActive: boolean; children: React.ReactNode; isSub?: boolean }> = ({ href, isActive, children, isSub = false }) => {
    const activeClass = 'bg-purple-500/20 text-white border-r-4 border-pink-500 shadow-lg';
    const inactiveClass = 'text-slate-300 hover:bg-slate-700/50 hover:text-white';
    const padding = isSub ? 'pl-10 pr-4' : 'pl-6 pr-4';

    return (
      <a href={href} onClick={handleNavClick} className={`flex items-center py-3 ${padding} transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}>
        {children}
      </a>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900/50 backdrop-blur-sm border-r border-purple-500/20 flex flex-col">
      <div className="h-20 flex items-center justify-center border-b border-purple-500/20 px-6">
        <a 
          href="#/" 
          onClick={handleNavClick}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-80 transition-opacity"
        >
          RetailVoice.AI
        </a>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="py-4">
          <NavLink href="#/" isActive={currentRoute === 'home'}>
            <span className="mr-3">📊</span> Dashboard
          </NavLink>
          <NavLink href="#/map" isActive={currentRoute === 'map'}>
            <span className="mr-3">🗺️</span> Map
          </NavLink>
        </div>
        <div>
          <h3 className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stations</h3>
          <div className="mt-2 space-y-1">
            {stations.map(station => (
              <NavLink 
                key={station.id} 
                href={`#/station/${station.id}`} 
                isActive={currentRoute === 'station' && currentStationId === station.id}
                isSub={true}
              >
                <span className="truncate">{station.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
