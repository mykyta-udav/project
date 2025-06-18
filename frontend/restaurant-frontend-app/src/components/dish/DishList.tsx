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
        const data = await dishesAPI.getPopularDishes();
        setDishes(data);
      } catch (err) {
        setError('Failed to load popular dishes');
        console.error('Error fetching popular dishes:', err);

        // Mock data for development 
        const mockDishes: DishType[] = [
          {
            name: 'Fresh Strawberry Mint Salad',
            price: '12',
            weight: '300 g',
            imageUrl: 'src/assets/mock-images/Dish picture.png',
          },
          {
            name: 'Avocado Pine Nut Bowl',
            price: '15',
            weight: '450 g',
            imageUrl: '/api/placeholder/196/196',
          },
          {
            name: 'Roasted Sweet Potato & Lentil Salad',
            price: '14',
            weight: '400 g',
            imageUrl: '/api/placeholder/196/196',
          },
          {
            name: 'Spring Salad',
            price: '13',
            weight: '430 g',
            imageUrl: '/api/placeholder/196/196',
          },
        ];
        setDishes(mockDishes);
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

  if (error && dishes.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-red-500'>Failed to load dishes</div>
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
