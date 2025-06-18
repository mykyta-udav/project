import { useState, useEffect } from 'react';
import { dishesAPI } from '@/services/api';
import type { Dish as DishType } from '@/types/dish';
import Dish from './Dish';

interface SpecialtyDishListProps {
  locationId: string;
}

const SpecialtyDishList = ({ locationId }: SpecialtyDishListProps) => {
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpecialtyDishes = async () => {
      try {
        setLoading(true);
        const data = await dishesAPI.getSpecialityDishes(locationId);
        setDishes(data);
      } catch (err) {
        setError('Failed to load specialty dishes');
        console.error('Error fetching specialty dishes:', err);
        
        // Mock data for development
        const mockSpecialtyDishes: DishType[] = [
          {
            name: 'Khachapuri Adjarian Style',
            price: '18',
            weight: '400 g',
            imageUrl: '/api/placeholder/196/196',
          },
          {
            name: 'Lobio with Georgian Bread',
            price: '16',
            weight: '350 g',
            imageUrl: '/api/placeholder/196/196',
          },
          {
            name: 'Pkhali Trio Plate',
            price: '14',
            weight: '250 g',
            imageUrl: '/api/placeholder/196/196',
          },
          {
            name: 'Churchkhela with Nuts',
            price: '8',
            weight: '150 g',
            imageUrl: '/api/placeholder/196/196',
          },
        ];
        setDishes(mockSpecialtyDishes);
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

  if (error && dishes.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-red-500'>Failed to load specialty dishes</div>
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

export default SpecialtyDishList; 