import React from 'react';
import { Spinner } from './Spinner';

// Fix: Updated the HistoryItem interface to match the one in `App.tsx`.
// The original was missing the `originalSubject` property, causing a type
// mismatch when passing the `setModificationTarget` function to the `onModify` prop.
interface HistoryItem {
  id: string;
  imageData: string;
  originalSubject: {
    base64: string;
    mimeType: string;
  };
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onEnlarge: (imageData: string) => void;
  onModify: (item: HistoryItem) => void;
  modifyingId: string | null;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onDelete, onEnlarge, onModify, modifyingId }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 h-full">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400 text-center">Historique</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">Vos miniatures générées apparaîtront ici.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
          {history.map((item) => (
            <div key={item.id} className="relative group aspect-video">
              <img src={item.imageData} alt="Generated thumbnail" className="w-full h-full object-cover rounded-md" />
              
              {modifyingId === item.id && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-md">
                  <Spinner />
                </div>
              )}

              {modifyingId !== item.id && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-md">
                  {/* Enlarge */}
                  <button onClick={() => onEnlarge(item.imageData)} className="p-2 bg-gray-700 rounded-full hover:bg-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  </button>
                  {/* Modify */}
                  <button onClick={() => onModify(item)} className="p-2 bg-gray-700 rounded-full hover:bg-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                  </button>
                  {/* Delete */}
                  <button onClick={() => onDelete(item.id)} className="p-2 bg-gray-700 rounded-full hover:bg-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};