import { useState, useEffect } from 'react';
import { dishesAPI } from '@/services/api';
import type { Dish as DishType } from '@/types/dish';
import Dish from './Dish';

interface SpecialtyDishListProps {
  locationId: string;
  onDishClick?: (dish: DishType) => void;
}

const SpecialtyDishList = ({ locationId, onDishClick }: SpecialtyDishListProps) => {
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialtyDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dishesAPI.getSpecialityDishes(locationId);
        setDishes(data);
      } catch (err) {
        setError('Failed to load specialty dishes');
        console.error('Error fetching specialty dishes:', err);
        setDishes([]); // Clear any existing dishes on error
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchSpecialtyDishes();
    }
  }, [locationId]);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading specialty dishes...</div>
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

  if (dishes.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>No specialty dishes available</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:pl-12 lg:pt-10'>
        {dishes.map((dish, index) => (
          <div key={index} className='flex justify-center'>
            <Dish 
              dish={dish} 
              onClick={onDishClick ? () => onDishClick(dish) : undefined} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialtyDishList; 