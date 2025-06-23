import moveRightIcon from '../../assets/icons/move-right.png';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // const handlePrevious = () => {
  //   if (currentPage > 1) {
  //     onPageChange(currentPage - 1);
  //   }
  // };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-6 mt-8">
      {/* Page Numbers */}
      <div className="flex items-center gap-4">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`text-sm font-medium transition-colors ${
                currentPage === pageNumber
                  ? 'text-[#00AD0C]'
                  : 'text-[#323A3A] hover:text-[#00AD0C]'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      
      {currentPage < totalPages && (
        <button
          onClick={handleNext}
          className="flex items-center justify-center transition-opacity hover:opacity-70"
        >
          <img
            src={moveRightIcon}
            alt="next page"
            className="w-4 h-4"
          />
        </button>
      )}
    </div>
  );
};

export default Pagination; 