import { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, doc, getDoc } from '../firebase';
import PostItem from './PostItem';
import CreatePost from './CreatePost';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, Info, Camera } from 'lucide-react';
import Stories from './Stories';

interface FeedProps {
  familyId: string;
}

export default function Feed({ familyId }: FeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      const familyDoc = await getDoc(doc(db, 'families', familyId));
      if (familyDoc.exists()) {
        setFamily(familyDoc.data());
      }
    };
    fetchFamily();

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

  const copyInviteCode = () => {
    if (family?.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-0 sm:space-y-6">
      <Stories familyMembers={[]} />

      <div className="bg-white sm:rounded-xl border-b sm:border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-display font-bold text-gray-900 truncate">{family?.name}</h2>
          <p className="text-xs text-gray-500 font-medium">Private family space</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invite Code</span>
            <span className="font-mono font-bold text-gray-900 text-sm">{family?.inviteCode}</span>
            <button
              onClick={copyInviteCode}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-600 shrink-0"
              title="Copy Invite Code"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <CreatePost familyId={familyId} />

      <div className="space-y-0 sm:space-y-6 pb-6">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
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
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white sm:rounded-xl border-y sm:border border-gray-200">
            <div className="w-20 h-20 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-gray-900" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Share your first photo or update with your family. Only members of {family?.name} will see what you share.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
