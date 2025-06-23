'use client';

import Image from 'next/image';
import { Project } from '@/lib/supabase/projects';

type PlatformKey = 'gtm_id' | 'google_ads_id' | 'meta_ads_id' | 'tiktok_ads_id' | 'linkedin_ads_id';

const platformDetails: Record<PlatformKey, { name: string; logo: string }> = {
  gtm_id: { name: 'Google Tag Manager', logo: '/logos/gtm.svg' },
  google_ads_id: { name: 'Google Ads', logo: '/logos/google-ads.svg' },
  meta_ads_id: { name: 'Meta Ads', logo: '/logos/meta-ads.svg' },
  tiktok_ads_id: { name: 'TikTok Ads', logo: '/logos/tiktok-ads.svg' },
  linkedin_ads_id: { name: 'LinkedIn Ads', logo: '/logos/linkedin-ads.svg' },
};

interface ConnectedPlatformsProps {
  project: Project;
}

export default function ConnectedPlatforms({ project }: ConnectedPlatformsProps) {
  const connected = (Object.keys(platformDetails) as PlatformKey[])
    .filter(key => project[key]);

  if (connected.length === 0) {
    return (
        <div className="flex items-center">
            <p className="text-sm text-gray-400">Nenhuma plataforma conectada</p>
        </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {connected.map(key => (
        <div key={key} className="group relative">
          <Image
            src={platformDetails[key].logo}
            alt={platformDetails[key].name}
            width={24}
            height={24}
            className="w-6 h-6"
            title={platformDetails[key].name}
          />
        </div>
      ))}
    </div>
  );
} 
