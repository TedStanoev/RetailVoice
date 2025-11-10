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

export type CategorySentiment = 'Positive' | 'Negative' | 'Mixed' | 'Neutral';

export interface CategorySentimentData {
  sentiment: CategorySentiment;
  count: number;
}

export interface ReviewAnalysis {
  summaryGood: string;
  summaryBad: string;
  categoryRatings?: {
    hygiene: CategorySentimentData;
    foodAndDrinks: CategorySentimentData;
    gasQuality: CategorySentimentData;
    cashierService: CategorySentimentData;
    gasRefillService: CategorySentimentData;
  };
}

export interface RatingsHistoryDataPoint {
    date: string;
    rating: number;
}