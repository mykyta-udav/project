import type { Dish as DishType } from '@/types/dish';

interface DishProps {
  dish: DishType;
  onClick?: () => void;
}

const Dish = ({ dish, onClick }: DishProps) => {
  const isOnStop = dish.state === 'On Stop' || dish.state === 'On stop';

  return (
    <div
      className={`relative flex w-[316px] flex-col items-center gap-4 rounded-3xl bg-white p-6 ${
        onClick ? 'cursor-pointer transition-shadow duration-200 hover:shadow-lg' : ''
      }`}
      style={{
        boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.2)',
      }}
      onClick={onClick}
    >
      {/* On Stop Badge */}
      {isOnStop && (
        <div className='absolute right-4 top-4 z-10 rounded-full bg-red-100 px-3 py-1 text-xs font-light text-black'>
          On Stop
        </div>
      )}

      <div
        className={`relative h-[196px] w-[196px] overflow-hidden rounded-full bg-gray-200`}
        style={{
          boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.50)',
        }}
      >
        <img
          src={dish.imageUrl}
          alt={'image is not avaliable'}
          className='h-full w-full object-cover'
        />
        {isOnStop && (
          <div className='absolute inset-0 rounded-full bg-gray-200 bg-opacity-60'></div>
        )}
      </div>

      {/* about dish  */}
      <div
        className={`relative flex w-full flex-col items-start gap-4 ${isOnStop ? 'opacity-70' : ''}`}
      >
        {isOnStop && <div className='absolute inset-0 rounded-lg bg-gray-200 bg-opacity-40'></div>}

        <h3
          className={`relative z-10 text-left text-sm font-medium leading-tight ${
            isOnStop ? 'text-gray-400' : 'text-[#232323]'
          }`}
        >
          {dish.name}
        </h3>

        <div className='relative z-10 flex w-full items-center justify-between'>
          <span className={`text-xs font-medium ${isOnStop ? 'text-gray-400' : 'text-gray-500'}`}>
            {dish.price}
          </span>
          <span className={`text-xs ${isOnStop ? 'text-gray-400' : 'text-gray-500'}`}>
            {dish.weight}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dish;
