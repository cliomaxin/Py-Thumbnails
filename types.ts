export enum Platform {
  YouTube = 'YouTube',
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  Facebook = 'Facebook',
  Reddit = 'Reddit'
}

export interface GeneratedContent {
  platform: Platform;
  title: string;
  description: string;
  hashtags: string[];
  imagePrompt?: string; // Internal use for image generation
}

export interface PostResult extends GeneratedContent {
  imageUrl?: string;
  isImageLoading: boolean;
  imageError?: string;
}

export interface GenerationState {
  isTextLoading: boolean;
  results: Record<Platform, PostResult | null>;
}