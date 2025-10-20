import React from 'react';

interface TextStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

const textStyles = [
  { 
    name: 'MrBeast', 
    description: 'Impactant & Viral',
    styleClasses: 'font-anton text-white' 
  },
  { 
    name: 'Neon', 
    description: 'Brillant & Moderne',
    styleClasses: 'font-sans text-cyan-400'
  },
  { 
    name: 'Fiery', 
    description: 'Intense & Énergique',
    styleClasses: 'font-anton text-orange-500'
  },
  { 
    name: 'Cinematic', 
    description: 'Élégant & Épique',
    styleClasses: 'font-serif text-gray-200 tracking-widest'
  },
  { 
    name: '3D Gold', 
    description: 'Luxe & Prestige',
    styleClasses: 'font-serif font-bold text-yellow-400'
  },
];

export const TextStyleSelector: React.FC<TextStyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div>
      <label className="block text-lg font-bold mb-2 text-yellow-400">4. Choisissez un Style de Texte</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {textStyles.map((style) => (
          <button
            key={style.name}
            onClick={() => onStyleChange(style.name)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-center cursor-pointer
              ${selectedStyle === style.name 
                ? 'bg-yellow-500 border-yellow-400 text-gray-900' 
                : 'bg-gray-700 border-gray-600 hover:border-yellow-500 hover:bg-gray-600'
              }`}
          >
            <span className={`block text-xl font-bold ${selectedStyle === style.name ? '' : style.styleClasses}`}>
              Aa
            </span>
            <span className="block text-xs font-semibold mt-1">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
