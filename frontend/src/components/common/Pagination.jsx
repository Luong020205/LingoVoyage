export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 bg-white px-6 py-3 rounded-full shadow-sm w-fit mx-auto border border-gray-100">
      
      {/* Prev Button */}
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ‹
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
            currentPage === page 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        ›
      </button>
    </div>
  );
}
