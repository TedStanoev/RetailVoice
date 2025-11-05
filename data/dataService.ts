import React, { createContext, useContext } from 'react';
import { fetchGasStations, fetchReviews } from '../services/googleSheetService';
import { GasStation, Review } from '../types';

interface DataContextType {
  gasStations: GasStation[];
  reviews: Review[];
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const initializeData = async (): Promise<{ gasStations: GasStation[], reviews: Review[] }> => {
  try {
    const [gasStations, reviews] = await Promise.all([
      fetchGasStations(),
      fetchReviews(),
    ]);
    return { gasStations, reviews };
  } catch (error) {
    console.error('Error initializing data:', error);
    throw new Error('Failed to fetch initial data from Google Sheets.');
  }
};
