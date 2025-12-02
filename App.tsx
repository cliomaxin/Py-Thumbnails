import React, { useState } from 'react';
import { Platform, PostResult } from './types';
import { generateSocialText, generateThumbnail } from './services/geminiService';
import { ApiKeyManager } from './components/ApiKeyManager';
import { PlatformCard } from './components/PlatformCard';
import { Sparkles, Layout, CheckCircle2, Circle } from 'lucide-react';

const App: React.FC = () => {
  const [keyReady, setKeyReady] = useState(false);
  const [concept, setConcept] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    Platform.YouTube,
    Platform.Instagram,
    Platform.TikTok
  ]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Record<string, PostResult>>({});

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    if (!concept.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setResults({}); // Clear previous

    try {
      // 1. Generate Text Content
      const textData = await generateSocialText(concept, selectedPlatforms);
      
      const newResults: Record<string, PostResult> = {};
      
      // Initialize results with text data
      textData.forEach(item => {
        newResults[item.platform] = {
          ...item,
          isImageLoading: true, // Auto-start image generation
          imageUrl: undefined
        };
      });
      
      setResults(newResults);
      setIsGenerating(false);

      // 2. Trigger Image Generation in parallel
      textData.forEach(item => {
        generateImageForPlatform(item.platform, item.imagePrompt || item.title);
      });

    } catch (error) {
      console.error("Error generating content:", error);
      setIsGenerating(false);
      alert("Failed to generate content. Please try again.");
    }
  };

  const generateImageForPlatform = async (platform: Platform, prompt: string) => {
    // Set loading state for specific image
    setResults(prev => ({
      ...prev,
      [platform]: { ...prev[platform]!, isImageLoading: true }
    }));

    try {
      const base64Image = await generateThumbnail(prompt, platform);
      setResults(prev => ({
        ...prev,
        [platform]: { ...prev[platform]!, isImageLoading: false, imageUrl: base64Image }
      }));
    } catch (error) {
      console.error(`Error generating image for ${platform}:`, error);
      setResults(prev => ({
        ...prev,
        [platform]: { ...prev[platform]!, isImageLoading: false, imageError: "Failed to generate" }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      <ApiKeyManager onKeySelected={() => setKeyReady(true)} />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SocialStream AI
            </span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Gemini 2.5 Flash + 3.0 Pro Vision
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Input Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-1 shadow-xl">
             <textarea
               className="w-full bg-slate-900/80 text-lg text-slate-100 placeholder-slate-500 p-6 rounded-xl border-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all outline-none"
               rows={4}
               placeholder="Describe your video concept here... (e.g., 'A cinematic travel vlog about hiking in the Swiss Alps during autumn, focusing on cozy cabins and foggy mornings')"
               value={concept}
               onChange={(e) => setConcept(e.target.value)}
             />
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layout size={16} /> Target Platforms
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.values(Platform).map((p) => {
                const isSelected = selectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!concept || selectedPlatforms.length === 0 || isGenerating || !keyReady}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
              !concept || selectedPlatforms.length === 0 || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Concept & Generating Assets...
              </>
            ) : (
              <>
                <Sparkles size={20} /> Generate Social Campaign
              </>
            )}
          </button>
        </section>

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {Object.values(results).map((result: PostResult) => (
              <PlatformCard 
                key={result.platform} 
                result={result} 
                onRegenerateImage={generateImageForPlatform} 
              />
            ))}
          </section>
        )}

      </main>
    </div>
  );
};

export default App;