import React, { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot } from '../firebase';
import { Search as SearchIcon, X } from 'lucide-react';
import PostItem from './PostItem';
import { motion, AnimatePresence } from 'motion/react';

interface SearchProps {
  familyId: string;
}

export default function Search({ familyId }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    const q = query(
      collection(db, 'posts'),
      where('familyId', '==', familyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const filteredPosts = posts.filter(post => {
    const queryLower = searchQuery.toLowerCase();
    return (
      post.text?.toLowerCase().includes(queryLower) ||
      post.authorName?.toLowerCase().includes(queryLower)
    );
  });

  return (
    <div className="pb-20 sm:pb-6">
      <div className="sticky top-14 z-40 bg-white border-b border-gray-200 p-4">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-colors"
            placeholder="Search posts or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-4 space-y-0 sm:space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : searchQuery ? (
          filteredPosts.length > 0 ? (
            <AnimatePresence initial={false}>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <PostItem post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">No posts found matching "{searchQuery}"</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-[50vh]">
            <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4 bg-gray-50">
              <SearchIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Search Your Family</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Find past memories, photos, and updates from your family members.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
