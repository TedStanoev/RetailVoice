export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface GasStation {
  id: string;
  name: string;
  location: LatLng;
  address: string;
}

export interface Review {
  id: string;
  stationId: string;
  rating: number;
  reviewText: string;
  timestamp: number; // Unix timestamp
}

export interface ReviewAnalysis {
  categories: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summaryGood: string;
  summaryBad: string;
}

export interface RatingsHistoryDataPoint {
    date: string;
    rating: number;
}
