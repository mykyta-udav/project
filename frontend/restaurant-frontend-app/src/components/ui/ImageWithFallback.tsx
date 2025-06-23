import React from 'react';
import { useImageWithFallback, type ImageType } from '@/utils/imageUtils';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  imageType: ImageType;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}

/**
 * Component that automatically falls back to mock images when server images fail to load
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  imageType, 
  className = '', 
  style,
  onError 
}) => {
  const { imageSrc, hasError } = useImageWithFallback(src, imageType);

  // Call onError callback if provided when image fails
  React.useEffect(() => {
    if (hasError && onError) {
      onError();
    }
  }, [hasError, onError]);

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      style={style}
    />
  );
};

export default ImageWithFallback; 