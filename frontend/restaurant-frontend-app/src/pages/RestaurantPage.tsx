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
        // In a real implementation, we'd have an API endpoint for individual restaurants
        // For now, we'll get all locations and filter by ID
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
            id: '672846d5c951184d705b65d7',
            address: '48 Rustaveli Avenue',
            description:
              'Located on bustling Rustaveli Avenue, this branch offers a perfect mix of city energy and a cozy atmosphere. Known for our fresh, locally sourced dishes, we focus on health and sustainability, serving Georgian cuisine with a modern twist. The menu includes vegetarian and vegan options along with exclusive seasonal specials. With its spacious outdoor terrace, this location is ideal for both casual lunches and intimate dinners.',
            totalCapacity: '10 tables',
            averageOccupancy: '90%',
            imageUrl: '/src/assets/mock-images/Picture.png',
            rating: '4.73',
          },
          {
            id: '672846d5c951184d705b65d8',
            address: '14 Baratashvili Street',
            description:
              'Our cozy branch on Baratashvili Street offers an intimate dining experience with warm atmosphere and exceptional service. This location specializes in traditional Georgian flavors with contemporary presentation.',
            totalCapacity: '16 tables',
            averageOccupancy: '78%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.6',
          },
          {
            id: '672846d5c951184d705b65d9',
            address: '9 Abashidze Street',
            description:
              'Located in the heart of Saburtalo, this spacious restaurant features modern décor and an extensive menu. Perfect for families and large groups, offering both indoor and outdoor seating.',
            totalCapacity: '20 tables',
            averageOccupancy: '85%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.7',
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
      <div className='border-b border-gray-200 bg-white px-6 py-4 md:px-12'>
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
        <div className='flex justify-center px-6 py-8 md:px-12'>
          <div className='flex items-center gap-32'>
            <div className='flex h-[504px] w-[340px] flex-col'>
              <h1 className='text-[48px] font-medium leading-tight text-[#00AD0C]'>
                Green & Tasty
              </h1>

              <div className='mt-6'>
                <div className='flex items-center gap-2 font-bold'>
                  <img src={locationIcon} alt='location' className='h-4 w-4' />
                  <span className='text-black'>{restaurant.address}</span>
                  <img src={starIcon} alt='star' className='ml-2 h-4 w-4' />
                  <span className='text-black'>{restaurant.rating}</span>
                </div>
              </div>

              <div className='mt-6 flex-1'>
                {restaurant.description.split('\n\n').length > 1
                  ? 
                    restaurant.description.split('\n\n').map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-sm leading-relaxed text-gray-700 ${index > 0 ? 'mt-3' : ''}`}
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
                          <p className='text-sm leading-relaxed text-gray-700'>{firstParagraph}</p>
                          {secondParagraph && (
                            <p className='mt-3 text-sm leading-relaxed text-gray-700'>
                              {secondParagraph}
                            </p>
                          )}
                        </>
                      );
                    })()}
              </div>
              <div className='mt-10'>
                <button className='h-[56px] w-[340px] rounded-lg bg-[#00AD0C] font-semibold text-white transition-colors hover:bg-[#008209]'>
                  Book a Table
                </button>
              </div>
            </div>
            <div className='h-[504px] w-[941px]'>
              <img
                src={restaurant.imageUrl}
                alt={restaurant.address}
                className='h-full w-full rounded-2xl'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Dishes */}
      <section className='px-6 pt-6 md:px-12'>
        <span className='text-2xl font-medium text-black'>Specialty Dishes</span>
        <div className='container mx-auto px-6'>
          <SpecialtyDishList locationId={restaurant.id} />
        </div>
      </section>

      <section className='px-6 pt-16 md:px-12'>
        <span className='text-2xl font-medium text-black'>Customer Reviews</span>
        
        <div className='mt-10'>
          <div className='flex justify-between items-center mb-8 border-b border-gray-200'>
            <div className='flex gap-8'>
              {reviewTabs.map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => handleReviewTabChange(tab.type)}
                  className={`pb-4 text-lg font-medium transition-colors ${
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

        <div className='container mx-auto px-6'>
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
