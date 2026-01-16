// ===========================================
// FILE: src/components/pwa/ServiceWorkerRegistration.tsx
// PURPOSE: Register and manage the service worker for PWA
// PRD REFERENCE: PRD Section 10 - PWA Requirements
// USED BY: Root layout
// ===========================================

'use client';

import { useEffect } from 'react';

/**
 * ServiceWorkerRegistration Component
 *
 * WHY: Registers the service worker for offline support and PWA features.
 * Handles registration, updates, and error cases.
 *
 * FEATURES:
 * - Registers service worker on mount
 * - Handles update prompts
 * - Logs registration status
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
  }, []);

  return null;
}

/**
 * Register the service worker
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[App] Service worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, notify user
            console.log('[App] New content available, refresh to update');
            showUpdateNotification();
          }
        });
      }
    });

    // Handle controller change (update activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  } catch (error) {
    console.error('[App] Service worker registration failed:', error);
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  // Create a simple notification banner
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 80px;
      left: 16px;
      right: 16px;
      background: #1A1A1A;
      color: white;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ">
      <span style="font-size: 14px;">A new version is available!</span>
      <button
        onclick="window.location.reload()"
        style="
          background: #34D239;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        "
      >
        Update
      </button>
    </div>
  `;

  // Remove existing banner if present
  const existing = document.getElementById('sw-update-banner');
  if (existing) {
    existing.remove();
  }

  document.body.appendChild(banner);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    banner.remove();
  }, 10000);
}
