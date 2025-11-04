import { GasStation, Review } from '../types';

export const gasStations: GasStation[] = [
  { id: 'gs_01', name: 'OMV Tsarigradsko Shose', location: { latitude: 42.662, longitude: 23.376 }, address: 'bulevard "Tsarigradsko shose" 113, 1784 7-mi 11-i kilometar, Sofia' },
  { id: 'gs_02', name: 'OMV Boycho Boychev', location: { latitude: 42.684, longitude: 23.243 }, address: 'Boycho Boychev, 66 Str, 1632 Sofia' },
  { id: 'gs_03', name: 'OMV Suhodol', location: { latitude: 42.707, longitude: 23.210 }, address: 'Lyulin MW, 17.5 km Suhodol, 1362' },
  { id: 'gs_04', name: 'OMV Bakston', location: { latitude: 42.659, longitude: 23.271 }, address: 'Bratya Bakston Blvd. 98, 1618 Sofia' },
];

const now = Date.now();
const day = 1000 * 60 * 60 * 24;

export const reviews: Review[] = [
  // OMV Reviews
  { id: 'r_01_01', stationId: 'gs_01', rating: 5, reviewText: 'Clean facilities and friendly staff. The coffee is great too!', timestamp: now - 1 * day },
  { id: 'r_01_02', stationId: 'gs_01', rating: 4, reviewText: 'Good fuel quality, but it can get very busy during peak hours.', timestamp: now - 5 * day },
  { id: 'r_01_03', stationId: 'gs_01', rating: 3, reviewText: 'Average service. The car wash was out of order when I visited.', timestamp: now - 12 * day },
  { id: 'r_01_04', stationId: 'gs_01', rating: 5, reviewText: 'Always reliable. I appreciate the 24/7 service.', timestamp: now - 20 * day },
  { id: 'r_01_05', stationId: 'gs_01', rating: 2, reviewText: 'The prices are a bit higher than other places nearby.', timestamp: now - 35 * day },
  { id: 'r_01_06', stationId: 'gs_01', rating: 4, reviewText: 'Quick and efficient service. The shop is well-stocked.', timestamp: now - 50 * day },

  // Shell Reviews
  { id: 'r_02_01', stationId: 'gs_02', rating: 5, reviewText: 'Excellent customer service! The V-Power fuel is top-notch.', timestamp: now - 2 * day },
  { id: 'r_02_02', stationId: 'gs_02', rating: 4, reviewText: 'The loyalty program offers great rewards. Can be crowded sometimes.', timestamp: now - 8 * day },
  { id: 'r_02_03', stationId: 'gs_02', rating: 4, reviewText: 'Clean restrooms and a good selection of snacks.', timestamp: now - 15 * day },
  { id: 'r_02_04', stationId: 'gs_02', rating: 3, reviewText: 'The pump was a bit slow, and I had to wait in line.', timestamp: now - 30 * day },
  { id: 'r_02_05', stationId: 'gs_02', rating: 5, reviewText: 'My favorite gas station in the area. Always a pleasant experience.', timestamp: now - 45 * day },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `r_02_${i + 6}`, stationId: 'gs_02', rating: Math.round(3.5 + Math.random() * 1.5), reviewText: 'This is an older review placeholder.', timestamp: now - (60 + i * 15) * day })),

  // EKO Reviews
  { id: 'r_03_01', stationId: 'gs_03', rating: 4, reviewText: 'Decent service. Prices are a bit high.', timestamp: now - 3 * day },
  { id: 'r_03_02', stationId: 'gs_03', rating: 3, reviewText: 'It was okay, nothing special. The location is convenient.', timestamp: now - 10 * day },
  { id: 'r_03_03', stationId: 'gs_03', rating: 1, reviewText: 'Do not fill your car with gas here! It is the lowest quality, the prices are too high and the staff is very rude!', timestamp: now - 25 * day },
  { id: 'r_03_04', stationId: 'gs_03', rating: 2, reviewText: 'The windshield cleaning liquid was empty and the squeegee was broken.', timestamp: now - 40 * day },
  { id: 'r_03_05', stationId: 'gs_03', rating: 2, reviewText: 'The cashier seemed uninterested and was a bit rude.', timestamp: now - 60 * day },
  { id: 'r_03_06', stationId: 'gs_03', rating: 4, reviewText: 'Competative prices, but the food is tasty.', timestamp: now - 80 * day },

  // Lukoil Reviews
  { id: 'r_04_01', stationId: 'gs_04', rating: 3, reviewText: 'Standard gas station. Does the job but nothing to write home about.', timestamp: now - 4 * day },
  { id: 'r_04_02', stationId: 'gs_04', rating: 4, reviewText: 'The fuel quality seems good, and my car runs smoothly.', timestamp: now - 18 * day },
  { id: 'r_04_03', stationId: 'gs_04', rating: 2, reviewText: 'The area around the pumps was a bit dirty.', timestamp: now - 33 * day },
  { id: 'r_04_04', stationId: 'gs_04', rating: 5, reviewText: 'Very convenient location right on the main road. Staff was fast.', timestamp: now - 55 * day },
];

// Helper functions to access mock data
export const getStationById = (id: string) => gasStations.find(s => s.id === id);
export const getReviewsByStationId = (stationId: string) => reviews.filter(r => r.stationId === stationId);
