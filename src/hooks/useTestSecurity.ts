import * as ScreenCapture from 'expo-screen-capture';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseTestSecurityProps {
  enabled: boolean;
  onViolation: (reason: string) => void;
  maxWarnings?: number;
}

export const useTestSecurity = ({
  enabled,
  onViolation,
  maxWarnings = 1,
}: UseTestSecurityProps) => {
  const warningsRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    // Prevent Screen Capture (Android) & Screen Recording
    const preventScreenCapture = async () => {
      await ScreenCapture.preventScreenCaptureAsync();
    };

    preventScreenCapture();

    // Monitor App Backgrounding
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background
        warningsRef.current += 1;
        
        if (warningsRef.current >= maxWarnings) {
           onViolation('App switched to background');
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came back to foreground
        // We can optionally show a warning toast here
        if (warningsRef.current < maxWarnings) {
            // console.log(`Warning ${warningsRef.current}/${maxWarnings}: Do not switch apps!`);
        }
      }

      appStateRef.current = nextAppState;
    });

    // Monitor Screen Capture (iOS mainly, as Android blocks it)
    const screenCaptureSubscription = ScreenCapture.addScreenshotListener(() => {
      warningsRef.current += 1;
      if (warningsRef.current >= maxWarnings) {
        onViolation('Screenshot detected');
      }
    });

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
      subscription.remove();
      screenCaptureSubscription.remove();
    };
  }, [enabled, maxWarnings, onViolation]);

  return {
    warnings: warningsRef.current,
  };
};
