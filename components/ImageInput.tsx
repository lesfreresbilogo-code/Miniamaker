import React, { useState, useEffect, useRef } from 'react';

interface ImageInputProps {
  onImageSelect: (file: File | null) => void;
  imageFile: File | null;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, imageFile }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      
      // Cleanup
      return () => URL.revokeObjectURL(url);
    } else {
        setPreviewUrl(null);
    }
  }, [imageFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageSelect(file);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] || null;
    onImageSelect(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`w-full h-48 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors hover:border-yellow-500 hover:bg-gray-700 ${previewUrl ? 'p-2' : 'p-4'}`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243" />
             </svg>
            <p className="mt-2 font-semibold">Cliquez pour téléverser ou glissez-déposez</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </label>
    </div>
  );
};