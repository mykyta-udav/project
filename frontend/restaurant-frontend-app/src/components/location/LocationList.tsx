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
        const data = await locationsAPI.getLocations();
        setLocations(data);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error fetching locations:', err);

        // Mock data for development since API endpoint is not implemented yet
        const mockLocations: Location[] = [
          {
            id: '1',
            address: '48 Rustaveli Avenue',
            description: '',
            totalCapacity: '10 tables',
            averageOccupancy: '90%',
            imageUrl: '/src/assets/mock-images/Picture.png',
            rating: '4.8',
          },
          {
            id: '2',
            address: '14 Baratashvili Street',
            description: '',
            totalCapacity: '16 tables',
            averageOccupancy: '78%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.6',
          },
          {
            id: '3',
            address: '9 Abashidze Street',
            description: '',
            totalCapacity: '20 tables',
            averageOccupancy: '85%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.7',
          },
        ];
        setLocations(mockLocations);
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

  if (error && locations.length === 0) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <div className='text-red-500'>Failed to load locations</div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <div className='flex gap-6 overflow-x-auto pb-16 pl-12 pt-8'>
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
