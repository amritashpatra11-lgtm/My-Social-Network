import React, { useState, useEffect, useRef } from 'react';
import { auth, db, doc, getDoc, collection, query, where, getDocs, updateDoc } from '../firebase';
import { LogOut, Copy, Share, Users, Edit2, Check, X } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { compressImage, uploadImageToImgBB } from '../lib/imageUtils';

export default function Profile({ familyId }: { familyId: string }) {
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(auth.currentUser?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(auth.currentUser?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFamilyAndMembers = async () => {
      if (!familyId) return;

      // Fetch family details
      const docRef = await getDoc(doc(db, 'families', familyId));
      if (docRef.exists()) {
        setFamily(docRef.data());
      }

      // Fetch family members
      const q = query(collection(db, 'users'), where('familyId', '==', familyId));
      const querySnapshot = await getDocs(q);
      const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersData);
    };
    fetchFamilyAndMembers();
  }, [familyId]);

  const handleShare = async () => {
    if (navigator.share && family) {
      try {
        await navigator.share({
          title: 'Join my FamilyCircle',
          text: `Join my family on FamilyCircle using invite code: ${family.inviteCode}`,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'Share canceled') {
          console.error('Error sharing:', err);
        }
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file, 400, 0.8);
      const hostedUrl = await uploadImageToImgBB(compressedBase64);
      setEditPhoto(hostedUrl);
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Failed to process image.");
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: editName,
        photoURL: editPhoto
      });
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: editName,
        photoURL: editPhoto
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto pb-20 sm:pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-gray-900">Profile</h2>
        <button onClick={() => auth.signOut()} className="p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={editPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || 'User')}&background=random`} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border border-gray-200 object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full border-2 border-white"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditName(auth.currentUser?.displayName || '');
                  setEditPhoto(auth.currentUser?.photoURL || '');
                }}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving || !editName.trim()}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? 'Saving...' : <><Check className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || 'User')}&background=random`} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border border-gray-200 object-cover" 
                referrerPolicy="no-referrer" 
              />
              <div>
                <h3 className="font-semibold text-xl text-gray-900">{auth.currentUser?.displayName}</h3>
                <p className="text-gray-500 text-sm">{auth.currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {family && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
          {copied && <p className="text-green-600 text-sm text-center font-medium mb-4">Invite code copied to clipboard!</p>}
        </div>
      )}

      {members.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-900" />
            <h4 className="font-semibold text-gray-900">Family Members ({members.length})</h4>
          </div>
          <div className="space-y-4">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <img 
                  src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName || 'User')}&background=random`} 
                  alt={member.displayName} 
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{member.displayName}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
