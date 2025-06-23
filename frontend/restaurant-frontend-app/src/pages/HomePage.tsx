import { Link } from 'react-router-dom';
import mainBannerImage from '../assets/images/main-banner-image.png';
import DishList from '../components/dish/DishList';
import LocationList from '../components/location/LocationList';

const HomePage = () => {
  return (
    <div>
      <section className='pb-10'>
        <div
          className='relative h-[440px] bg-cover bg-center bg-no-repeat p-6 md:p-12'
          style={{
            backgroundImage: `url(${mainBannerImage})`,
          }}
        >
          <div className='absolute inset-0 bg-black bg-opacity-30'></div>
          <div className='relative z-10 w-[339px]'>
            <div className='flex flex-col gap-10'>
              <h1 className='hidden text-5xl font-medium leading-[48px] text-[#00AD0C] lg:block'>Green & Tasty</h1>
              <div className='flex flex-col gap-4'>
                <p className='text-sm leading-6 text-white'>
                  A network of restaurants in Tbilisi, Georgia, offering fresh, locally sourced
                  dishes with a focus on health and sustainability.
                </p>
                <p className='text-sm leading-6 text-white'>
                  Our diverse menu includes vegetarian and vegan options, crafted to highlight the
                  rich flavors of Georgian cuisine with a modern twist.
                </p>
              </div>
              <Link
                to='/menu'
                className='flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-[#00AD0C] text-sm font-bold text-white transition duration-300 ease-in-out hover:bg-[#008209] active:bg-[#006907]'
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Dishes  */}
      <section className='px-6 pt-6 md:px-12'>
        <span className='text-2xl font-medium text-black'>Most Popular Dishes</span>
        <div className='container mx-auto px-6'>
          <DishList />
        </div>
      </section>

      {/* Locations  */}
      <section className='px-6 pt-16 md:px-12'>
        <span className='text-2xl font-medium text-black'>Locations</span>
        <div className='container mx-auto px-6'>
          <LocationList />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
