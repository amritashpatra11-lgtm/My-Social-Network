import React, { useState, useRef } from 'react';
import { db, auth, collection, addDoc, serverTimestamp } from '../firebase';
import { Image, Send, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePostProps {
  familyId: string;
}

export default function CreatePost({ familyId }: CreatePostProps) {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        text,
        imageUrl: imageUrl.trim() || null,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Family Member',
        authorPhoto: auth.currentUser?.photoURL || null,
        familyId,
        createdAt: serverTimestamp(),
        likes: []
      });
      setText('');
      setImageUrl('');
      setShowImageInput(false);
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCameraError('Image is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setShowImageInput(true);
        setCameraError('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white sm:rounded-xl border-b sm:border border-gray-200 p-4 mb-2 sm:mb-6">
      <div className="flex gap-3">
        <img
          src={auth.currentUser?.photoURL || ''}
          alt={auth.currentUser?.displayName || ''}
          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          referrerPolicy="no-referrer"
        />
        <form onSubmit={handlePost} className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with the family..."
            className="w-full text-sm resize-none outline-none placeholder-gray-500 pt-2.5 bg-transparent"
            rows={2}
          />

          <AnimatePresence>
            {cameraError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-lg"
              >
                {cameraError}
              </motion.div>
            )}
            {showImageInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 mt-2"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL or capture photo..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setShowImageInput(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-[300px]">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-4">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`transition-colors flex items-center gap-1.5 text-sm font-medium p-1.5 sm:p-0 rounded-md ${showImageInput ? 'text-blue-500 bg-blue-50 sm:bg-transparent' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 sm:hover:bg-transparent'}`}
              >
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Photo</span>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={cameraInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="transition-colors flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 sm:hover:bg-transparent p-1.5 sm:p-0 rounded-md"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Camera</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || (!text.trim() && !imageUrl.trim())}
              className="bg-blue-500 text-white px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
