// ===========================================
// FILE: src/hooks/usePerformance.ts
// PURPOSE: Performance optimization hooks
// PRD REFERENCE: PRD Section 10 - Performance
// USED BY: Components requiring optimization
// ===========================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * useDebounce Hook
 *
 * WHY: Delay expensive operations until user stops typing/interacting.
 * Prevents excessive API calls or renders.
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook
 *
 * WHY: Limit how often a function can be called.
 * Useful for scroll handlers, resize events, etc.
 *
 * @param callback - Function to throttle
 * @param delay - Minimum time between calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= delay) {
        lastRan.current = now;
        callback(...args);
      } else {
        // Schedule for later
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          lastRan.current = Date.now();
          callback(...args);
        }, delay - (now - lastRan.current));
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * useIntersectionObserver Hook
 *
 * WHY: Lazy load content when it becomes visible.
 * Improves initial page load performance.
 *
 * @param options - IntersectionObserver options
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * useLazyLoad Hook
 *
 * WHY: Only load content when it's about to be visible.
 * Reduces initial bundle size and memory usage.
 *
 * @param threshold - How close to viewport before loading (0-1)
 */
export function useLazyLoad(threshold: number = 0.1): [React.RefObject<HTMLElement>, boolean] {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return [ref, hasLoaded];
}

/**
 * useVirtualList Hook
 *
 * WHY: Efficiently render large lists by only rendering visible items.
 * Prevents performance issues with long lists.
 *
 * @param items - Array of items to virtualize
 * @param itemHeight - Height of each item in pixels
 * @param containerHeight - Height of container in pixels
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  onScroll: (scrollTop: number) => void;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const { visibleItems, startIndex, endIndex, offsetY } = useMemo(() => {
    const overscan = 3; // Render extra items above/below for smooth scrolling
    const totalHeight = items.length * itemHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const offsetY = startIndex * itemHeight;

    return { visibleItems, startIndex, endIndex, offsetY };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const onScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY,
    onScroll,
  };
}

/**
 * usePrefetch Hook
 *
 * WHY: Prefetch data before user needs it.
 * Improves perceived performance.
 *
 * @param url - URL to prefetch
 * @param condition - Only prefetch when true
 */
export function usePrefetch(url: string, condition: boolean = true) {
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (!condition || hasPrefetched.current) return;

    const prefetch = async () => {
      try {
        await fetch(url, { method: 'GET', priority: 'low' } as RequestInit);
        hasPrefetched.current = true;
      } catch {
        // Ignore prefetch errors
      }
    };

    // Prefetch after a short delay to not block critical requests
    const timer = setTimeout(prefetch, 1000);
    return () => clearTimeout(timer);
  }, [url, condition]);
}

/**
 * useLocalStorage Hook
 *
 * WHY: Persist state to localStorage with automatic serialization.
 * Provides offline-first experience.
 *
 * @param key - Storage key
 * @param initialValue - Default value
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * useNetworkStatus Hook
 *
 * WHY: Detect online/offline status for offline-first UX.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
