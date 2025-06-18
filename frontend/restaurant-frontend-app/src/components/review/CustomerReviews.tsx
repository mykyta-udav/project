import { useState, useEffect } from 'react';
import { feedbackAPI } from '@/services/api';
import { FeedbackType, type Feedback } from '@/types/feedback';
import ReviewCard from './ReviewCard';
import Pagination from './Pagination';
import type { SortOption } from './SortDropdown';

interface CustomerReviewsProps {
  locationId: string;
  activeTab: FeedbackType;
  sortOrder: SortOption;
}

const mockServiceReviews: Feedback[] = [
  {
    id: '1',
    rate: '5',
    comment: 'Exceptional service! The staff was incredibly attentive and made our dining experience truly memorable. Highly recommend!',
    userName: 'Sarah Johnson',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-08-06',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  },
  {
    id: '2',
    rate: '4',
    comment: 'Great atmosphere and friendly staff. The service was prompt and professional. Will definitely come back!',
    userName: 'Michael Chen',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-07-28',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  },
  {
    id: '3',
    rate: '5',
    comment: 'Outstanding service from start to finish. Every detail was perfect!',
    userName: 'Anna Kowalski',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-07-15',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  },
  {
    id: '4',
    rate: '5',
    comment: 'The waiters were so attentive and knowledgeable about the menu. Excellent customer service!',
    userName: 'David Martinez',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-06-20',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  },
  {
    id: '5',
    rate: '4',
    comment: 'Quick seating, friendly service, and the staff really went above and beyond!',
    userName: 'Emma Wilson',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-06-10',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  },
  {
    id: '6',
    rate: '5',
    comment: 'Perfect service! The team made our anniversary dinner absolutely special.',
    userName: 'James Brown',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-05-25',
    type: FeedbackType.SERVICE_QUALITY,
    locationId: ''
  }
];

const mockCuisineReviews: Feedback[] = [
  {
    id: '7',
    rate: '5',
    comment: 'The food was absolutely amazing! Fresh ingredients and incredible flavors. Best Georgian cuisine in the city!',
    userName: 'Maria Rodriguez',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-08-05',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  },
  {
    id: '8',
    rate: '4',
    comment: 'Delicious dishes with authentic Georgian flavors. The khachapuri was perfection!',
    userName: 'Alex Thompson',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-07-22',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  },
  {
    id: '9',
    rate: '5',
    comment: 'Every bite was a culinary adventure. The seasonal menu was creative and fresh!',
    userName: 'Sophie Kim',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-07-18',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  },
  {
    id: '10',
    rate: '5',
    comment: 'Outstanding Georgian cuisine! The vegetarian options were creative and delicious.',
    userName: 'Robert Taylor',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-06-30',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  },
  {
    id: '11',
    rate: '4',
    comment: 'Fresh, locally sourced ingredients really make a difference. Loved every dish!',
    userName: 'Lisa Anderson',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-06-15',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  },
  {
    id: '12',
    rate: '5',
    comment: 'The modern twist on Georgian classics was brilliant. Highly recommend the tasting menu!',
    userName: 'Tom Harris',
    userAvatarUrl: '/api/placeholder/60/60',
    date: '2024-05-28',
    type: FeedbackType.CUISINE_EXPERIENCE,
    locationId: ''
  }
];

const CustomerReviews = ({ locationId, activeTab, sortOrder }: CustomerReviewsProps) => {
  const [serviceReviews, setServiceReviews] = useState<Feedback[]>([]);
  const [cuisineReviews, setCuisineReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  useEffect(() => {
    const fetchAllReviews = async () => {
      if (!locationId) return;

      try {
        setLoading(true);
        
        // Try to fetch both types of reviews
        const [serviceResponse, cuisineResponse] = await Promise.all([
          feedbackAPI.getFeedbacks(locationId, FeedbackType.SERVICE_QUALITY).catch(() => null),
          feedbackAPI.getFeedbacks(locationId, FeedbackType.CUISINE_EXPERIENCE).catch(() => null)
        ]);

        // Set locationId for mock data
        const serviceWithLocationId = mockServiceReviews.map(review => ({ ...review, locationId }));
        const cuisineWithLocationId = mockCuisineReviews.map(review => ({ ...review, locationId }));

        setServiceReviews(serviceResponse?.content || serviceWithLocationId);
        setCuisineReviews(cuisineResponse?.content || cuisineWithLocationId);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Error fetching reviews:', err);
        
        // Use mock data on error
        const serviceWithLocationId = mockServiceReviews.map(review => ({ ...review, locationId }));
        const cuisineWithLocationId = mockCuisineReviews.map(review => ({ ...review, locationId }));
        
        setServiceReviews(serviceWithLocationId);
        setCuisineReviews(cuisineWithLocationId);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, [locationId]);

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

  // Get current reviews based on active tab
  const currentReviews = activeTab === FeedbackType.SERVICE_QUALITY ? serviceReviews : cuisineReviews;
  
  // Sort reviews based on sort order
  const sortedReviews = [...currentReviews].sort((a, b) => {
    switch (sortOrder) {
      case 'rating-high':
        return parseInt(b.rate) - parseInt(a.rate);
      case 'rating-low':
        return parseInt(a.rate) - parseInt(b.rate);
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return 0;
    }
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Reviews */}
      {error && sortedReviews.length === 0 ? (
        <div className='flex h-40 items-center justify-center'>
          <div className='text-red-500'>Failed to load reviews</div>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-12 pt-8'>
            {paginatedReviews.map((review) => (
              <ReviewCard key={review.id} feedback={review} />
            ))}
          </div>
          
          {/* Pagination with 30px margin after */}
          {totalPages > 1 && (
            <div className="mb-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerReviews; 