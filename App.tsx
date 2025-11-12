import React, { useState, useEffect } from 'react';
import MapHomePage from './pages/MapHomePage';
import GasStationDetailsPage from './pages/GasStationDetailsPage';
import DashboardPage from './pages/DashboardPage';
import SubmitReviewPage from './pages/SubmitReviewPage';
import Sidebar from './components/Sidebar';
import { initializeData, DataContext } from './data/dataService';
import ErrorDisplay from './components/ErrorDisplay';
import { pollReviews } from './services/googleSheetService';
import { GasStation, Review } from './types';

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { gasStations: initialStations, reviews: initialReviews } = await initializeData();
        setGasStations(initialStations);
        setReviews(initialReviews);
      } catch (error) {
        if (error instanceof Error) {
          setDataError(`Failed to load application data: ${error.message}`);
        } else {
          setDataError('An unknown error occurred while loading data.');
        }
      } finally {
        setIsDataLoading(false);
      }
    };
    loadData();
  }, []);
  
  useEffect(() => {
    const pollId = setInterval(async () => {
      try {
        const newReviews = await pollReviews();
        if (newReviews) {
          console.log("Data updated via polling. Updating state.");
          setReviews(newReviews);
        }
      } catch (e) {
        console.error("Polling failed:", e);
      }
    }, 5000);

    return () => clearInterval(pollId);
  }, []);


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
  const isSubmitReviewPage = route === 'submit-review';
  
  let page;
  if (route === 'station' && param) {
    page = <GasStationDetailsPage stationId={param} />;
  } else if (route === 'map') {
    page = <MapHomePage />;
  } else if (route === 'submit-review') {
    page = <SubmitReviewPage />;
  } else {
    page = <DashboardPage />;
  }

  if (isDataLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <p className="text-purple-300 text-lg font-semibold">Loading Live Data...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 p-8">
        <ErrorDisplay error={dataError} />
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ gasStations, reviews }}>
      <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
        {!isSubmitReviewPage && <Sidebar currentRoute={route} currentStationId={param} />}

        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          
          {route === 'map' && (
            <header className="text-center p-6 border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm flex-shrink-0">
               <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                 SentimentPulse
               </h2>
               <p className="mt-2 text-md text-slate-400 max-w-2xl mx-auto">
                 An AI-powered tool to analyze client feedback, using Google Maps reviews and ratings
               </p>
             </header>
          )}

          <main className={`flex-1 overflow-x-hidden overflow-y-auto ${!isSubmitReviewPage ? 'bg-slate-900/30 p-4 sm:p-6 lg:p-8' : ''}`}>
            {page}
          </main>
          
          {!isSubmitReviewPage && (
            <footer className="text-center p-4 text-slate-500 text-sm bg-transparent border-t border-slate-800">
                <p>Powered by Gemini API and React</p>
            </footer>
          )}
        </div>
      </div>
    </DataContext.Provider>
  );
};

export default App;