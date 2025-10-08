import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private _isMobile = signal(false);
  private _isTablet = signal(false);
  private _isPWA = signal(false);
  private _isStandalone = signal(false);

  readonly isMobile = this._isMobile.asReadonly();
  readonly isTablet = this._isTablet.asReadonly();
  readonly isPWA = this._isPWA.asReadonly();
  readonly isStandalone = this._isStandalone.asReadonly();

  constructor() {
    this.detectDevice();
    this.detectPWA();
  }

  private detectDevice(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    // Mobile detection
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent);
    const isMobileWidth = width <= 767;
    
    this._isMobile.set(isMobileUA || isMobileWidth);

    // Tablet detection
    const isTabletWidth = width >= 768 && width <= 1023;
    const isTabletUA = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    this._isTablet.set(isTabletUA || (isTabletWidth && !isMobileUA));
  }

  private detectPWA(): void {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    this._isStandalone.set(isStandalone);
    this._isPWA.set(isStandalone || this.isInstallable());
  }

  isInstallable(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this._isMobile()) return 'mobile';
    if (this._isTablet()) return 'tablet';
    return 'desktop';
  }

  getScreenSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  isPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  // Vibration API for mobile feedback
  vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator && this._isMobile()) {
      navigator.vibrate(pattern);
    }
  }

  // Share API for mobile sharing
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if ('share' in navigator && this._isMobile()) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  }

  // Wake Lock API to prevent screen from sleeping
  async requestWakeLock(): Promise<WakeLockSentinel | null> {
    if ('wakeLock' in navigator) {
      try {
        return await navigator.wakeLock.request('screen');
      } catch (error) {
        console.error('Wake lock request failed:', error);
        return null;
      }
    }
    return null;
  }

  // Battery API for mobile optimization
  async getBatteryInfo(): Promise<any> {
    if ('getBattery' in navigator) {
      try {
        return await (navigator as any).getBattery();
      } catch (error) {
        console.error('Battery API not available:', error);
        return null;
      }
    }
    return null;
  }

  // Network Information API
  getNetworkInfo(): any {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  // Device orientation
  getOrientation(): string {
    if (screen.orientation) {
      return screen.orientation.type;
    }
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  // Safe area insets for notched devices
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0')
    };
  }

  // Haptic feedback for supported devices
  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    const patterns = {
      light: 10,
      medium: 50,
      heavy: 100
    };
    
    this.vibrate(patterns[type]);
  }

  // Install PWA prompt
  async showInstallPrompt(): Promise<boolean> {
    // This would be used with beforeinstallprompt event
    // Implementation depends on how you handle PWA installation
    return false;
  }

  // Check if device supports specific features
  supportsFeature(feature: string): boolean {
    const features: { [key: string]: boolean } = {
      'geolocation': 'geolocation' in navigator,
      'camera': 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      'notifications': 'Notification' in window,
      'serviceWorker': 'serviceWorker' in navigator,
      'webShare': 'share' in navigator,
      'wakeLock': 'wakeLock' in navigator,
      'vibration': 'vibrate' in navigator,
      'fullscreen': 'requestFullscreen' in document.documentElement,
      'orientation': 'orientation' in screen,
      'battery': 'getBattery' in navigator,
      'network': 'connection' in navigator
    };

    return features[feature] || false;
  }
}

// Type definitions for better TypeScript support
declare global {
  interface Navigator {
    wakeLock: {
      request(type: 'screen'): Promise<WakeLockSentinel>;
    };
    share(data: ShareData): Promise<void>;
    vibrate(pattern: number | number[]): boolean;
  }

  interface WakeLockSentinel {
    release(): Promise<void>;
    type: 'screen';
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
  }
}