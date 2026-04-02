import React, { useMemo } from 'react';
import { IoChevronBack, IoChevronForward, IoEllipsisHorizontal } from 'react-icons/io5';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  siblingCount = 1 // How many numbers to show around current page
}) => {
  
  // --- Smart Pagination Logic ---
  const paginationRange = useMemo(() => {
    // 1. If total pages is small (e.g. 5), show all
    const totalPageNumbers = siblingCount + 5;
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots (e.g. 1 2 3 4 5 ... 100)
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, 'DOTS', totalPages];
    }

    // Case 3: No right dots, but left dots (e.g. 1 ... 96 97 98 99 100)
    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, 'DOTS', ...rightRange];
    }

    // Case 4: Both dots (e.g. 1 ... 4 5 6 ... 100)
    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
    }
  }, [totalPages, currentPage, siblingCount]);

  // Helper function to create array of numbers
  function range(start, end) {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  }

  if (currentPage === 0 || totalPages < 2) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-100 mt-8">
      
      {/* --- Mobile View (Simple) --- */}
      <div className="flex sm:hidden items-center justify-between w-full">
         <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IoChevronBack className="mr-1" /> Previous
        </button>
        <span className="text-sm text-slate-600 font-medium">
           Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <IoChevronForward className="ml-1" />
        </button>
      </div>

      {/* --- Desktop View (Advanced) --- */}
      
      {/* Info Text (Desktop Left) */}
      <div className="hidden sm:flex items-center text-sm text-slate-500">
        Showing page <span className="font-semibold text-slate-900 mx-1">{currentPage}</span> of <span className="font-semibold text-slate-900 mx-1">{totalPages}</span>
      </div>

      {/* Controls (Desktop Right) */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Previous Button */}
        <button
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <IoChevronBack size={18} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === 'DOTS') {
              return (
                <span key={`dots-${index}`} className="px-2 py-1 text-slate-400">
                  <IoEllipsisHorizontal />
                </span>
              );
            }

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  min-w-[36px] h-9 px-3 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${currentPage === pageNumber
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-105' 
                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border border-transparent'}
                `}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <IoChevronForward size={18} />
        </button>
      </div>

    </div>
  );
};

export default Pagination;