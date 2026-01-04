'use client';

import { useState } from 'react';
import { SplashScreen } from '@/components/ui/splash-screen';
import { PermissionsScreen } from '@/components/ui/permissions-screen';
import { HomeScreen } from '@/components/ui/home-screen';
import { LiveProtectionScreen } from '@/components/ui/live-protection-screen';
import { PostCallSummary } from '@/components/ui/post-call-summary';
import { TextAnalyzer } from '@/components/ui/text-analyzer';

type Screen =
  | 'splash'
  | 'permissions'
  | 'home'
  | 'live-protection'
  | 'post-call-summary'
  | 'text-analyzer';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

  return (
    <main className="min-h-screen">
      {currentScreen === 'splash' && (
        <SplashScreen onGetStarted={() => setCurrentScreen('permissions')} />
      )}

      {currentScreen === 'permissions' && (
        <PermissionsScreen onAllowPermissions={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          onStartLiveProtection={() => setCurrentScreen('live-protection')}
          onAnalyzePastConversation={() => setCurrentScreen('text-analyzer')}
        />
      )}

      {currentScreen === 'live-protection' && (
        <LiveProtectionScreen
          onEndSession={() => setCurrentScreen('post-call-summary')}
        />
      )}

      {currentScreen === 'post-call-summary' && (
        <PostCallSummary onBackHome={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'text-analyzer' && (
        <TextAnalyzer onBackHome={() => setCurrentScreen('home')} />
      )}
    </main>
  );
}
