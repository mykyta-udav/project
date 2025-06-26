import type { Dish as DishType } from '@/types/dish';
import Dish from './Dish';

interface DishGridProps {
  dishes: DishType[];
  onDishClick?: (dish: DishType) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  className?: string;
}

const DishGrid = ({
  dishes,
  onDishClick,
  loading = false,
  error = null,
  emptyMessage = 'No dishes available',
  className = '',
}: DishGridProps) => {
  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading dishes...</div>
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
        <div className='text-gray-500'>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className='grid grid-cols-[repeat(auto-fit,316px)] justify-center gap-8'>
        {dishes.map((dish) => (
          <Dish 
            key={dish.id || dish.name} 
            dish={dish} 
            onClick={onDishClick ? () => onDishClick(dish) : undefined} 
          />
        ))}
      </div>
    </div>
  );
};

export default DishGrid;
