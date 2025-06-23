import React, { useState } from 'react';
import Pagination from '../review/Pagination';
import { FeedbackType, type Feedback } from '@/types/feedback';

/**
 * Demo component to test pagination functionality independently
 */
const PaginationTestDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Mock data to test pagination
  const mockItems: Feedback[] = Array.from({ length: 10 }, (_, index) => ({
    id: `test-${index + 1}`,
    rate: String(Math.floor(Math.random() * 5) + 1),
    comment: `This is test review #${index + 1} to verify pagination is working correctly.`,
    userName: `Test User ${index + 1}`,
    userAvatarUrl: '/api/placeholder/60/60',
    date: new Date(2024, 0, index + 1).toISOString(),
    type: FeedbackType.SERVICE_QUALITY,
    locationId: 'test-location'
  }));

  const totalPages = Math.ceil(mockItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = mockItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900">Pagination Test Demo</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Test Data:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Total Items:</strong> {mockItems.length}</p>
          <p><strong>Items Per Page:</strong> {itemsPerPage}</p>
          <p><strong>Total Pages:</strong> {totalPages}</p>
          <p><strong>Current Page:</strong> {currentPage}</p>
          <p><strong>Should Show Pagination:</strong> {totalPages > 1 ? 'YES' : 'NO'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Current Page Items:</h3>
        <div className="grid gap-4">
          {paginatedItems.map((item, index) => (
            <div key={item.id} className="border rounded p-3 bg-gray-50">
              <div className="font-medium">Review #{startIndex + index + 1}</div>
              <div className="text-sm text-gray-600">{item.comment}</div>
              <div className="text-xs text-gray-500 mt-1">By: {item.userName}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Pagination Component:</h3>
        
        {totalPages > 1 ? (
          <div className="space-y-4">
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Pagination should be visible below
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ❌ No pagination - not enough items
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Use This Test:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Check that "Should Show Pagination" shows "YES"</li>
          <li>Verify the pagination component appears below</li>
          <li>Click on page numbers to test navigation</li>
          <li>Check that the content changes when you switch pages</li>
          <li>Look at the browser console for debug logs</li>
        </ol>
      </div>
    </div>
  );
};

export default PaginationTestDemo; 