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

        const mockLocations: Location[] = [
          {
            id: '672846d5c951184d705b65d7',
            address: '48 Rustaveli Avenue',
            description: 'Located on bustling Rustaveli Avenue, this branch offers a perfect mix of city energy and a cozy atmosphere. Known for our fresh, locally sourced dishes, we focus on health and sustainability, serving Georgian cuisine with a modern twist. The menu includes vegetarian and vegan options along with exclusive seasonal specials. With its spacious outdoor terrace, this location is ideal for both casual lunches and intimate dinners.',
            totalCapacity: '10 tables',
            averageOccupancy: '90%',
            imageUrl: '/src/assets/mock-images/Picture.png',
            rating: '4.8',
          },
          {
            id: '672846d5c951184d705b65d8',
            address: '14 Baratashvili Street',
            description: 'Our cozy branch on Baratashvili Street offers an intimate dining experience with warm atmosphere and exceptional service. This location specializes in traditional Georgian flavors with contemporary presentation.',
            totalCapacity: '16 tables',
            averageOccupancy: '78%',
            imageUrl: '/api/placeholder/256/140',
            rating: '4.6',
          },
          {
            id: '672846d5c951184d705b65d9',
            address: '9 Abashidze Street',
            description: 'Located in the heart of Saburtalo, this spacious restaurant features modern décor and an extensive menu. Perfect for families and large groups, offering both indoor and outdoor seating.',
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
