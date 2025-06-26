import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mainBannerImage from '../assets/images/main-banner-image.png';
import DishGrid from '../components/dish/DishGrid';
import DishModal from '../components/dish/DishModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { dishesAPI } from '@/services/api';
import type {
  Dish as DishType,
  DetailedDish,
  DishType as DishTypeEnum,
  SortOption,
} from '@/types/dish';

const MenuPage = () => {
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [selectedDish, setSelectedDish] = useState<DetailedDish | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<DishTypeEnum | 'ALL'>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('price,asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dishesAPI.getDishes(
          filterType === 'ALL' ? undefined : filterType,
          sortOption
        );
        setDishes(data);
      } catch (err) {
        setError('Failed to load dishes');
        console.error('Error fetching dishes:', err);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [filterType, sortOption]);

  const handleDishClick = async (dish: DishType) => {
    if (dish.id) {
      try {
        const detailedDish = await dishesAPI.getDishById(dish.id);
        setSelectedDish(detailedDish);
        setIsModalOpen(true);
      } catch (err) {
        console.error('Error fetching dish details:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDish(null);
  };

  const handleFilterChange = (newFilter: DishTypeEnum | 'ALL') => {
    setFilterType(newFilter);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
  };

  const getSortDisplayText = (sort: SortOption) => {
    switch (sort) {
      case 'price,asc':
        return 'Low to High';
      case 'price,desc':
        return 'High to Low';
      case 'popularity,desc':
        return 'Most Popular';
      case 'popularity,asc':
        return 'Least Popular';
      default:
        return 'Low to High';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* navigation */}
      <div className='border-b border-gray-200 bg-white px-4 py-4 md:px-6 lg:px-12'>
        <nav className='text-sm text-gray-600'>
          <Link to='/' className='transition-colors hover:text-[#00AD0C]'>
            Main page
          </Link>
          <span className='mx-2'>&gt;</span>
          <span className='text-gray-900'>Menu</span>
        </nav>
      </div>

      {/* banner */}
      <section className='mt-8 pb-10'>
        <div
          className='relative h-[440px] bg-cover bg-center bg-no-repeat p-6 md:p-12'
          style={{
            backgroundImage: `url(${mainBannerImage})`,
          }}
        >
          <div className='absolute inset-0 bg-black bg-opacity-50'></div>
          <div className='relative z-10'>
            <div className='flex flex-col gap-[22px] pt-24'>
              <h2 className='text-2xl font-medium leading-[48px] text-[#00AD0C]'>
                Green & Tasty Restaurants
              </h2>
              <h1 className='text-5xl font-medium leading-[48px] text-[#00AD0C]'>Menu</h1>
            </div>
          </div>
        </div>
      </section>

      {/* filters and sorting */}
      <section className='px-4 py-6 md:px-6 lg:px-12'>
        <div className='mb-8'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
            {/* filters */}
            <div>
              <div className='flex flex-wrap gap-3'>
                <Button
                  onClick={() => handleFilterChange('ALL')}
                  variant={filterType === 'ALL' ? 'primary' : 'secondary'}
                  className={`h-8 w-[137px] ${
                    filterType === 'ALL' ? 'text-white' : 'text-[#00AD0C]'
                  }`}
                >
                  All Dishes
                </Button>
                <Button
                  onClick={() => handleFilterChange('APPETIZER')}
                  variant={filterType === 'APPETIZER' ? 'primary' : 'secondary'}
                  className={`h-8 w-[137px] ${
                    filterType === 'APPETIZER' ? 'text-white' : 'text-[#00AD0C]'
                  }`}
                >
                  Appetizers
                </Button>
                <Button
                  onClick={() => handleFilterChange('MAIN_COURSE')}
                  variant={filterType === 'MAIN_COURSE' ? 'primary' : 'secondary'}
                  className={`h-8 w-[137px] ${
                    filterType === 'MAIN_COURSE' ? 'text-white' : 'text-[#00AD0C]'
                  }`}
                >
                  Main Courses
                </Button>
                <Button
                  onClick={() => handleFilterChange('DESSERT')}
                  variant={filterType === 'DESSERT' ? 'primary' : 'secondary'}
                  className={`h-8 w-[137px] ${
                    filterType === 'DESSERT' ? 'text-white' : 'text-[#00AD0C]'
                  }`}
                >
                  Desserts
                </Button>
              </div>
            </div>

            {/* sort */}
            <div>
              <div className='flex flex-row items-center gap-4'>
                <span className='text-lg font-medium text-[#232323]'>Sort by</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='secondary'
                      className='h-10 w-[200px] justify-between text-gray-700'
                    >
                      {getSortDisplayText(sortOption)}
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-[200px]'>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange('price,asc')}
                      className='cursor-pointer'
                    >
                      Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange('price,desc')}
                      className='cursor-pointer'
                    >
                      High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange('popularity,desc')}
                      className='cursor-pointer'
                    >
                      Most Popular
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange('popularity,asc')}
                      className='cursor-pointer'
                    >
                      Least Popular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* dishes grid */}
      <section className='px-4 pb-12 md:px-6 lg:px-12'>
        <DishGrid
          dishes={dishes}
          onDishClick={handleDishClick}
          loading={loading}
          error={error}
          emptyMessage='No dishes found for the selected criteria.'
        />
      </section>

      {/* Modal */}
      <DishModal dish={selectedDish} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default MenuPage;
