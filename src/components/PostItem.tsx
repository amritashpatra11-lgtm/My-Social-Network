import React, { useState, useEffect } from 'react';
import { db, auth, doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc } from '../firebase';
import { Heart, MessageCircle, Send, Trash2, MoreHorizontal, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PostItemProps {
  post: any;
}

export default function PostItem({ post }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.likes?.includes(auth.currentUser?.uid));
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (showComments) {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', post.id),
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(uid) });
      setIsLiked(false);
    } else {
      await updateDoc(postRef, { likes: arrayUnion(uid) });
      setIsLiked(true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        postId: post.id,
        text: newComment,
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Family Member',
        authorPhoto: auth.currentUser?.photoURL || null,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', post.id));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const isAuthor = post.authorId === auth.currentUser?.uid;

  return (
    <div className="bg-white sm:rounded-xl border-b sm:border border-gray-200 mb-2 sm:mb-6 w-full overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-rose-500 p-[2px]">
            <img
              src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || 'User')}&background=random`}
              alt={post.authorName}
              className="w-full h-full rounded-full border-2 border-white object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-900 text-sm">{post.authorName}</h4>
            <p className="text-[11px] text-gray-500">
              {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now'}
            </p>
          </div>
        </div>
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-900"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        handleDeletePost();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full bg-gray-100 aspect-square sm:aspect-auto sm:max-h-[600px] border-y sm:border-y-0 border-gray-200">
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-900 hover:text-gray-600'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-gray-900 hover:text-gray-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="text-gray-900 hover:text-gray-600 transition-colors" onClick={() => alert("Direct messaging coming soon!")}>
            <Send className="w-6 h-6" />
          </button>
        </div>
        <button className="text-gray-900 hover:text-gray-600 transition-colors" onClick={() => alert("Save post coming soon!")}>
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-3 pb-2">
        <span className="text-sm font-semibold text-gray-900 block mb-1">
          {post.likes?.length || 0} likes
        </span>
        {post.text && (
          <div className="text-sm text-gray-900">
            <span className="font-semibold mr-2">{post.authorName}</span>
            <span>{post.text}</span>
          </div>
        )}
      </div>

      {/* Comments Preview */}
      <div className="px-3 pb-3">
        {comments.length > 0 && (
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            View all {comments.length} comments
          </button>
        )}
        
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2 pb-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <span className="font-semibold text-gray-900">{comment.authorName}</span>
                    <span className="text-gray-900">{comment.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAddComment} className="flex gap-2 mt-2 items-center">
          <img
            src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || 'User')}&background=random`}
            alt="You"
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none placeholder-gray-500 bg-transparent"
          />
          {newComment.trim() && (
            <button
              type="submit"
              className="text-blue-500 font-semibold text-sm hover:text-blue-600"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
