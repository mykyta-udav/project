import { useState, useEffect } from 'react';
import { feedbackAPI } from '@/services/api';
import { FeedbackType, type Feedback, type FeedbackResponse } from '@/types/feedback';
import ReviewCard from './ReviewCard';
import Pagination from './Pagination';
import type { SortOption } from './SortDropdown';

interface CustomerReviewsProps {
  locationId: string;
  activeTab: FeedbackType;
  sortOrder: SortOption;
}

const CustomerReviews = ({ locationId, activeTab, sortOrder }: CustomerReviewsProps) => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const reviewsPerPage = 4;

  // Convert frontend sort option to backend format
  const getSortParameters = (sortOption: SortOption): string[] => {
    switch (sortOption) {
      case 'rating-high':
        return ['rate,desc'];
      case 'rating-low':
        return ['rate,asc'];
      case 'newest':
        return ['date,desc'];
      case 'oldest':
        return ['date,asc'];
      default:
        return ['date,desc'];
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchReviews = async () => {
      if (!locationId) return;

      try {
        setLoading(true);
        setError(null);

        const sortParams = getSortParameters(sortOrder);
        
        const response: FeedbackResponse = await feedbackAPI.getFeedbacks(
          locationId,
          activeTab,
          currentPage - 1, // Backend uses 0-based pagination
          reviewsPerPage,
          sortParams
        );

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setReviews(response.content || []);
          setTotalPages(response.totalPages || 0);
        }

      } catch (err) {
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setError('Failed to load reviews');
          console.error('Error fetching reviews:', err);
          setReviews([]);
          setTotalPages(0);
        }
      } finally {
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    // Cleanup function to abort request when dependencies change or component unmounts
    return () => {
      abortController.abort();
    };
  }, [locationId, activeTab, sortOrder, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Reset page when sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder]);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-red-500'>{error}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>No reviews available for this location</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Reviews */}
      <div className='grid grid-cols-1 justify-items-center gap-4 pt-6 sm:grid-cols-2 sm:justify-items-stretch sm:gap-6 lg:grid-cols-4 lg:px-12 lg:pt-8'>
        {reviews.map((review) => (
          <ReviewCard key={review.id} feedback={review} />
        ))}
      </div>
      
      {/* Pagination - only show if there are multiple pages */}
      {totalPages > 1 && (
        <div className="mb-6 mt-6 w-full lg:mb-8 lg:mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerReviews; 