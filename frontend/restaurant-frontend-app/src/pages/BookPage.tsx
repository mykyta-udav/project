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
import {
  DropdownMenu as TimeDropdown,
  DropdownMenuContent as TimeDropdownContent,
  DropdownMenuTrigger as TimeDropdownTrigger,
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
  { id: 'mock-4', address: '25 Chavchavadze Avenue' },
  { id: 'mock-5', address: '7 Pekini Street' },
  { id: 'springfield-1', address: '123 Main St, Springfield' },
  { id: 'springfield-2', address: '100 Main St, Springfield' },
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
  {
    locationId: 'mock-5',
    locationAddress: '7 Pekini Street',
    tableNumber: '1',
    capacity: '2',
    availableSlots: ['9:00 a.m. - 10:30 a.m', '11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '4:00 p.m. - 5:30 p.m'],
  },
  // Springfield locations (matching production)
  {
    locationId: 'springfield-1',
    locationAddress: '123 Main St, Springfield',
    tableNumber: '1',
    capacity: '2',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
  {
    locationId: 'springfield-1',
    locationAddress: '123 Main St, Springfield',
    tableNumber: '2',
    capacity: '4',
    availableSlots: ['11:00 a.m. - 12:30 p.m', '1:00 p.m. - 2:30 p.m', '3:00 p.m. - 4:30 p.m'],
  },
  {
    locationId: 'springfield-2',
    locationAddress: '100 Main St, Springfield',
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
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tables, setTables] = useState<BookingTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Generate time slots in 15-minute intervals
  const generateTimeSlots = () => {
    const times: string[] = [];
    const startHour = 10; // 10:00 AM
    const endHour = 22; // 10:00 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        
        times.push(`${displayHour}:${displayMinute} ${period}`);
      }
    }
    
    return times;
  };

  const defaultTimes = generateTimeSlots();

  // Convert 12-hour time format to 24-hour format for API
  const convertTo24HourFormat = (time12h: string): string => {
    try {
      const time = time12h.trim();
      const [timePart, period] = time.split(' ');
      const [hours, minutes] = timePart.split(':');
      
      let hour24 = parseInt(hours, 10);
      
      if (period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    } catch (error) {
      console.error('Error converting time format:', error);
      return time12h;
    }
  };

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
    setTimePickerOpen(false);
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
        time: convertTo24HourFormat(selectedTime),
        guests: guestCount.toString(),
      };

      try {
        const tableData = await bookingAPI.getAvailableTables(searchParams);
        
        // If API returns empty results, fall back to mock data for demo purposes
        if (tableData.length === 0) {
          console.log('API returned empty results, using mock data for demo');
          const filteredMockTables = mockTables.filter(
            (table) => table.locationAddress === selectedLocation
          );
          setTables(filteredMockTables);
        } else {
          setTables(tableData);
        }
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
              <div className="flex flex-wrap items-end justify-start gap-4 lg:gap-6">
                {/* Location Dropdown */}
                <div className="w-full sm:w-[320px] md:w-[400px] lg:w-[500px]">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-4 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C] disabled:cursor-not-allowed disabled:opacity-50 lg:px-6"
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
                    <DropdownMenuContent className="w-full sm:w-[320px] md:w-[400px] lg:w-[500px]">
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
                <div className="w-full sm:w-[200px] md:w-[220px] lg:w-[250px]">
                  <CalendarDropdown open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <CalendarDropdownTrigger asChild>
                      <button className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-4 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C] lg:px-6">
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

                {/* Time Picker */}
                <div className="w-full sm:w-[180px] md:w-[200px] lg:w-[220px]">
                  <TimeDropdown open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                    <TimeDropdownTrigger asChild>
                      <button className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-4 py-4 text-left hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C] lg:px-6">
                        <img src={clockIcon} alt="Time" className="h-5 w-5" />
                        <span className={selectedTime === 'Time' ? 'text-gray-500' : 'text-black'}>
                          {selectedTime}
                        </span>
                      </button>
                    </TimeDropdownTrigger>
                    <TimeDropdownContent className="w-[320px] p-4 sm:w-[400px]" align="start">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-900">Select Time</h3>
                        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto sm:grid-cols-4">
                          {defaultTimes.map((time) => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`w-20 h-10 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                selectedTime === time
                                  ? 'bg-[#00AD0C] text-white border-[#00AD0C]'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-[#E9FFEA] hover:border-[#00AD0C] hover:text-[#00AD0C]'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </TimeDropdownContent>
                  </TimeDropdown>
                </div>

                {/* Guests Selector */}
                <div className="flex h-[56px] w-full items-center gap-2 rounded-lg border border-[#DADADA] bg-white px-4 py-4 sm:w-[250px] md:w-[280px] lg:w-[300px] lg:px-6">
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
                  className="w-full font-bold text-white sm:w-[250px] md:w-[280px] lg:w-[300px]"
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
        <section className="px-4 pb-10 sm:px-6 md:px-8 lg:px-12">
          <div className="mb-6 mt-32 sm:mt-12 lg:mt-0">
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
            <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:flex-wrap lg:justify-center">
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
