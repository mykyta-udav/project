import mainBannerImage from '../assets/images/main-banner-image.png';
import locationIcon from '../assets/icons/location.png';
import calendarIcon from '../assets/icons/calendar.png';
import clockIcon from '../assets/icons/clock.png';
import peopleIcon from '../assets/icons/people.png';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DropdownMenu as CalendarDropdown,
  DropdownMenuContent as CalendarDropdownContent,
  DropdownMenuTrigger as CalendarDropdownTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { locationsAPI, bookingAPI } from '@/services/api';
import type { LocationSelectOption } from '@/types/location';
import type { BookingTable } from '@/types/booking';
import { format } from 'date-fns';
import TableCard from '@/components/booking/TableCard';

// Mock data fallback
const mockLocations: LocationSelectOption[] = [
  { id: 'mock-1', address: '48 Rustaveli Avenue' },
  { id: 'mock-2', address: '14 Baratashvili Street' },
  { id: 'mock-3', address: '9 Abashidze Street' },
];

// Mock tables data
const mockTables: BookingTable[] = [
  {
    locationId: 'mock-1',
    locationAddress: '48 Rustaveli Avenue',
    tableNumber: '1',
    capacity: '4',
    availableSlots: [
      '10:30 a.m. - 12:00 p.m',
      '12:15 p.m. - 1:45 p.m',
      '2:00 p.m. - 3:30 p.m',
      '3:45 p.m. - 5:15 p.m',
      '5:30 p.m. - 7:00 p.m',
    ],
  },
  {
    locationId: 'mock-1',
    locationAddress: '48 Rustaveli Avenue',
    tableNumber: '2',
    capacity: '2',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
  {
    locationId: 'mock-1',
    locationAddress: '48 Rustaveli Avenue',
    tableNumber: '2',
    capacity: '2',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
  {
    locationId: 'mock-1',
    locationAddress: '48 Rustaveli Avenue',
    tableNumber: '2',
    capacity: '2',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
  {
    locationId: 'mock-2',
    locationAddress: '48 Rustaveli Avenue',
    tableNumber: '2',
    capacity: '2',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
];

const BookPage = () => {
  const [selectedLocation, setSelectedLocation] = useState('Location');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('Time');
  const [guestCount, setGuestCount] = useState(2);
  const [locations, setLocations] = useState<LocationSelectOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tables, setTables] = useState<BookingTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const defaultTimes = [
    '7:00 PM',
    '8:00 PM',
    '6:00 PM',
    '9:00 PM',
    '6:30 PM',
    '7:30 PM',
    '8:30 PM',
    '9:30 PM',
  ];

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const locationData = await locationsAPI.getLocationSelectOptions();
        setLocations(locationData);
      } catch (error) {
        console.error('Error fetching locations:', error);
        console.log('Using mock data fallback');
        setLocations(mockLocations);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationSelect = (location: LocationSelectOption) => {
    setSelectedLocation(location.address);
    setSelectedLocationId(location.id);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Format date for display
  const formatDateForDisplay = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return format(date, 'MMM dd, yyyy');
  };

  const handleFindTable = async () => {
    // Validate all required fields
    if (selectedLocationId === '' || selectedLocation === 'Location') {
      alert('Please select a location');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    if (selectedTime === 'Time') {
      alert('Please select a time');
      return;
    }

    try {
      setTablesLoading(true);
      setShowResults(true);

      const searchParams = {
        locationId: selectedLocationId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        guests: guestCount.toString(),
      };

      try {
        const tableData = await bookingAPI.getAvailableTables(searchParams);
        setTables(tableData);
      } catch (error) {
        console.error('Error fetching tables:', error);
        console.log('Using mock data fallback');
        // Filter mock tables by selected location
        const filteredMockTables = mockTables.filter(
          (table) => table.locationAddress === selectedLocation
        );
        setTables(filteredMockTables);
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search for tables. Please try again.');
    } finally {
      setTablesLoading(false);
    }
  };

  return (
    <div>
      <section className="pb-10">
        <div
          className="relative h-[440px] bg-cover bg-center bg-no-repeat p-6 md:p-12"
          style={{
            backgroundImage: `url(${mainBannerImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col gap-[22px] pt-14">
              <h2 className="text-2xl font-medium leading-[48px] text-[#00AD0C]">
                Green & Tasty Restaurants
              </h2>
              <h1 className="text-5xl font-medium leading-[48px] text-[#00AD0C]">Book a Table</h1>
            </div>

            {/* Booking Form  */}
            <div className="mt-[40px]">
              <div className="flex flex-wrap items-end justify-start gap-6">
                {/* Location Dropdown */}
                <div className="w-[500px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-6 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={locationsLoading}
                      >
                        <img src={locationIcon} alt="Location" className="h-5 w-5" />
                        <span
                          className={
                            selectedLocation === 'Location' ? 'text-gray-500' : 'text-black'
                          }
                        >
                          {locationsLoading ? 'Loading locations...' : selectedLocation}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[500px]">
                      {locations.length === 0 && !locationsLoading ? (
                        <DropdownMenuItem disabled className="text-gray-500">
                          No locations available
                        </DropdownMenuItem>
                      ) : (
                        locations.map((location) => (
                          <DropdownMenuItem
                            key={location.id}
                            onClick={() => handleLocationSelect(location)}
                            className="cursor-pointer"
                          >
                            {location.address}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Date Calendar Dropdown */}
                <div className="w-[250px]">
                  <CalendarDropdown open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <CalendarDropdownTrigger asChild>
                      <button className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-6 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C]">
                        <img src={calendarIcon} alt="Date" className="h-5 w-5" />
                        <span className={!selectedDate ? 'text-gray-500' : 'text-black'}>
                          {formatDateForDisplay(selectedDate)}
                        </span>
                      </button>
                    </CalendarDropdownTrigger>
                    <CalendarDropdownContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                        autoFocus
                        className="rounded-md border border-[#DADADA] bg-white shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)]"
                        classNames={{
                          day_selected:
                            'bg-[#00AD0C] text-white hover:bg-[#00AD0C] hover:text-white focus:bg-[#00AD0C] focus:text-white',
                          day_today: 'bg-[#E9FFEA] text-[#00AD0C] font-semibold',
                          day: 'hover:bg-[#E9FFEA] hover:text-[#00AD0C] focus:bg-[#E9FFEA] focus:text-[#00AD0C]',
                          button_previous: 'hover:bg-[#E9FFEA] hover:text-[#00AD0C]',
                          button_next: 'hover:bg-[#E9FFEA] hover:text-[#00AD0C]',
                        }}
                      />
                    </CalendarDropdownContent>
                  </CalendarDropdown>
                </div>

                {/* Time Dropdown */}
                <div className="w-[220px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-6 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C]">
                        <img src={clockIcon} alt="Time" className="h-5 w-5" />
                        <span className={selectedTime === 'Time' ? 'text-gray-500' : 'text-black'}>
                          {selectedTime}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[220px]">
                      {defaultTimes.map((time) => (
                        <DropdownMenuItem
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className="cursor-pointer"
                        >
                          {time}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Guests Selector */}
                <div className="flex h-[56px] w-[300px] items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-6 py-4">
                  <img src={peopleIcon} alt="Guests" className="h-5 w-5" />
                  <span className="flex-1 text-black">Guests</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="flex h-8 w-10 items-center justify-center rounded-lg border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-[#E9FFEA]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">
                        -
                      </span>
                    </button>
                    <span className="min-w-[20px] text-center font-medium text-black">
                      {guestCount}
                    </span>
                    <button
                      onClick={() => setGuestCount(guestCount + 1)}
                      className="flex h-8 w-10 items-center justify-center rounded-lg border border-[#00AD0C] bg-white text-[#00AD0C] hover:bg-[#E9FFEA]"
                    >
                      <span className="flex h-6 w-6 items-center justify-center text-xl font-medium">
                        +
                      </span>
                    </button>
                  </div>
                </div>

                {/* Find a Table Button */}
                <Button
                  size="extra-large"
                  className="w-[300px] font-bold text-white"
                  onClick={handleFindTable}
                  disabled={tablesLoading}
                >
                  {tablesLoading ? 'Searching...' : 'Find a Table'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section className="px-6 pb-10 md:px-12">
          <div className="mb-6">
            <h2 className="text-[16px] text-[#232323]">
              {tablesLoading ? 'Searching for tables...' : `${tables.length} tables available`}
            </h2>
          </div>

          {tablesLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-gray-500">Loading available tables...</div>
            </div>
          ) : tables.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-gray-500">No tables available for the selected criteria.</div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8">
              {tables.map((table, index) => (
                <TableCard
                  key={`${table.locationId}-${table.tableNumber}-${index}`}
                  table={table}
                  selectedDate={selectedDate!}
                  initialGuestCount={guestCount}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
export default BookPage;
