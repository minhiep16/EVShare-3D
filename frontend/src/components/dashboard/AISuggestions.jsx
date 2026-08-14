import React from 'react';
import Tilt3DCard from '../shared/Tilt3DCard';

const AISuggestions = ({ suggestions, onAIChatClick }) => {
  const getIconColorClass = (type) => {
    switch (type) {
      case 'WARNING': return 'text-amber-500';
      case 'SUCCESS': return 'text-blue-500';
      default: return 'text-brand-500';
    }
  };

  return (
    <Tilt3DCard className="h-full">
      <div className="bg-[#f4f4f8] rounded-2xl p-6 flex flex-col h-full transform-style-3d relative overflow-hidden shadow-sm border border-slate-200">
        {/* Glow effect in background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-5" style={{ transform: 'translateZ(20px)' }}>
          <span className="text-violet-500 animate-pulse">
            <i className="ph-fill ph-sparkle text-xl drop-shadow-sm"></i>
          </span>
          <h3 className="text-base font-semibold drop-shadow-sm">Gợi ý AI 🤖</h3>
        </div>
        
        <div className="space-y-3 flex-1" style={{ transform: 'translateZ(15px)' }}>
          {suggestions.map((s) => (
            <div 
              key={s.id} 
              className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-default"
            >
              <i className={`ph ${s.iconClass} ${getIconColorClass(s.type)} text-lg mt-0.5 shrink-0`}></i>
              <p className="text-sm text-slate-600 leading-snug">
                {s.content}
              </p>
            </div>
          ))}
        </div>
        
        <button 
          onClick={onAIChatClick}
          style={{ transform: 'translateZ(25px)' }}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-ink hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-lg hover:shadow-xl relative overflow-hidden group"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] skew-x-12"></div>
          
          <i className="ph ph-chat-teardrop-text"></i>
          Chat với AI
        </button>
      </div>
    </Tilt3DCard>
  );
};

export default AISuggestions;
