import React from 'react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

/**
 * Demo component showing how the ImageWithFallback system works
 * This component demonstrates both working and failing image URLs
 */
const ImageFallbackDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Image Fallback Demo</h2>
      
      {/* Working server image */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Working Server Image:</h3>
        <div className="w-64 h-64 border rounded-lg overflow-hidden">
          <ImageWithFallback
            src="https://picsum.photos/256/256"
            alt="Working server image"
            imageType="dish"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">This should show the actual server image</p>
      </div>

      {/* Failing server image - will use mock */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Failing Server Image (Uses Mock):</h3>
        <div className="w-64 h-64 border rounded-lg overflow-hidden">
          <ImageWithFallback
            src="https://invalid-url-that-will-fail.com/image.jpg"
            alt="Failed server image"
            imageType="dish"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">This should show the mock dish image</p>
      </div>

      {/* No URL provided - uses mock */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No URL Provided (Uses Mock):</h3>
        <div className="w-64 h-64 border rounded-lg overflow-hidden">
          <ImageWithFallback
            src={undefined}
            alt="No URL provided"
            imageType="location"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">This should show the mock location image</p>
      </div>

      {/* Avatar example */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Avatar Example (Mock Fallback):</h3>
        <div className="w-16 h-16 border rounded-full overflow-hidden">
          <ImageWithFallback
            src="https://another-invalid-url.com/avatar.jpg"
            alt="User avatar"
            imageType="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">This should show the mock avatar image</p>
      </div>

      {/* Usage instructions */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Usage Instructions:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1.</strong> Import the component: <code className="bg-gray-200 px-1 rounded">import ImageWithFallback from '@/components/ui/ImageWithFallback';</code></p>
          <p><strong>2.</strong> Use it instead of regular img tags:</p>
          <pre className="bg-gray-200 p-2 rounded mt-1 text-xs overflow-x-auto">
{`<ImageWithFallback
  src={imageUrl}
  alt="Description"
  imageType="dish" // or "location" or "avatar"
  className="w-full h-full object-cover"
/>`}
          </pre>
          <p><strong>3.</strong> The component will automatically:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Try to load the server image first</li>
            <li>Fall back to the appropriate mock image if the server image fails</li>
            <li>Use mock images immediately if no URL is provided</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageFallbackDemo; 