'use client';

import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'
    : 'flex flex-col items-center justify-center py-4';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center">
        <Loader2 className={`${sizeMap[size]} text-yellow-500 animate-spin`} />
        {text && <p className="mt-2 text-sm text-gray-300">{text}</p>}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  retry?: () => void;
}

export function ErrorState({ message = '오류가 발생했습니다', retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#111111] rounded-lg border border-[#222222]">
      <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
      <p className="text-gray-300 text-center mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-gray-200 rounded-md text-sm transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = '데이터가 없습니다', icon: Icon, action }: { 
  message: string; 
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const IconComponent = Icon || AlertCircle;
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#111111] rounded-lg border border-[#222222]">
      <IconComponent className="w-10 h-10 text-gray-500 mb-2" />
      <p className="text-gray-400 text-center mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-gray-200 rounded-md text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
