import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadWidgetProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const UploadWidget: React.FC<UploadWidgetProps> = ({
  onFileSelect,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className={`
        w-full max-w-5xl mx-auto h-[320px]
        rounded-[24px] border border-dashed transition-all duration-300
        flex flex-col items-center justify-center cursor-pointer
        group relative overflow-hidden bg-white/40
        ${isDragging ? 'border-primary bg-indigo-50/30' : 'border-gray-300 hover:border-primary/40 hover:bg-gray-50/50'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".pdf,.xlsx,.xls"
      />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-5">
        {/* Icon container - Scaled down */}
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500
          ${isDragging ? 'bg-white scale-110' : 'bg-gray-50 group-hover:bg-white group-hover:shadow-sm'}
        `}>
          <UploadCloud 
            size={32} 
            strokeWidth={1.25} 
            className={`transition-colors duration-300 ${isDragging ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} 
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-900 tracking-tight">
            Drag & drop PDF
          </h3>
          <p className="text-gray-400 text-xs font-normal">
            or click to browse
          </p>
        </div>

        <div className="pt-2">
          <p className="text-[9px] text-gray-300 uppercase tracking-widest font-semibold">
            Supported: Quarterly Financial PDFs
          </p>
        </div>
      </div>
    </div>
  );
};
