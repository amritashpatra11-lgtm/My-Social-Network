import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc } from '../firebase';
import { LogOut, Copy, Share, Settings } from 'lucide-react';

export default function Profile({ familyId }: { familyId: string }) {
  const [family, setFamily] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      const docRef = await getDoc(doc(db, 'families', familyId));
      if (docRef.exists()) {
        setFamily(docRef.data());
      }
    };
    fetchFamily();
  }, [familyId]);

  const handleShare = async () => {
    if (navigator.share && family) {
      try {
        await navigator.share({
          title: 'Join my FamilyCircle',
          text: `Join my family on FamilyCircle using invite code: ${family.inviteCode}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    if (family) {
      navigator.clipboard.writeText(family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto pb-20 sm:pb-4">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{auth.currentUser?.displayName}</h2>
        <button onClick={() => auth.signOut()} className="p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <img src={auth.currentUser?.photoURL || ''} alt="Profile" className="w-20 h-20 rounded-full border border-gray-200 object-cover" referrerPolicy="no-referrer" />
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{auth.currentUser?.displayName}</h3>
          <p className="text-gray-500">{auth.currentUser?.email}</p>
        </div>
      </div>

      {family && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-1">Family: {family.name}</h4>
          <p className="text-sm text-gray-500 mb-4">Private family space</p>
          
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mb-4 border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Invite Code</p>
              <p className="font-mono text-lg font-bold tracking-widest text-gray-900">{family.inviteCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                <Copy className="w-5 h-5 text-gray-700" />
              </button>
              <button onClick={handleShare} className="p-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
          {copied && <p className="text-green-600 text-sm text-center font-medium">Invite code copied to clipboard!</p>}
        </div>
      )}
    </div>
  );
}
