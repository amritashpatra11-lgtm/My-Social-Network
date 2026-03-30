import { auth, googleProvider, signInWithPopup } from '../firebase';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dynamic flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-white/20 mix-blend-overlay pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 glass p-10 md:p-16 rounded-[3rem] max-w-lg w-full mx-4 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 20 }}
          className="w-24 h-24 bg-white/50 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl backdrop-blur-md border border-white/60 rotate-3"
        >
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
        </motion.div>

        <h1 className="text-5xl font-display font-bold mb-4 text-gray-900 tracking-tight">FamilyCircle</h1>
        <p className="text-lg text-gray-800 mb-10 font-medium leading-relaxed">
          A private, beautifully crafted space for your family to share moments and memories.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-white/90 hover:bg-white text-gray-900 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg border border-white/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
          Continue with Google
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 z-10 text-gray-800/90 font-medium tracking-wide text-sm flex items-center gap-2"
      >
        Crafted with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" /> by Amritash
      </motion.div>
    </div>
  );
}
