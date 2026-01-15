// ===========================================
// FILE: src/components/ui/Modal.tsx
// PURPOSE: Reusable modal/dialog component
// PRD REFERENCE: UI Spec - Modal, PRD Section 7 - Visit Logging
// USED BY: Visit log modal, chemical configuration, package templates, etc.
// ===========================================

'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayClick?: boolean;
}

/**
 * Modal Component
 *
 * WHY: Full-screen on mobile, centered on desktop as specified in UI Spec.
 * Used for the visit log modal (primary use case) and other forms/dialogs.
 *
 * FEATURES:
 * - Full-screen on mobile (< 640px)
 * - Centered overlay on desktop
 * - Optional header with close button
 * - Optional footer for actions
 * - Close on overlay click (configurable)
 * - Close on Escape key
 * - Body scroll lock when open
 * - Smooth transitions
 *
 * BUSINESS LOGIC:
 * - Visit log modal is the primary use case (PRD Section 7)
 * - Must be easy to use on mobile devices in car wash environments
 * - Full-screen on mobile for maximum usability
 *
 * EXAMPLE:
 * ```tsx
 * <Modal
 *   isOpen={isVisitLogOpen}
 *   onClose={() => setIsVisitLogOpen(false)}
 *   title="Log Visit - Downtown Car Wash"
 *   size="lg"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={onClose}>Cancel</Button>
 *       <Button onClick={handleSave}>Save Visit</Button>
 *     </>
 *   }
 * >
 *   <VisitLogForm />
 * </Modal>
 * ```
 *
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when modal should close
 * @param title - Modal header title
 * @param children - Modal content
 * @param footer - Footer content (typically action buttons)
 * @param size - Modal width (sm: 400px, md: 600px, lg: 800px, full: 100%)
 * @param closeOnOverlayClick - Allow closing by clicking overlay (default: true)
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  // Lock body scroll when modal is open
  // WHY: Prevents background scrolling on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Modal size classes
  // WHY: Different sizes for different content types
  const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full',
  };

  // Mobile: full screen, Desktop: centered with max size
  const modalStyles = cn(
    'bg-bg-secondary rounded-lg shadow-lg flex flex-col',
    'w-full mx-auto',
    // Mobile: full screen
    'sm:max-h-[90vh]',
    // Desktop: centered with max width
    sizeStyles[size]
  );

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-150"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-0 sm:p-4">
          {/* Modal content */}
          <div className={modalStyles}>
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light">
                <h2 className="text-xl font-semibold text-text-primary">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-bg-tertiary"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-border-light">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Modal confirmation dialog helper
 * WHY: Common pattern for destructive actions
 *
 * EXAMPLE:
 * ```tsx
 * <ConfirmModal
 *   isOpen={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Chemical?"
 *   message="This action cannot be undone. Are you sure you want to delete this chemical?"
 *   confirmText="Delete"
 *   confirmVariant="destructive"
 * />
 * ```
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'destructive';
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-primary">{message}</p>
    </Modal>
  );
}
