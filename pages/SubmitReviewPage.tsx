import React, { useState } from 'react';
import InteractiveStarRating from '../components/InteractiveStarRating';
import { reviewFormStations } from '../data/reviewFormData';

const SubmitReviewPage: React.FC = () => {
  const [stationId, setStationId] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId || rating === 0) {
      setSubmitError('Please select a station and provide a rating.');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);

    // Mock submission
    console.log({
      stationId,
      rating,
      reviewText,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // After success, the form will no longer be shown.
    }, 1500);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = '#/';
  };

  const remainingChars = 1000 - reviewText.length;

  return (
    <div className="flex flex-col justify-center items-center h-full p-4 sm:p-6 lg:p-8">
       <div className="mb-8 text-center">
        <a 
          href="#/" 
          onClick={handleLogoClick}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-80 transition-opacity"
        >
          SentimentPulse
        </a>
      </div>
      <div className="w-full max-w-2xl bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-left text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">
          Submit a Review
        </h1>
        {submitSuccess ? (
          <div className="text-center p-6 bg-emerald-900/50 border border-emerald-500 rounded-lg">
            <h2 className="text-2xl font-semibold text-emerald-300">Thank you!</h2>
            <p className="text-slate-300 mt-2">Your review has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="station" className="block text-sm font-medium text-slate-300 mb-2">
                Select station
              </label>
              <select
                id="station"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-3"
                required
              >
                <option value="" disabled>Select a station...</option>
                {reviewFormStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rating
              </label>
              <div className="flex justify-center p-2 rounded-lg bg-slate-700">
                <InteractiveStarRating rating={rating} onRatingChange={setRating} />
              </div>
            </div>

            <div>
              <label htmlFor="reviewText" className="block text-sm font-medium text-slate-300 mb-2">
                Review comment
              </label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={1000}
                rows={6}
                placeholder="Share your experience..."
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 p-3"
              />
              <p className={`text-right text-xs mt-1 ${remainingChars < 100 ? 'text-red-400' : 'text-slate-400'}`}>
                {remainingChars} characters remaining
              </p>
            </div>

            {submitError && (
              <p className="text-red-400 text-sm text-center">{submitError}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitReviewPage;