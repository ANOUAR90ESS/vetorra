import React, { useState } from 'react';
import { ExternalLink, Tag, Sparkles, BookOpen, Lock } from 'lucide-react';
import { Tool, UserProfile } from '../types';
import ToolInsightModal from './ToolInsightModal';

interface ToolCardProps {
  tool: Tool;
  user: UserProfile | null;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [initialTab, setInitialTab] = useState<'summary' | 'slides' | 'tutorial'>('summary');
  const [limitError, setLimitError] = useState('');
  
  // Safety check for tags and slice for display
  const tags = tool.tags || [];
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - 3;

  const checkPlanAndLimit = (tab: 'slides' | 'tutorial'): boolean => {
      // 1. Check Plan Access
      if (!user || user.plan === 'free') {
          alert("🚀 Unlock AI-Powered Learning!\n\n✨ Generate instant AI courses, slides, and step-by-step tutorials\n📚 Learn any tool in minutes with personalized content\n🎯 Available on Starter ($9/mo) and Pro ($19/mo) plans\n\n💡 Upgrade now and transform how you learn!");
          return false;
      }

      // 2. Check 24h Limits (Simulated for Demo)
      const limit = user.plan === 'starter' ? 5 : 10;
      const today = new Date().toISOString().split('T')[0]; // Simple daily key
      const storageKey = `vetorre_usage_${user.id}_${today}`;
      
      const currentUsage = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      if (currentUsage >= limit) {
          alert(`⏰ Daily Limit Reached!\n\n📊 You've used all ${limit} AI generations today\n🚀 Pro users get ${user.plan === 'starter' ? '2x more (10/day)' : 'unlimited'} generations\n⭐ Upgrade to Pro for just $19/mo and never hit limits again!\n\n✨ Your learning journey shouldn't have limits!`);
          return false;
      }

      // Increment Usage (Ideally this happens after successful gen, but pre-check here for UI)
      localStorage.setItem(storageKey, (currentUsage + 1).toString());
      return true;
  };

  const openModal = (tab: 'summary' | 'slides' | 'tutorial') => {
      if (tab === 'slides' || tab === 'tutorial') {
          if (!checkPlanAndLimit(tab)) return;
      }
      
      setInitialTab(tab);
      setShowModal(true);
  };

  const isLocked = !user || user.plan === 'free';

  return (
    <>
      <div className="group relative bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-indigo-900/20 flex flex-col h-full">
        <div className="relative aspect-video overflow-hidden bg-zinc-950">
          <img 
            src={tool.imageUrl} 
            alt={tool.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white border border-white/10 shadow-sm">
            {tool.price}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
             <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
               {tool.category}
             </div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">{tool.name}</h3>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">{tool.description}</p>
          
          {/* Improved Tag Display */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[26px]">
            {displayTags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="flex items-center gap-1 text-[10px] font-medium bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700/50 group-hover:border-zinc-600 transition-colors">
                <Tag className="w-3 h-3 text-zinc-500" /> {tag}
              </span>
            ))}
            {remainingTags > 0 && (
               <span className="flex items-center justify-center text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700/50" title={`+${remainingTags} more tags`}>
                 +{remainingTags}
               </span>
            )}
          </div>
          
          <div className="mt-auto flex gap-2">
            <button
               onClick={() => openModal('slides')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all shadow-lg ${
                   isLocked 
                   ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                   : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
               }`}
               title={isLocked ? "Upgrade to generate slides" : "Generate Explainer Slides"}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />} 
              Explain
            </button>
            <button
               onClick={() => openModal('tutorial')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                   isLocked
                   ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
                   : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
               }`}
               title={isLocked ? "Upgrade to generate tutorials" : "Generate AI Tutorial"}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
              Generate Tutorial
            </button>
            <a 
              href={tool.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded-lg text-xs font-medium transition-all"
              title="Visit Website"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
      
      {showModal && <ToolInsightModal tool={tool} initialTab={initialTab} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default ToolCard;