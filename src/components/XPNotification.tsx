import { motion } from "motion/react";
import { Sparkles, TrendingUp, Star } from "lucide-react";

interface XPNotificationProps {
  xpGained: number;
  source: string;
  multiplier?: number;
  show: boolean;
}

export function XPNotification({ xpGained, source, multiplier, show }: XPNotificationProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="fixed top-20 right-4 z-50 pointer-events-none"
    >
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-2xl border border-blue-400 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">+{xpGained} XP</span>
            {multiplier && multiplier > 1 && (
              <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">
                {multiplier}x
              </span>
            )}
          </div>
          <p className="text-xs text-white/90">{source}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface LevelUpNotificationProps {
  level: number;
  title: string;
  show: boolean;
}

export function LevelUpNotification({ level, title, show }: LevelUpNotificationProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Level up card */}
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="relative bg-gradient-to-br from-blue-900 to-cyan-900 p-8 rounded-2xl shadow-2xl border-2 border-yellow-400"
      >
        {/* Sparkles animation */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: '100%',
                opacity: 0 
              }}
              animate={{ 
                y: '-100%',
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        <div className="relative text-center">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
          >
            <Star className="w-12 h-12 text-white fill-white" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white mb-2">Level Up!</h2>
          <p className="text-2xl text-yellow-400 mb-1">Level {level}</p>
          <p className="text-lg text-white/80">{title}</p>
          
          <div className="mt-6 flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/70">New perks unlocked!</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
