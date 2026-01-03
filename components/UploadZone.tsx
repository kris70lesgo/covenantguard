
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`w-full py-20 bg-slate-50 border border-slate-200 transition-all flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50/10' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        className="hidden" 
        accept=".pdf,.xlsx,.xls" 
        onChange={handleFile}
      />
      <div className="text-slate-400 mb-4">
        <Upload size={32} strokeWidth={1.5} />
      </div>
      <p className="text-slate-900 font-medium mb-1">Drag and drop a financial statement</p>
      <p className="text-slate-500 text-sm">PDF or Excel (.xlsx, .xls)</p>
    </div>
  );
};

export default UploadZone;
