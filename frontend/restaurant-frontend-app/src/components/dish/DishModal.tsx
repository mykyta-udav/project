import { useEffect } from 'react';
import type { DetailedDish } from '@/types/dish';

interface DishModalProps {
  dish: DetailedDish | null;
  isOpen: boolean;
  onClose: () => void;
}

const DishModal = ({ dish, isOpen, onClose }: DishModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !dish) return null;

  const isOnStop = dish.state === 'On Stop' || dish.state === 'On stop';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='relative mx-4 max-h-[90vh] w-[500px] overflow-y-auto rounded-[24px] bg-white'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-md hover:bg-gray-50'
        >
          ✕
        </button>

        {/* Modal content */}
        <div className='p-6'>
          {/* Dish image */}
          <div className='mb-6 flex justify-center'>
            <div
              className='h-[300px] w-[300px] overflow-hidden rounded-full bg-gray-200'
              style={{
                boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.50)',
              }}
            >
              <img 
                src={dish.imageUrl} 
                alt={dish.name} 
                className='h-full w-full object-cover'
              />
            </div>
          </div>

          {/* Dish name and status */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-medium text-gray-600'>{dish.name}</h2>
              {isOnStop && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-light text-black">
                  On Stop
                </span>
              )}
            </div>

            <div className='text-base font-light text-gray-600'>
              {/* Description */}
              {dish.description && (
                <div className='mb-4'>{dish.description}</div>
              )}

              {/* Nutritional Information */}
              <div className='mb-4'>
                <div className='mb-2'>
                  <span className='font-medium'>Calories: </span>
                  {dish.calories}
                </div>
                <div className='mb-2'>
                  <span className='font-medium'>Proteins: </span>
                  {dish.proteins}
                </div>
                <div className='mb-2'>
                  <span className='font-medium'>Fats: </span>
                  {dish.fats}
                </div>
                <div className='mb-2'>
                  <span className='font-medium'>Carbohydrates: </span>
                  {dish.carbohydrates}
                </div>
                <div className='mb-4'>
                  <span className='font-medium'>Vitamins and minerals: </span>
                  {dish.vitamins}
                </div>
              </div>

              {/* Price and Weight */}
              <div className='flex items-center justify-between text-xl font-medium'>
                <span className='text-[#00AD0C]'>{dish.price}</span>
                <span className='text-gray-500'>{dish.weight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishModal;
