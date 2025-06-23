// Image fallback utility for handling server image failures
import { useState, useEffect } from 'react';

// Import mock images
import dishImageMock from '@/assets/mock-images/Dish picture.png';
import locationImageMock from '@/assets/mock-images/Picture.png';
import avatarImageMock from '@/assets/images/avatar.png';

export type ImageType = 'dish' | 'location' | 'avatar';

interface MockImageConfig {
  dish: string;
  location: string;
  avatar: string;
}

const MOCK_IMAGES: MockImageConfig = {
  dish: dishImageMock,
  location: locationImageMock,
  avatar: avatarImageMock,
};

/**
 * Hook to handle image loading with fallback to mock images
 * Returns the current image URL and error state
 */
export const useImageWithFallback = (
  originalImageUrl: string | undefined,
  imageType: ImageType
): { imageSrc: string; hasError: boolean } => {
  const [imageSrc, setImageSrc] = useState<string>(originalImageUrl || MOCK_IMAGES[imageType]);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    // If no original URL provided, use mock immediately
    if (!originalImageUrl) {
      setImageSrc(MOCK_IMAGES[imageType]);
      setHasError(false);
      return;
    }

    // Reset error state when URL changes
    setHasError(false);
    setImageSrc(originalImageUrl);

    // Test if the image URL is accessible
    const testImage = new Image();
    
    testImage.onload = () => {
      // Image loaded successfully
      setImageSrc(originalImageUrl);
      setHasError(false);
    };
    
    testImage.onerror = () => {
      // Image failed to load, use mock
      setImageSrc(MOCK_IMAGES[imageType]);
      setHasError(true);
    };
    
    testImage.src = originalImageUrl;
    
    // Cleanup function
    return () => {
      testImage.onload = null;
      testImage.onerror = null;
    };
  }, [originalImageUrl, imageType]);

  return { imageSrc, hasError };
};

/**
 * Get appropriate mock image for a given type
 */
export const getMockImage = (imageType: ImageType): string => {
  return MOCK_IMAGES[imageType];
};

/**
 * Check if a URL is likely to be a server image URL vs a local/mock image
 */
export const isServerImageUrl = (url: string): boolean => {
  return url.startsWith('http') || url.startsWith('/api/');
};

/**
 * Get fallback image URL for immediate use (without React hook)
 */
export const getImageWithFallback = (
  originalImageUrl: string | undefined,
  imageType: ImageType
): string => {
  if (!originalImageUrl || !isServerImageUrl(originalImageUrl)) {
    return originalImageUrl || MOCK_IMAGES[imageType];
  }
  
  // For server URLs, return the original URL but components should use useImageWithFallback for proper error handling
  return originalImageUrl;
}; 