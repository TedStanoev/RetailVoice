import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../data/dataService';
import { analyzeReviews } from '../services/geminiService';
import { GasStation, ReviewAnalysis, RatingsHistoryDataPoint, Review } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

interface GasStationDetailsPageProps {
  stationId: string;
}

const StarRating: React.FC<{ rating: number, className?: string }> = ({ rating, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(5)].map((_, index) => {
        const starClass = index < Math.round(rating) ? 'text-amber-400' : 'text-slate-600';
        return (
          <svg key={index} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${starClass}`}>
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
          </svg>
        );
      })}
    </div>
  );
};

const GasStationDetailsPage: React.FC<GasStationDetailsPageProps> = ({ stationId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviewAnalysis, setReviewAnalysis] = useState<ReviewAnalysis | null>(null);
  const [ratingsHistory, setRatingsHistory] = useState<RatingsHistoryDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('date-desc');

  const { gasStations, reviews } = useData();

  const stationDetails = useMemo(() => 
    gasStations.find(s => s.id === stationId),
    [gasStations, stationId]
  );
  
  const allStationReviews = useMemo(() => 
    reviews.filter(r => r.stationId === stationId),
    [reviews, stationId]
  );

  const sentimentCounts = useMemo(() => {
    return allStationReviews.reduce(
      (acc, review) => {
        if (review.rating > 3) {
          acc.positive++;
        } else if (review.rating < 3) {
          acc.negative++;
        } else {
          acc.neutral++;
        }
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  }, [allStationReviews]);

  useEffect(() => {
    const processData = async () => {
      if (!stationDetails) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const sortedForChart = [...allStationReviews].sort((a, b) => a.timestamp - b.timestamp);
        let ratingSum = 0;
        const history = sortedForChart.map((review, index) => {
            ratingSum += review.rating;
            const currentAverage = ratingSum / (index + 1);
            return {
                date: new Date(review.timestamp).toLocaleDateString(),
                rating: parseFloat(currentAverage.toFixed(2))
            };
        });
        setRatingsHistory(history);

        const latestReviewTexts = [...allStationReviews]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 15)
          .map(r => r.reviewText);

        if (latestReviewTexts.length > 0) {
          const analysis = await analyzeReviews(latestReviewTexts);
          setReviewAnalysis(analysis);
        } else {
          setReviewAnalysis(null);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    processData();
  }, [stationDetails, allStationReviews]);

  const sortedReviews = useMemo(() => {
    const sorted = [...allStationReviews];
    switch (sortOrder) {
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-asc':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'date-asc':
        return sorted.sort((a, b) => a.timestamp - b.timestamp);
      case 'date-desc':
      default:
        return sorted.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [allStationReviews, sortOrder]);
  
  const pieData = useMemo(() => [
    { name: 'Positive', value: sentimentCounts.positive },
    { name: 'Neutral', value: sentimentCounts.neutral },
    { name: 'Negative', value: sentimentCounts.negative },
  ].filter(item => item.value > 0), [sentimentCounts]);
  
  const SENTIMENT_COLORS: { [key: string]: string } = {
    'Positive': '#34d399', // emerald-400
    'Neutral': '#fbbf24',  // amber-400
    'Negative': '#f87171', // red-400
  };
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!stationDetails) return <ErrorDisplay error="Gas station not found." />;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  const tooltipStyle = {
    backgroundColor: '#E5E7EB', // slate-200
    borderColor: '#a855f7',
    color: '#1e293b', // slate-800
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-1">{stationDetails.name}</h2>
      <p className="text-md text-slate-400 mb-8">{stationDetails.address}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Review Summary Column */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Review Summary</h3>
          {allStationReviews.length > 0 ? (
            <div className="space-y-4 bg-slate-900/60 p-6 rounded-lg">
              <div>
                <h4 className="font-bold text-lg text-slate-300">Sentiment Breakdown</h4>
                <div className="flex space-x-4 mt-2 text-center">
                    <div className="flex-1"><span className="text-2xl font-bold text-emerald-400">{sentimentCounts.positive}</span><p className="text-sm text-slate-400">Positive</p></div>
                    <div className="flex-1"><span className="text-2xl font-bold text-amber-400">{sentimentCounts.neutral}</span><p className="text-sm text-slate-400">Neutral</p></div>
                    <div className="flex-1"><span className="text-2xl font-bold text-red-400">{sentimentCounts.negative}</span><p className="text-sm text-slate-400">Negative</p></div>
                </div>
                 {pieData.length > 0 && (
                  <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                 )}
              </div>
              {reviewAnalysis && (
                <>
                  <div>
                    <h4 className="font-bold text-lg text-slate-300 mt-6">Common Praise</h4>
                    <p className="text-slate-400 italic mt-2">"{reviewAnalysis.summaryGood}"</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-300 mt-6">Common Issues</h4>
                    <p className="text-slate-400 italic mt-2">"{reviewAnalysis.summaryBad}"</p>
                  </div>
                </>
              )}
            </div>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-500 bg-slate-900/60 p-6 rounded-lg">
                No review data to analyze.
            </div>
          )}
        </div>
        {/* Ratings History Column */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Ratings History (Overall Trend)</h3>
          <div className="h-80 w-full bg-slate-900/60 p-4 rounded-lg">
             {ratingsHistory.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingsHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(71 85 105 / 0.5)" />
                  <XAxis dataKey="date" stroke="rgb(148 163 184)" fontSize={12} />
                  <YAxis domain={[1, 5]} stroke="rgb(148 163 184)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="rating" name="Average Rating" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    Not enough data for a historical chart.
                </div>
             )}
          </div>
        </div>
      </div>

      {/* All Reviews Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <h3 className="text-xl font-semibold text-slate-200">All Reviews ({allStationReviews.length})</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="sortOrder" className="text-sm text-slate-400">Sort by:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-2"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
            </select>
          </div>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {sortedReviews.map((review) => (
            <div key={review.id} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-start">
                <StarRating rating={review.rating} />
                <span className="text-xs text-slate-500">{new Date(review.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 mt-2 text-sm">{review.reviewText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GasStationDetailsPage;