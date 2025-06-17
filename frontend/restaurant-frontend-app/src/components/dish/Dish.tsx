import type { Dish as DishType } from '@/types/dish';

interface DishProps {
  dish: DishType;
}

const Dish = ({ dish }: DishProps) => {
  return (
    <div 
      className="flex w-[316px] p-6 flex-col items-center gap-4 rounded-3xl bg-white"
      style={{
        boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.50)'
      }}
    >
      {/* Image */}
      <div 
        className="w-[196px] h-[196px] rounded-full bg-gray-200 overflow-hidden"
        style={{
          boxShadow: '0px 0px 10px 4px rgba(194, 194, 194, 0.50)'
        }}
      >
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content with 16px gap */}
      <div className="flex flex-col items-start gap-4 w-full">
        {/* Dish name */}
        <h3 className="text-sm font-medium text-left text-[#232323] leading-tight">
          {dish.name}
        </h3>
        
        {/* Price and weight row */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-medium text-gray-500">
            ${dish.price}
          </span>
          <span className="text-xs text-gray-500">
            {dish.weight}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dish; 