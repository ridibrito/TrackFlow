'use client';

import Image from 'next/image';

export const allPlatforms = [
  { id: 'google_ads', name: 'Google Ads', icon: '/logos/google-ads.svg' },
  { id: 'meta_ads', name: 'Meta Ads (Facebook)', icon: '/logos/meta-ads.svg' },
  { id: 'google_analytics', name: 'Google Analytics (GA4)', icon: '/logos/google-analytics.svg' },
  { id: 'tiktok_ads', name: 'TikTok Ads', icon: '/logos/tiktok-ads.svg' },
  { id: 'linkedin_ads', name: 'LinkedIn Ads', icon: '/logos/linkedin-ads.svg' },
  // Adicionar outras plataformas aqui no futuro
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
}

export default function PlatformSelector({ selectedPlatforms, onPlatformToggle }: PlatformSelectorProps) {
  return (
    <div className="space-y-4">
      {allPlatforms.map((platform) => (
        <label
          key={platform.id}
          htmlFor={`platform-${platform.id}`}
          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input
            id={`platform-${platform.id}`}
            type="checkbox"
            checked={selectedPlatforms.includes(platform.id)}
            onChange={() => onPlatformToggle(platform.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-4 flex items-center">
            <Image src={platform.icon} alt={platform.name} width={28} height={28} className="mr-3" />
            <span className="font-medium text-gray-800">{platform.name}</span>
          </div>
        </label>
      ))}
    </div>
  );
} 