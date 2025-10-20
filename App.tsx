import React, { useState, useCallback } from 'react';
import { generateThumbnail, modifyThumbnail } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { ImageInput } from './components/ImageInput';
import { Spinner } from './components/Spinner';
import { InspirationSelector } from './components/InspirationGallery';
import { HistoryPanel } from './components/HistoryPanel';
import { Modal } from './components/Modal';
import { TextStyleSelector } from './components/TextStyleSelector';

interface HistoryItem {
  id: string;
  imageData: string;
  originalSubject: {
    base64: string;
    mimeType: string;
  };
}

const App: React.FC = () => {
  const [subjectImage, setSubjectImage] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [thumbnailText, setThumbnailText] = useState<string>('');
  const [textStyle, setTextStyle] = useState<string>('MrBeast');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [expression, setExpression] = useState<string>('Default');
  const [extraElements, setExtraElements] = useState<string>('');
  const [clothingStyle, setClothingStyle] = useState<string>('');
  const [otherPeople, setOtherPeople] = useState<string>('');
  const [subjectPosition, setSubjectPosition] = useState<string>('Center');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [modificationTarget, setModificationTarget] = useState<HistoryItem | null>(null);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isModifying, setIsModifying] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!subjectImage || !thumbnailText) {
      setError('Veuillez fournir une image et le texte court de la miniature.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await fileToBase64(subjectImage);
      const mimeType = subjectImage.type;

      const resultBase64 = await generateThumbnail(
        base64Image,
        mimeType,
        videoTitle,
        thumbnailText,
        textStyle,
        negativePrompt,
        expression,
        extraElements,
        clothingStyle,
        otherPeople,
        subjectPosition
      );
      const finalImage = `data:image/jpeg;base64,${resultBase64}`;
      setGeneratedImage(finalImage);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        imageData: finalImage,
        originalSubject: {
          base64: base64Image,
          mimeType: mimeType
        }
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'La génération de la miniature a échoué. L\'IA est peut-être occupée, veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [subjectImage, videoTitle, thumbnailText, textStyle, negativePrompt, expression, extraElements, clothingStyle, otherPeople, subjectPosition]);
  
  const handleReset = () => {
    setSubjectImage(null);
    setVideoTitle('');
    setThumbnailText('');
    setTextStyle('MrBeast');
    setNegativePrompt('');
    setExpression('Default');
    setExtraElements('');
    setClothingStyle('');
    setOtherPeople('');
    setSubjectPosition('Center');
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleModify = async () => {
    if (!modificationTarget || !modificationPrompt) return;
    
    setIsModifying(modificationTarget.id);
    setError(null);

    try {
      const thumbnailToModifyBase64 = modificationTarget.imageData.split(',')[1];
      const resultBase64 = await modifyThumbnail(
        modificationTarget.originalSubject.base64,
        modificationTarget.originalSubject.mimeType,
        thumbnailToModifyBase64,
        modificationPrompt
      );
      const newImage = `data:image/jpeg;base64,${resultBase64}`;

      setHistory(prev => prev.map(item => item.id === modificationTarget.id ? { ...item, imageData: newImage } : item));
      setModificationTarget(null);
      setModificationPrompt('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "La modification a échoué. Veuillez réessayer.");
    } finally {
      setIsModifying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-anton text-yellow-400 tracking-wider">MRBEASTIFY</h1>
          <p className="text-lg sm:text-xl text-gray-400 mt-2">Générateur de Miniatures par IA</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Input Section */}
          <div className="lg:col-span-4 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col space-y-6">
            <div>
              <label className="block text-lg font-bold mb-2 text-yellow-400">1. Téléchargez Votre Sujet</label>
              <p className="text-sm text-gray-400 mb-3">Téléchargez une seule personne, un animal ou un objet.</p>
              <ImageInput onImageSelect={setSubjectImage} imageFile={subjectImage} />
            </div>

            <InspirationSelector />

             <div>
              <label htmlFor="video-title" className="block text-lg font-bold mb-2 text-yellow-400">2. Titre de la Vidéo (pour le contexte IA)</label>
              <p className="text-sm text-gray-400 mb-3">L'IA l'utilise pour comprendre le thème.</p>
              <input
                id="video-title"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="J'ai Survécu 50 Heures Dans Une Ville Abandonnée"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
             <div>
              <label htmlFor="thumbnail-text" className="block text-lg font-bold mb-2 text-yellow-400">3. Texte de la Miniature (Requis)</label>
              <p className="text-sm text-gray-400 mb-3">Max 3-4 mots. Ceci apparaît sur l'image.</p>
              <input
                id="thumbnail-text"
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                placeholder="PLUS QUE 50 HEURES"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>

            <TextStyleSelector selectedStyle={textStyle} onStyleChange={setTextStyle} />

            <div>
                <label htmlFor="expression" className="block text-lg font-bold mb-2 text-yellow-400">5. Exagérer l'Expression</label>
                <select
                    id="expression"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                >
                    <option value="Default">Par défaut (depuis l'image)</option>
                    <option value="Shocked">Choqué</option>
                    <option value="Happy">Heureux / Euphorique</option>
                    <option value="Scared">Effrayé / Apeuré</option>
                    <option value="Angry">En colère / Intense</option>
                </select>
            </div>
            <div>
              <label htmlFor="extra-elements" className="block text-lg font-bold mb-2 text-yellow-400">6. Ajouter des Objets / Lieux</label>
              <p className="text-sm text-gray-400 mb-3">ex: "une pile de billets", "une explosion"</p>
              <input
                id="extra-elements"
                type="text"
                value={extraElements}
                onChange={(e) => setExtraElements(e.target.value)}
                placeholder="Une pile de billets"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="clothing-style" className="block text-lg font-bold mb-2 text-yellow-400">7. Changer le Style Vestimentaire</label>
              <p className="text-sm text-gray-400 mb-3">ex: "un costume spatial futuriste", "tenue d'homme des cavernes"</p>
              <input
                id="clothing-style"
                type="text"
                value={clothingStyle}
                onChange={(e) => setClothingStyle(e.target.value)}
                placeholder="Un costume spatial futuriste"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="other-people" className="block text-lg font-bold mb-2 text-yellow-400">8. Ajouter d'Autres Personnes</label>
              <p className="text-sm text-gray-400 mb-3">ex: "100 personnes qui me poursuivent", "une équipe du SWAT"</p>
              <input
                id="other-people"
                type="text"
                value={otherPeople}
                onChange={(e) => setOtherPeople(e.target.value)}
                placeholder="100 personnes qui me poursuivent"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="subject-position" className="block text-lg font-bold mb-2 text-yellow-400">9. Position du Sujet</label>
              <p className="text-sm text-gray-400 mb-3">Où placer le sujet principal ?</p>
              <select
                  id="subject-position"
                  value={subjectPosition}
                  onChange={(e) => setSubjectPosition(e.target.value)}
                  className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              >
                  <option value="Center">Au centre</option>
                  <option value="Left">À gauche</option>
                  <option value="Right">À droite</option>
                  <option value="Split-screen">Écran partagé (Évolution)</option>
              </select>
            </div>
             <div>
              <label htmlFor="negative-prompt" className="block text-lg font-bold mb-2 text-yellow-400">10. Éléments à Éviter (Prompt Négatif)</label>
              <p className="text-sm text-gray-400 mb-3">ex: "pas de sang", "couleurs ternes", "texte flou"</p>
              <input
                id="negative-prompt"
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Ex: couleurs ternes, texte flou"
                className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !subjectImage || !thumbnailText}
              className="w-full bg-yellow-500 text-gray-900 font-bold text-xl py-4 rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {isLoading ? <Spinner /> : 'GÉNÉRER LA MINIATURE'}
            </button>
             {generatedImage && (
               <button
                  onClick={handleReset}
                  className="w-full bg-gray-600 text-white font-bold text-xl py-4 rounded-lg hover:bg-gray-500 transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                  RECOMMENCER
                </button>
             )}
          </div>

          {/* Output Section */}
          <div className="lg:col-span-5 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center min-h-[300px] lg:min-h-0">
            {isLoading && (
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-lg text-gray-300 animate-pulse">MrBeastification de votre image...</p>
                <p className="text-sm text-gray-500">Cela peut prendre jusqu'à 30 secondes.</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">Une Erreur est Survenue</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            {!isLoading && !error && generatedImage && (
              <div className="w-full text-center">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Votre Miniature est Prête !</h2>
                <img src={generatedImage} alt="Generated Thumbnail" className="w-full aspect-video rounded-lg shadow-2xl mb-4 border-2 border-yellow-500" />
                <a
                  href={generatedImage}
                  download="mrbeast-thumbnail.jpg"
                  className="inline-block w-full bg-green-500 text-white font-bold text-xl py-4 rounded-lg hover:bg-green-400 transition-all duration-300 shadow-lg"
                >
                  TÉLÉCHARGER JPEG
                </a>
              </div>
            )}
            {!isLoading && !error && !generatedImage && (
              <div className="text-center text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                <p className="text-xl font-medium">Votre miniature générée apparaîtra ici.</p>
              </div>
            )}
          </div>

           {/* History Section */}
           <div className="lg:col-span-3">
              <HistoryPanel 
                history={history}
                onDelete={handleDelete}
                onEnlarge={setEnlargedImage}
                onModify={setModificationTarget}
                modifyingId={isModifying}
              />
            </div>
        </main>
      </div>
      
      {/* Enlarge Modal */}
      <Modal isOpen={!!enlargedImage} onClose={() => setEnlargedImage(null)}>
        {enlargedImage && <img src={enlargedImage} alt="Enlarged thumbnail" className="max-w-[80vw] max-h-[80vh] rounded-lg" />}
      </Modal>

      {/* Modify Modal */}
      <Modal isOpen={!!modificationTarget} onClose={() => setModificationTarget(null)}>
        {modificationTarget && (
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg text-white">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Modifier la Miniature</h2>
            <img src={modificationTarget.imageData} alt="Thumbnail to modify" className="w-full aspect-video rounded-md mb-4"/>
            <textarea
              value={modificationPrompt}
              onChange={(e) => setModificationPrompt(e.target.value)}
              placeholder="Ex: 'Change le fond en lave en fusion' ou 'Rends le texte plus gros'"
              className="w-full h-24 bg-gray-700 border-2 border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button 
                onClick={() => setModificationTarget(null)}
                className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleModify}
                disabled={!modificationPrompt || !!isModifying}
                className="px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
              >
                {isModifying ? <Spinner size="sm"/> : 'Appliquer la Modification'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;