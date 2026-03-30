import { useState } from 'react';
import { db, auth, setDoc, doc, updateDoc, collection, query, where, getDocs, serverTimestamp } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, ArrowRight } from 'lucide-react';

interface FamilySetupProps {
  onFamilyJoined: (id: string) => void;
}

export default function FamilySetup({ onFamilyJoined }: FamilySetupProps) {
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const familyId = Math.random().toString(36).substring(2, 12);
      const code = generateInviteCode();
      const familyData = {
        id: familyId,
        name: familyName,
        inviteCode: code,
        ownerId: auth.currentUser?.uid,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'families', familyId), familyData);
      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        familyId: familyId,
        role: 'admin'
      });
      onFamilyJoined(familyId);
    } catch (err) {
      console.error("Error creating family:", err);
      setError("Failed to create family. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'families'), where('inviteCode', '==', inviteCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid invite code. Please check and try again.");
        setLoading(false);
        return;
      }

      const familyDoc = querySnapshot.docs[0];
      const familyId = familyDoc.id;

      await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
        familyId: familyId,
        role: 'member'
      });
      onFamilyJoined(familyId);
    } catch (err) {
      console.error("Error joining family:", err);
      setError("Failed to join family. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <AnimatePresence mode="wait">
        {mode === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-display font-bold text-center text-gray-900 mb-8">Get Started</h2>
            <button
              onClick={() => setMode('create')}
              className="w-full p-6 glass rounded-[2rem] hover:bg-white/80 transition-all text-left flex items-center gap-5 group shadow-sm hover:shadow-xl border border-gray-200/50"
            >
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors text-rose-500">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Create a New Family</h3>
                <p className="text-sm text-gray-500 mt-1">Start a new private space for your family.</p>
              </div>
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full p-6 glass rounded-[2rem] hover:bg-white/80 transition-all text-left flex items-center gap-5 group shadow-sm hover:shadow-xl border border-gray-200/50"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-500">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Join an Existing Family</h3>
                <p className="text-sm text-gray-500 mt-1">Enter an invite code to join your family.</p>
              </div>
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={() => setMode('choice')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
              &larr; Back
            </button>
            <h2 className="text-4xl font-display font-bold text-gray-900">Create Family</h2>
            <div className="space-y-5 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-400 uppercase tracking-widest">Family Name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g. The Smiths"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-lg"
                />
              </div>
              <button
                onClick={handleCreateFamily}
                disabled={loading || !familyName.trim()}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? "Creating..." : "Create Family"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={() => setMode('choice')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 font-medium">
              &larr; Back
            </button>
            <h2 className="text-4xl font-display font-bold text-gray-900">Join Family</h2>
            <div className="space-y-5 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-400 uppercase tracking-widest">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase tracking-[0.2em] text-center text-2xl font-bold transition-all"
                />
              </div>
              <button
                onClick={handleJoinFamily}
                disabled={loading || inviteCode.length !== 6}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {loading ? "Joining..." : "Join Family"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-red-600 text-sm text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
