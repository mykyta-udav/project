import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'rating-high' | 'rating-low' | 'newest' | 'oldest';

interface SortDropdownProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

const sortOptions = [
  { value: 'rating-high' as SortOption, label: 'Top rated first' },
  { value: 'rating-low' as SortOption, label: 'Low rated first' },
  { value: 'newest' as SortOption, label: 'Newest first' },
  { value: 'oldest' as SortOption, label: 'Oldest first' },
];

const SortDropdown = ({ value, onValueChange }: SortDropdownProps) => {
  const currentOption = sortOptions.find(option => option.value === value);

  return (
    <div className="flex items-center gap-2">
      <span 
        className="text-sm font-medium"
        style={{ color: '#232323', fontSize: '14px' }}
      >
        Sort by:
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-[180px] h-8 px-6 py-4 rounded-lg bg-white border border-[#DADADA] hover:shadow-[0px_0px_8px_0px_rgba(0,173,12,0.20)] focus:border-[#00AD0C] flex items-center justify-between text-sm outline-none">
          <span className="text-[#00AD0C] font-bold">{currentOption?.label || 'Select option'}</span>
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          {sortOptions.map((option) => (
            <DropdownMenuItem 
              key={option.value} 
              onClick={() => onValueChange(option.value)}
              className={`border-0 ${value === option.value ? 'bg-white font-bold' : 'font-normal'}`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortDropdown; 