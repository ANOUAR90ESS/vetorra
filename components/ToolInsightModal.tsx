import React, { useState, useEffect, useRef } from 'react';
import { Tool, Slide, TutorialSection } from '../types';
import { X, FileText, MonitorPlay, BookOpen, Loader2, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { generateToolSlides, generateToolTutorial } from '../services/geminiService';

interface ToolInsightModalProps {
  tool: Tool;
  initialTab?: 'summary' | 'slides' | 'tutorial';
  onClose: () => void;
}

const ToolInsightModal: React.FC<ToolInsightModalProps> = ({ tool, initialTab = 'summary', onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'slides' | 'tutorial'>(initialTab);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [tutorialContent, setTutorialContent] = useState<TutorialSection[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Initial Load
  useEffect(() => {
      if (!hasLoadedRef.current) {
          handleTabChange(initialTab);
          hasLoadedRef.current = true;
      }
  }, [initialTab]);

  const handleTabChange = async (tab: 'summary' | 'slides' | 'tutorial') => {
    setActiveTab(tab);
    if (tab === 'slides' && slides.length === 0) {
      setLoading(true);
      try {
        const generatedSlides = await generateToolSlides(tool);
        setSlides(generatedSlides);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else if (tab === 'tutorial' && tutorialContent.length === 0) {
      setLoading(true);
      try {
        const course = await generateToolTutorial(tool);
        setTutorialContent(course);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">AI Insights</span>
            {tool.name}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <button 
            onClick={() => handleTabChange('summary')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'summary' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <FileText className="w-4 h-4" /> Summary
          </button>
          <button 
            onClick={() => handleTabChange('slides')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'slides' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <MonitorPlay className="w-4 h-4" /> Slides
          </button>
          <button 
            onClick={() => handleTabChange('tutorial')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'tutorial' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <BookOpen className="w-4 h-4" /> Tutorial
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-zinc-900/50 custom-scrollbar">
           {activeTab === 'summary' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
               <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                 <h4 className="text-sm font-semibold text-zinc-400 uppercase mb-2">About the Tool</h4>
                 <p className="text-lg text-white leading-relaxed">{tool.description}</p>
                 
                 {tool.howToUse && (
                    <div className="mt-4 pt-4 border-t border-zinc-700/50">
                        <h5 className="text-xs font-bold text-indigo-400 uppercase mb-1">Quick Start</h5>
                        <p className="text-sm text-zinc-300">{tool.howToUse}</p>
                    </div>
                 )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-zinc-800/30 p-4 rounded-xl">
                   <h5 className="text-xs text-zinc-500 uppercase mb-1">Category</h5>
                   <p className="text-indigo-400 font-medium">{tool.category}</p>
                 </div>
                 <div className="bg-zinc-800/30 p-4 rounded-xl">
                   <h5 className="text-xs text-zinc-500 uppercase mb-1">Pricing</h5>
                   <p className="text-green-400 font-medium">{tool.price}</p>
                 </div>
               </div>

               {/* Detailed Features & Use Cases if available */}
               {(tool.features && tool.features.length > 0) && (
                   <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                       <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                           <Lightbulb className="w-4 h-4 text-yellow-500" /> Key Features
                       </h5>
                       <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {tool.features.map((feature, idx) => (
                               <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                   {feature}
                               </li>
                           ))}
                       </ul>
                   </div>
               )}

               {/* Pros & Cons Grid */}
               {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {tool.pros && tool.pros.length > 0 && (
                           <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-xl">
                               <h5 className="text-xs font-bold text-emerald-500 uppercase mb-2 flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> Pros
                               </h5>
                               <ul className="space-y-1">
                                   {tool.pros.map((pro, i) => (
                                       <li key={i} className="text-sm text-zinc-300">• {pro}</li>
                                   ))}
                               </ul>
                           </div>
                       )}
                       {tool.cons && tool.cons.length > 0 && (
                           <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                               <h5 className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                                   <XCircle className="w-3 h-3" /> Cons
                               </h5>
                               <ul className="space-y-1">
                                   {tool.cons.map((con, i) => (
                                       <li key={i} className="text-sm text-zinc-300">• {con}</li>
                                   ))}
                               </ul>
                           </div>
                       )}
                   </div>
               )}
             </div>
           )}

           {activeTab === 'slides' && (
             <div className="h-full flex flex-col">
               {loading ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                   Generating presentation...
                 </div>
               ) : (
                 <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                   {slides.map((slide, i) => (
                     <div key={i} className="bg-white text-black p-6 rounded-lg shadow-xl border border-zinc-200">
                       <h2 className="text-2xl font-bold mb-4 text-indigo-700">{slide.title}</h2>
                       <ul className="list-disc pl-5 space-y-2">
                         {slide.content.map((point, j) => (
                           <li key={j} className="text-lg text-zinc-800">{point}</li>
                         ))}
                       </ul>
                       <div className="mt-4 text-right text-xs text-zinc-400">Slide {i + 1}</div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

           {activeTab === 'tutorial' && (
             <div className="h-full flex flex-col">
               {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm">Generating illustrated tutorial...</p>
                    <p className="text-xs text-zinc-600">This may take a moment</p>
                  </div>
               ) : (
                  <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in">
                      <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                        <BookOpen className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-indigo-300">Quick-Start AI Tutorial</h4>
                            <p className="text-sm text-indigo-200/70">A visual guide to mastering {tool.name}.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        {tutorialContent.map((section, idx) => (
                            <div key={idx} className="bg-black/20 rounded-xl overflow-hidden border border-zinc-800">
                                <div className="h-48 w-full relative">
                                    <img src={section.imageUrl} alt={section.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                                        Step {idx + 1}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-white mb-2">{section.title}</h3>
                                    <p className="text-zinc-300 leading-relaxed text-sm">{section.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ToolInsightModal;