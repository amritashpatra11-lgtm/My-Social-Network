import React, { useState, useEffect, useRef } from 'react';
import { db, auth, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from '../firebase';
import { Plus, X } from 'lucide-react';
import { compressImage, uploadImageToImgBB } from '../lib/imageUtils';
import { motion, AnimatePresence } from 'motion/react';

interface StoriesProps {
  familyId: string;
}

export default function Stories({ familyId }: StoriesProps) {
  const [stories, setStories] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingStory, setViewingStory] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!familyId) return;
    
    // Fetch stories from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const q = query(
      collection(db, 'stories'),
      where('familyId', '==', familyId),
      where('createdAt', '>=', yesterday),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [familyId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file, 1080, 0.8);
      const hostedUrl = await uploadImageToImgBB(compressedBase64);
      
      await addDoc(collection(db, 'stories'), {
        imageUrl: hostedUrl,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Family Member',
        authorPhoto: auth.currentUser?.photoURL || null,
        familyId,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error creating story:", err);
      alert("Failed to post story. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="bg-white border-b sm:border border-gray-200 py-4 px-0 sm:rounded-xl">
        <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className={`relative w-16 h-16 rounded-full border border-gray-200 p-0.5 ${isUploading ? 'opacity-50' : ''}`}>
              <img 
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || 'User')}&background=random`} 
                alt="Your Moment"
                className="w-full h-full rounded-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-white w-5 h-5 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">{isUploading ? 'Adding...' : 'Your Moment'}</span>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>

          {/* Render Stories */}
          {stories.map(story => (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
              onClick={() => setViewingStory(story)}
            >
              <div className="relative w-16 h-16 rounded-full border-2 border-rose-500 p-0.5">
                <img 
                  src={story.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.authorName || 'User')}&background=random`} 
                  alt={story.authorName}
                  className="w-full h-full rounded-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] text-gray-900 font-medium truncate w-16 text-center">
                {story.authorName.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-3">
                <img 
                  src={viewingStory.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingStory.authorName || 'User')}&background=random`} 
                  alt={viewingStory.authorName}
                  className="w-10 h-10 rounded-full border border-white/20 object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-white font-semibold text-sm">{viewingStory.authorName}</span>
              </div>
              <button onClick={() => setViewingStory(null)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img 
                src={viewingStory.imageUrl} 
                alt="Story" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
