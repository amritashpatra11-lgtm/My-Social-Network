/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, FirebaseUser, doc, getDoc, setDoc } from './firebase';
import Auth from './components/Auth';
import FamilySetup from './components/FamilySetup';
import Feed from './components/Feed';
import Profile from './components/Profile';
import Search from './components/Search';
import Activity from './components/Activity';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Users, Home, Heart, Search as SearchIcon, PlusSquare, MessageCircle, Bookmark, Settings, Send } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'activity' | 'profile'>('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setFamilyId(userDoc.data().familyId || null);
          } else {
            // Create user doc if it doesn't exist
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              familyId: null,
              role: 'member'
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user profile.");
        }
      } else {
        setUser(null);
        setFamilyId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-rose-200 pb-16 sm:pb-0">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold tracking-tight text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>FamilyCircle</h1>
          </div>
          <div className="flex items-center gap-5">
            <button className="text-gray-900 hover:text-gray-600 transition-colors" onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <PlusSquare className="w-6 h-6" />
            </button>
            <button className={`transition-colors ${activeTab === 'activity' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setActiveTab('activity')}>
              <Heart className="w-6 h-6" />
            </button>
            <button className="text-gray-900 hover:text-gray-600 transition-colors" onClick={() => alert("Direct messaging coming soon!")}>
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto sm:py-6">
        <AnimatePresence mode="wait">
          {!familyId ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4"
            >
              <FamilySetup onFamilyJoined={setFamilyId} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {activeTab === 'home' && <Feed familyId={familyId} />}
              {activeTab === 'search' && <Search />}
              {activeTab === 'activity' && <Activity />}
              {activeTab === 'profile' && <Profile familyId={familyId} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {familyId && (
        <nav className="bg-white fixed bottom-0 w-full border-t border-gray-200 z-50 sm:hidden pb-safe">
          <div className="flex items-center justify-around h-12 px-2">
            <button className={`p-2 transition-colors ${activeTab === 'home' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`} onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} /></button>
            <button className={`p-2 transition-colors ${activeTab === 'search' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`} onClick={() => setActiveTab('search')}><SearchIcon className="w-6 h-6" /></button>
            <button className="p-2 text-gray-900 hover:text-gray-600 transition-colors" onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><PlusSquare className="w-6 h-6" /></button>
            <button className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`} onClick={() => setActiveTab('profile')}>
              <img
                src={user.photoURL || ''}
                alt={user.displayName || ''}
                className={`w-7 h-7 rounded-full border object-cover ${activeTab === 'profile' ? 'border-gray-900' : 'border-gray-200'}`}
                referrerPolicy="no-referrer"
              />
            </button>
          </div>
        </nav>
      )}

      {error && (
        <div className="fixed bottom-20 sm:bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50">
          <span className="font-medium">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors">&times;</button>
        </div>
      )}
    </div>
  );
}
