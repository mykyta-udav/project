import type { Feedback } from '@/types/feedback';
import starIcon from '../../assets/icons/star-01.png';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface ReviewCardProps {
  feedback: Feedback;
}

const ReviewCard = ({ feedback }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <img
          key={i}
          src={starIcon}
          alt="star"
          className={`w-4 h-4 ${i < rating ? 'opacity-100' : 'opacity-30'}`}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const rating = parseInt(feedback.rate) || 1;

  return (
    <div className="w-[316px] h-[324px] bg-white rounded-3xl shadow-lg">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <ImageWithFallback
              src={feedback.userAvatarUrl}
              alt={feedback.userName}
              imageType="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* User info and rating */}
          <div className="flex-1">
            <div className="flex items-center mb-1 gap-1">
              <span className="text-sm font-medium text-[#232323]">
                {feedback.userName}
              </span>
              <div className="flex gap-[2px]">
                {renderStars(rating)}
              </div>
            </div>
            
            {/* Date */}
            <span className="text-xs text-[#898989]">
              {formatDate(feedback.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="px-6 pb-6 flex-1 flex items-center">
        <p className="text-sm text-[#232323] leading-relaxed text-left">
          {feedback.comment}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard; 