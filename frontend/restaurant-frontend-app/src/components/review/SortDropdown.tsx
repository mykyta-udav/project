import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  return (
    <div className="flex items-center gap-2">
      <span 
        className="text-sm font-medium"
        style={{ color: '#232323', fontSize: '14px' }}
      >
        Sort by:
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px] h-8 text-sm border-gray-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown; 