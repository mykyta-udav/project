import { useState, useEffect } from 'react';
import { dishesAPI } from '@/services/api';
import type { Dish as DishType } from '@/types/dish';
import Dish from './Dish';

const DishList = () => {
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dishesAPI.getPopularDishes();
        setDishes(data);
      } catch (err) {
        setError('Failed to load popular dishes');
        console.error('Error fetching popular dishes:', err);
        setDishes([]); // Clear any existing dishes on error
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDishes();
  }, []);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading popular dishes...</div>
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
        <div className='text-gray-500'>No popular dishes available</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex gap-12 overflow-x-auto pb-4 pl-12 pt-10'>
        {dishes.map((dish, index) => (
          <div key={index}>
            <Dish dish={dish} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DishList;
