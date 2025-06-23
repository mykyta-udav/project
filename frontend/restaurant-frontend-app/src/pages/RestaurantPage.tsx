import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { locationsAPI } from '@/services/api';
import type { Location } from '@/types/location';
import locationIcon from '../assets/icons/location.png';
import starIcon from '../assets/icons/star-01.png';
import SpecialtyDishList from '../components/dish/SpecialtyDishList';
import CustomerReviews from '../components/review/CustomerReviews';
import SortDropdown, { type SortOption } from '../components/review/SortDropdown';
import { FeedbackType } from '@/types/feedback';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<FeedbackType>(FeedbackType.SERVICE_QUALITY);
  const [sortOrder, setSortOrder] = useState<SortOption>('rating-high');

  const reviewTabs = [
    { type: FeedbackType.SERVICE_QUALITY, label: 'Service' },
    { type: FeedbackType.CUISINE_EXPERIENCE, label: 'Cuisine experience' }
  ];

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const locations = await locationsAPI.getLocations();
        const foundRestaurant = locations.find((location) => location.id === id);

        if (foundRestaurant) {
          setRestaurant(foundRestaurant);
        } else {
          setError('Restaurant not found');
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);

        // Mock data 
        const mockLocations: Location[] = [
          {
            id: '2',
            address: '100 Main St, Springfield',
            description:
              'A cozy family restaurant offering a variety of dishes and a comfortable dining experience. Located on bustling Main Street, this branch offers a perfect mix of city energy and a cozy atmosphere. Known for our fresh, locally sourced dishes, we focus on health and sustainability, serving Georgian cuisine with a modern twist. The menu includes vegetarian and vegan options along with exclusive seasonal specials.',
            totalCapacity: '10 tables',
            averageOccupancy: '75%',
            imageUrl: '/src/assets/mock-images/Picture.png',
            rating: '4.5',
          },
          {
            id: '1',
            address: '123 Main St, Springfield',
            description:
              'A cozy family restaurant offering a variety of dishes and a comfortable dining experience. This location specializes in traditional Georgian flavors with contemporary presentation.',
            totalCapacity: '16 tables',
            averageOccupancy: '75%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.5',
          },
        ];

        const foundRestaurant = mockLocations.find((location) => location.id === id);
        if (foundRestaurant) {
          setRestaurant(foundRestaurant);
        } else {
          setError('Restaurant not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleReviewTabChange = (tab: FeedbackType) => {
    setActiveReviewTab(tab);
  };

  const handleSortChange = (newSortOrder: SortOption) => {
    setSortOrder(newSortOrder);
  };

  if (loading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-gray-500'>Loading restaurant details...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-red-500'>{error || 'Restaurant not found'}</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* navigation */}
      <div className='border-b border-gray-200 bg-white px-4 py-4 md:px-6 lg:px-12'>
        <nav className='text-sm text-gray-600'>
          <Link to='/' className='transition-colors hover:text-[#00AD0C]'>
            Main page
          </Link>
          <span className='mx-2'>&gt;</span>
          <span className='text-gray-900'>Location {restaurant.address}</span>
        </nav>
      </div>

      {/* Restaurant Banner */}
      <div className='relative bg-white'>
        <div className='flex justify-center px-4 py-6 md:px-6 lg:px-12 lg:py-8'>
          <div className='flex w-full max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-32'>
            <div className='order-2 flex w-full max-w-[340px] flex-col lg:order-1 lg:h-[504px] lg:w-[340px]'>
              <h1 className='hidden text-4xl font-medium leading-tight text-[#00AD0C] lg:block lg:text-[48px]'>
                Green & Tasty
              </h1>

              <div className='mt-4 lg:mt-6'>
                <div className='flex items-center gap-2 font-bold'>
                  <img src={locationIcon} alt='location' className='h-4 w-4' />
                  <span className='text-sm text-black lg:text-base'>{restaurant.address}</span>
                  <img src={starIcon} alt='star' className='ml-2 h-4 w-4' />
                  <span className='text-sm text-black lg:text-base'>{restaurant.rating}</span>
                </div>
              </div>

              <div className='mt-4 flex-1 lg:mt-6'>
                {restaurant.description.split('\n\n').length > 1
                  ? 
                    restaurant.description.split('\n\n').map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-sm font-bold leading-relaxed text-gray-700 lg:font-normal ${index > 0 ? 'mt-3' : ''}`}
                      >
                        {paragraph.trim()}
                      </p>
                    ))
                  : 
                    (() => {
                      const sentences = restaurant.description.split('. ');
                      const midPoint = Math.ceil(sentences.length / 2);
                      const firstParagraph =
                        sentences.slice(0, midPoint).join('. ') +
                        (sentences.length > midPoint ? '.' : '');
                      const secondParagraph = sentences.slice(midPoint).join('. ');

                      return (
                        <>
                          <p className='text-sm font-bold leading-relaxed text-gray-700 lg:font-normal'>{firstParagraph}</p>
                          {secondParagraph && (
                            <p className='mt-3 text-sm font-bold leading-relaxed text-gray-700 lg:font-normal'>
                              {secondParagraph}
                            </p>
                          )}
                        </>
                      );
                    })()}
              </div>
              <div className='mt-6 lg:mt-10'>
                <button className='h-12 w-full rounded-lg bg-[#00AD0C] font-semibold text-white transition-colors hover:bg-[#008209] lg:h-[56px] lg:w-[340px]'>
                  Book a Table
                </button>
              </div>
            </div>
            <div className='order-1 h-64 w-full max-w-md md:h-80 lg:order-2 lg:h-[504px] lg:w-[941px] lg:max-w-none'>
              <ImageWithFallback
                src={restaurant.imageUrl}
                alt={restaurant.address}
                imageType="location"
                className='h-full w-full rounded-2xl object-cover'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Dishes */}
      <section className='px-4 pt-6 md:px-6 lg:px-12'>
        <span className='text-xl font-medium text-black md:text-2xl'>Specialty Dishes</span>
        <div className='container mx-auto px-2 md:px-6'>
          <SpecialtyDishList locationId={restaurant.id} />
        </div>
      </section>

      <section className='px-4 pt-12 md:px-6 lg:px-12 lg:pt-16'>
        <span className='text-xl font-medium text-black md:text-2xl'>Customer Reviews</span>
        
        <div className='mt-6 lg:mt-10'>
          <div className='mb-6 flex flex-col gap-4 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between lg:mb-8'>
            <div className='flex gap-4 sm:gap-8'>
              {reviewTabs.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => handleReviewTabChange(tab.type)}
                  className={`pb-3 text-base font-medium transition-colors sm:pb-4 sm:text-lg ${
                    activeReviewTab === tab.type
                      ? 'text-[#00AD0C] border-b border-[#00AD0C]'
                      : 'text-[#232323] hover:text-[#00AD0C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <SortDropdown value={sortOrder} onValueChange={handleSortChange} />
          </div>
        </div>

        <div className='container mx-auto px-2 md:px-6'>
          <CustomerReviews 
            locationId={restaurant.id} 
            activeTab={activeReviewTab}
            sortOrder={sortOrder}
          />
        </div>
      </section>
    </div>
  );
};

export default RestaurantPage;
