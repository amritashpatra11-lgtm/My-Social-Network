import { auth } from '../firebase';
import { Plus } from 'lucide-react';

interface StoriesProps {
  familyMembers: any[];
}

export default function Stories({ familyMembers }: StoriesProps) {
  return (
    <div className="bg-white border-b sm:border border-gray-200 py-4 px-0 sm:rounded-xl">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
        {/* Your Story */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
          <div className="relative w-16 h-16 rounded-full border border-gray-200 p-0.5">
            <img 
              src={auth.currentUser?.photoURL || ''} 
              alt="Your Moment"
              className="w-full h-full rounded-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-white w-5 h-5 flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Your Moment</span>
        </div>
      </div>
    </div>
  );
}
