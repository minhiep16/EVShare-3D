import React from 'react';

const BaseModal = ({ title, onClose, children, maxWidth = "max-w-md" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop with Animation */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal Box */}
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-slate-100`}>
        <div className="p-5 border-b border-slate-100/80 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <i className="ph ph-x text-lg"></i>
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
