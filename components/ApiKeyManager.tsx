import React, { useEffect, useState } from 'react';
import { ShieldCheck, Key } from 'lucide-react';

interface ApiKeyManagerProps {
  onKeySelected: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      const selected = await win.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      try {
        await win.aistudio.openSelectKey();
        // Assume success to avoid race condition, but re-verify
        setHasKey(true);
        onKeySelected();
      } catch (e) {
        console.error("Key selection failed", e);
        // Reset if failed
        setHasKey(false);
      }
    }
  };

  if (loading) return null;

  if (hasKey) return null; // Invisible if key exists

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-blue-400">
          <Key size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">API Key Required</h2>
        <p className="text-slate-400 mb-6">
          To generate 4K thumbnails and optimized content, this app requires a paid Google Cloud Project API key via Google AI Studio.
        </p>
        
        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
        >
          <ShieldCheck size={20} />
          Select API Key
        </button>

        <p className="mt-6 text-xs text-slate-500">
          See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Billing Documentation</a> for more details.
        </p>
      </div>
    </div>
  );
};