import { useState, useEffect } from 'react';
import { locationsAPI } from '@/services/api';
import type { Location } from '@/types/location';
import Restaurant from './Restaurant';

const LocationList = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await locationsAPI.getLocations();
        setLocations(data);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error fetching locations:', err);
        setLocations([]); // Clear any existing locations on error
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>Loading locations...</div>
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

  if (locations.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-gray-500'>No locations available</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex gap-12 overflow-x-auto pb-16 pl-12 pt-8'>
        {locations.map((location) => (
          <div key={location.id}>
            <Restaurant location={location} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationList;
