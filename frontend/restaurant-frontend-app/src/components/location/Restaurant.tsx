import type { Location } from '@/types/location';
import locationIcon from '../../assets/icons/location.png';

interface RestaurantProps {
  location: Location;
}

const Restaurant = ({ location }: RestaurantProps) => {
  return (
    <div className='h-[256px] w-[432px] overflow-hidden rounded-3xl bg-white shadow-lg'>
      {/* Image */}
      <div className='h-[140px] w-full overflow-hidden rounded-t-3xl'>
        <img
          src={location.imageUrl}
          alt={location.address}
          className='h-full w-full object-cover'
        />
      </div>

      {/* Content */}
      <div className='flex flex-col gap-4 p-6'>
        {/* Address with location icon */}
        <div className='flex items-center gap-2'>
          <img src={locationIcon} alt='location' className='h-4 w-4' />
          <span className='text-sm font-medium text-[#232323]'>{location.address}</span>
        </div>

        {/* Description
        {location.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {location.description}
          </p>
        )} */}

        {/* Capacity and Occupancy in one row */}
        <div className='flex items-center gap-8'>
          <div className='flex items-center gap-1'>
            <span className='text-sm text-gray-500'>Total capacity:</span>
            <span className='text-sm font-medium text-[#232323]'>{location.totalCapacity}</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='text-sm text-gray-500'>Average occupancy:</span>
            <span className='text-sm font-medium text-[#232323]'>{location.averageOccupancy}</span>
          </div>
        </div>

        {/* Rating if available */}
        {/* {location.rating && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Rating:</span>
            <span className="text-sm font-medium text-[#232323]">
              {location.rating}
            </span>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Restaurant;
