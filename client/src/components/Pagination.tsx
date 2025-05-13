interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  darkMode: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, darkMode }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          darkMode 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
        } disabled:cursor-not-allowed`}
      >
        Précédent
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? darkMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-500 text-white'
              : darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          darkMode 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
        } disabled:cursor-not-allowed`}
      >
        Suivant
      </button>
    </div>
  );
}