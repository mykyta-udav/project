import type { Dish as DishType } from '@/types/dish';

interface DishProps {
  dish: DishType;
}

const Dish = ({ dish }: DishProps) => {
  return (
    <div
      className='flex w-[316px] flex-col items-center gap-4 rounded-3xl bg-white p-6'
      style={{
        boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.2)',
      }}
    >
      {/* Image */}
      <div
        className='h-[196px] w-[196px] overflow-hidden rounded-full bg-gray-200'
        style={{
          boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.50)',
        }}
      >
        <img src={dish.imageUrl} alt={dish.name} className='h-full w-full object-cover' />
      </div>

      {/* Content  */}
      <div className='flex w-full flex-col items-start gap-4'>
        {/* Dish */}
        <h3 className='text-left text-sm font-medium leading-tight text-[#232323]'>{dish.name}</h3>

        {/* Price and weight */}
        <div className='flex w-full items-center justify-between'>
          <span className='text-xs font-medium text-gray-500'>${dish.price}</span>
          <span className='text-xs text-gray-500'>{dish.weight}</span>
        </div>
      </div>
    </div>
  );
};

export default Dish;
