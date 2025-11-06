import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../data/dataService';
import { summarizeStationHighlights } from '../services/geminiService';
import { GasStation } from '../types';
import ErrorDisplay from '../components/ErrorDisplay';
import StarRating from '../components/StarRating';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg">
    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-pink-400">{value}</p>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </div>
);

interface HighlightCardProps {
  station: GasStation;
  avgRating: number;
  title: string;
  icon: string;
  summaryPoints: string[] | null;
  isLoading: boolean;
  colorClass: string;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ station, avgRating, title, icon, summaryPoints, isLoading, colorClass }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetHash = e.currentTarget.hash;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg flex flex-col">
      <h3 className={`text-lg font-semibold ${colorClass} flex items-center`}>
        <span className="mr-2">{icon}</span> {title}
      </h3>
      <div className="mt-4">
        <a href={`#/station/${station.id}`} onClick={handleNavClick} className="text-xl font-bold text-slate-100 hover:text-purple-400 transition-colors">
          {station.name}
        </a>
        <div className="flex items-center gap-2 mt-1">
          <StarRating rating={avgRating} />
          <span className="text-sm text-slate-400">({avgRating.toFixed(2)} avg)</span>
        </div>
      </div>
      <div className="mt-4 flex-grow min-h-[6rem]">
        {isLoading ? (
           <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400"></div>
           </div>
        ) : (
          summaryPoints && (
            <ul className="space-y-2 list-disc list-inside text-slate-300">
              {summaryPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
    const { gasStations, reviews } = useData();

  const stats = useMemo(() => {
    const totalStations = gasStations.length;
    const totalReviews = reviews.length;
    const overallAvgRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2)
      : 'N/A';

    const reviewDistribution = [
      { name: '1 Star', count: 0 },
      { name: '2 Stars', count: 0 },
      { name: '3 Stars', count: 0 },
      { name: '4 Stars', count: 0 },
      { name: '5 Stars', count: 0 },
    ];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        reviewDistribution[r.rating - 1].count++;
      }
    });

    return {
      totalStations,
      totalReviews,
      overallAvgRating,
      reviewDistribution,
    };
  }, [gasStations, reviews]);

  const [highlightedStations, setHighlightedStations] = useState<{
    highest: { station: GasStation; avgRating: number; summary: string[] | null } | null;
    lowest: { station: GasStation; avgRating: number; summary: string[] | null } | null;
  }>({ highest: null, lowest: null });

  const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const stationRatings = useMemo(() => {
    return gasStations.map(station => {
      const stationReviews = reviews.filter(r => r.stationId === station.id);
      if (stationReviews.length === 0) {
        return { station, avgRating: -1 }; // Use -1 to indicate no reviews
      }
      const avgRating = stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length;
      return { station, avgRating };
    }).filter(item => item.avgRating !== -1); // Filter out stations with no reviews
  }, [gasStations, reviews]);

  useEffect(() => {
    if (stationRatings.length === 0) {
      setIsLoadingSummaries(false);
      return;
    }

    const sortedStations = [...stationRatings].sort((a, b) => b.avgRating - a.avgRating);
    const highestRated = sortedStations[0];
    const lowestRated = sortedStations[sortedStations.length - 1];

    const fetchSummaries = async () => {
      try {
        setIsLoadingSummaries(true);
        setSummaryError(null);

        const highestReviews = reviews.filter(r => r.stationId === highestRated.station.id).map(r => r.reviewText);
        const lowestReviews = reviews.filter(r => r.stationId === lowestRated.station.id).map(r => r.reviewText);

        const [highestSummary, lowestSummary] = await Promise.all([
          summarizeStationHighlights(highestReviews, 'positive'),
          summarizeStationHighlights(lowestReviews, 'negative')
        ]);

        console.log(highestSummary, lowestSummary);

        setHighlightedStations({
          highest: { ...highestRated, summary: highestSummary },
          lowest: { ...lowestRated, summary: lowestSummary }
        });

      } catch (e) {
        if (e instanceof Error) {
          setSummaryError(e.message);
        } else {
          setSummaryError('Failed to load station summaries.');
        }
      } finally {
        setIsLoadingSummaries(false);
      }
    };

    fetchSummaries();
  }, [stationRatings, reviews]);

  const tooltipStyle = {
    backgroundColor: '#E5E7EB', // slate-200
    borderColor: '#a855f7',
    color: '#1e293b', // slate-800
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-100 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Stations" value={stats.totalStations} description="Number of stations being tracked" />
        <StatCard title="Total Reviews" value={stats.totalReviews} description="Across all stations" />
        <StatCard title="Overall Average Rating" value={stats.overallAvgRating} description="Average score from all reviews" />
      </div>

      {/* Review Distribution Chart */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-slate-200">Review Score Distribution</h3>
        <div className="h-80 w-full bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 shadow-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.reviewDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(71 85 105 / 0.5)" />
              <XAxis dataKey="name" stroke="rgb(148 163 184)" fontSize={12} />
              <YAxis stroke="rgb(148 163 184)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(168, 85, 247, 0.1)'}} />
              <Legend />
              <Bar dataKey="count" name="Number of Reviews" fill="#d8b4fe" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station Highlights */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4 text-slate-200">Station Highlights</h3>
        {summaryError && <ErrorDisplay error={summaryError} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlightedStations.highest ? (
            <HighlightCard 
              title="Highest Rated"
              icon="🏆"
              station={highlightedStations.highest.station}
              avgRating={highlightedStations.highest.avgRating}
              summaryPoints={highlightedStations.highest.summary}
              isLoading={isLoadingSummaries}
              colorClass="text-emerald-400"
            />
          ) : (
            <div className="bg-slate-800/50 p-6 rounded-xl flex items-center justify-center text-slate-500 min-h-[14rem]">
              {isLoadingSummaries ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div> : 'Not enough data.'}
            </div>
          )}

          {highlightedStations.lowest ? (
            <HighlightCard 
              title="Lowest Rated"
              icon="⚠️"
              station={highlightedStations.lowest.station}
              avgRating={highlightedStations.lowest.avgRating}
              summaryPoints={highlightedStations.lowest.summary}
              isLoading={isLoadingSummaries}
              colorClass="text-red-400"
            />
          ) : (
            <div className="bg-slate-800/50 p-6 rounded-xl flex items-center justify-center text-slate-500 min-h-[14rem]">
              {isLoadingSummaries ? <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div> : 'Not enough data.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;