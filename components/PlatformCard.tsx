import React from 'react';
import { Copy, Download, RefreshCw, Share2, Instagram, Facebook, Youtube, Video, MessageCircle } from 'lucide-react';
import { Platform, PostResult } from '../types';

interface PlatformCardProps {
  result: PostResult;
  onRegenerateImage: (platform: Platform, prompt: string) => void;
}

const PlatformIcon: React.FC<{ platform: Platform }> = ({ platform }) => {
  switch (platform) {
    case Platform.Instagram: return <Instagram className="text-pink-500" />;
    case Platform.Facebook: return <Facebook className="text-blue-600" />;
    case Platform.YouTube: return <Youtube className="text-red-600" />;
    case Platform.TikTok: return <Video className="text-black dark:text-white" />; // Custom styling usually
    case Platform.Reddit: return <MessageCircle className="text-orange-500" />;
    default: return <Share2 />;
  }
};

export const PlatformCard: React.FC<PlatformCardProps> = ({ result, onRegenerateImage }) => {
  const { platform, title, description, hashtags, imageUrl, isImageLoading, imagePrompt } = result;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${platform.toLowerCase()}_thumbnail.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-lg hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">
          <PlatformIcon platform={platform} />
        </div>
        <h3 className="text-lg font-semibold text-white">{platform}</h3>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Title / Headline</label>
          <div className="relative group">
            <p className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-sm font-medium">{title}</p>
            <button 
              onClick={() => handleCopy(title)}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy Title"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Description / Caption</label>
          <div className="relative group">
            <div className="text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-sm whitespace-pre-line max-h-40 overflow-y-auto custom-scrollbar">
              {description}
            </div>
            <button 
              onClick={() => handleCopy(description)}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy Description"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Hashtags</label>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                #{tag.replace('#', '')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnail Section */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {platform === Platform.Instagram || platform === Platform.TikTok ? 'Visual / Cover' : '4K Thumbnail'}
          </label>
          {imageUrl && (
             <button 
             onClick={handleDownload}
             className="text-xs flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
           >
             <Download size={14} /> Download 4K
           </button>
          )}
        </div>

        <div className={`relative w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center ${
            platform === Platform.TikTok ? 'aspect-[9/16] max-w-[200px] mx-auto' : 
            platform === Platform.Instagram ? 'aspect-square' : 'aspect-video'
          }`}>
          
          {isImageLoading ? (
            <div className="flex flex-col items-center gap-3 animate-pulse">
               <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs text-slate-500">Rendering 4K pixels...</span>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={`${platform} generated`} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <p className="text-xs text-slate-500 mb-2">High-quality image ready to generate</p>
              <button 
                onClick={() => onRegenerateImage(platform, imagePrompt || title)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-md transition-colors border border-slate-600 flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={12} /> Generate Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};