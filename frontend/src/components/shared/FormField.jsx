import React from 'react';

const FormField = ({ label, children, className = "" }) => {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>}
      {children}
    </div>
  );
};

export const Input = (props) => (
  <input 
    {...props} 
    className={`w-full border-2 border-slate-200/60 rounded-xl text-sm px-4 py-3 bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all duration-200 placeholder:text-slate-400 font-medium text-slate-700 ${props.className || ''}`}
  />
);

export const Select = (props) => (
  <select 
    {...props} 
    className={`w-full border-2 border-slate-200/60 rounded-xl text-sm px-4 py-3 bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all duration-200 font-medium text-slate-700 ${props.className || ''}`}
  >
    {props.children}
  </select>
);

export const TextArea = (props) => (
  <textarea 
    {...props} 
    className={`w-full border-2 border-slate-200/60 rounded-xl text-sm px-4 py-3 bg-white focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all duration-200 min-h-[100px] custom-scrollbar placeholder:text-slate-400 font-medium text-slate-700 ${props.className || ''}`}
  />
);

export default FormField;
