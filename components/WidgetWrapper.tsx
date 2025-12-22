
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface WidgetWrapperProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ title, children, footer }) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col overflow-hidden shadow-xl">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#30363d] bg-[#1c2128]">
        <h3 className="font-semibold text-sm text-gray-200 uppercase tracking-wider">{title}</h3>
        <button className="text-gray-500 hover:text-gray-300">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-2 border-t border-[#30363d] bg-[#0d1117]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default WidgetWrapper;
