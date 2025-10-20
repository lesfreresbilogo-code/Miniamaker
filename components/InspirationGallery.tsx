import React, { useState } from 'react';

const inspirationImages = [
  {
    src: 'https://img.youtube.com/vi/yXWw0_UfSFg/maxresdefault.jpg',
    alt: 'Example of a high-energy thumbnail with a person reacting with shock.',
    title: 'Style : Réaction Épique',
    description: 'Visages choqués, explosions, couleurs vives. Idéal pour les défis ou les résultats surprenants.'
  },
  {
    src: 'https://img.youtube.com/vi/d5gxUv1pGBg/maxresdefault.jpg',
    alt: 'Example of an emotional thumbnail.',
    title: 'Style : Récit Émotionnel',
    description: 'Met l\'accent sur une émotion forte (joie, tristesse). Souvent utilisé pour les dons ou les histoires personnelles.'
  },
  {
    src: 'https://img.youtube.com/vi/0e3GPea1Tyg/maxresdefault.jpg',
    alt: 'Example of a challenge style thumbnail.',
    title: 'Style : Danger & Défi',
    description: 'Suggère une situation intense ou dangereuse. Parfait pour les vidéos de survie ou de challenge physique.'
  },
];

export const InspirationSelector: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-b border-gray-700">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-3 text-left text-lg font-bold text-yellow-400"
      >
        <span>Trouvez l'Inspiration</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="py-4 space-y-4">
             <p className="text-sm text-gray-400 -mt-2 mb-4">Utilisez ces exemples pour guider votre choix de titre et d'image.</p>
            {inspirationImages.map((image, index) => (
            <div key={index} className="flex items-start space-x-3">
                <img src={image.src} alt={image.alt} className="w-24 h-auto aspect-video object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow">
                    <h3 className="text-sm font-semibold text-white">{image.title}</h3>
                    <p className="text-xs text-gray-400">{image.description}</p>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
