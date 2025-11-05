import { GasStation, Review } from '../types';

const SPREADSHEET_ID = '130Kmw8zDvEvs_0ikiNnGwme11iPY-bYaQWJCocgNoWg';
const GAS_STATIONS_SHEET_NAME = 'gasStations';
const REVIEWS_SHEET_NAME = 'reviews';

const JSON_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

const GAS_STATIONS_URL = `${JSON_URL}&sheet=${GAS_STATIONS_SHEET_NAME}`;
const REVIEWS_URL = `${JSON_URL}&sheet=${REVIEWS_SHEET_NAME}`;

export const REVIEWS_VERSION_CELL_RANGE = 'reviews!F2';

let reviewsVersion = 1;

function parseJsonTextToData(text: string) {
    try {
        const jsonString = text.substring(
            text.indexOf('{'),
            text.lastIndexOf('}') + 1
        );

        const gvizData = JSON.parse(jsonString);

        const table = gvizData.table;
        if (!table || !table.rows || !table.cols) {
            throw new Error("Invalid Gviz response structure.");
        }

        const headers = table.cols.map(col => col.label).filter(label => label);
        
        const result = table.rows
            .map(row => {
                let obj: { [key: string]: any } = {};
                let isEmpty = true;

                if (!row || !row.c) return null;
                
                row.c.forEach((cell, i) => {
                    if (headers[i]) {
                        const value = cell && cell.v !== undefined ? cell.v : null;
                        if (value !== null && String(value).trim() !== '') {
                            isEmpty = false;
                        }
                        obj[headers[i]] = value;
                    }
                });
                
                return isEmpty ? null : obj;
            })
            .filter((obj): obj is Record<string, any> => obj !== null);

        return result;

    } catch (error) {
        console.error("🛑 Failed to fetch or parse Google Sheet data:", error);
        return null;
    }
}


export const fetchGasStations = async (): Promise<GasStation[]> => {
  const response = await fetch(GAS_STATIONS_URL);
  if (!response.ok) throw new Error('Failed to fetch gas station data from Google Sheet.');
  const text = await response.text();
  const jsonData = parseJsonTextToData(text);

  if (!jsonData) {
    throw new Error('Failed to parse gas station data from Google Sheet.');
  }
  
  return jsonData.map(item => {
    const latString = String(item.latitude || '0');
    const lonString = String(item.longitude || '0');
    
    return {
        id: item.id,
        name: item.name,
        location: {
          latitude: parseFloat(latString.replace(",", ".")),
          longitude: parseFloat(lonString.replace(",", ".")),
        },
        address: item.address,
    };
  });
};

export const fetchReviews = async (): Promise<Review[]> => {
    const response = await fetch(REVIEWS_URL);
    if (!response.ok) throw new Error('Failed to fetch review data from Google Sheet.');
    const text = await response.text();
    const jsonData = parseJsonTextToData(text);

    if (!jsonData) {
        throw new Error('Failed to parse review data from Google Sheet.');
    }

    return jsonData.map(item => ({
        id: item.id,
        stationId: item.stationId,
        rating: parseInt(item.rating, 10) || 0,
        reviewText: item.reviewText,
        timestamp: parseInt(item.timestamp, 10) || Date.now(),
    }));
};

export const fetchCellValue = async (sheetUrl: string, range: string) => {
    const url = `${sheetUrl}&tq=select%20*&range=${range}`;

    try {
        const response = await fetch(url);
        let text = await response.text();
        
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const gvizData = JSON.parse(jsonString);
        
        return gvizData.table.rows[0].c[0].v; 
    } catch (error) {
        console.error("Error fetching cell value:", error);
        return null;
    }
}

async function startOptimizedPolling(sheetUrl: string, versionCell: string, promiseFallback: () => Promise<any>) {
    const remoteVersion = await fetchCellValue(sheetUrl, versionCell);

    if (remoteVersion !== null && remoteVersion !== reviewsVersion) {
        console.log(`New version detected: ${remoteVersion}. Starting full data fetch.`);
        
        const fullData = await promiseFallback();
        
        if (fullData) {
            console.log("Update version");
            reviewsVersion = remoteVersion; 
        }

        return fullData;
    } else {
        console.log(`Version ${reviewsVersion} is current. No update needed.`);
    }
}

export async function pollReviews() {
  return await startOptimizedPolling(REVIEWS_URL, REVIEWS_VERSION_CELL_RANGE, fetchReviews);
}