import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-[60vh]">
      <div className="w-20 h-20 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
        <SearchIcon className="w-10 h-10 text-gray-900" />
      </div>
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Search</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Search functionality is coming soon. You'll be able to find past memories and posts here.
      </p>
    </div>
  );
}
