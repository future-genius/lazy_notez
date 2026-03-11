import { useEffect, useRef } from 'react';

type Options = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  enabled?: boolean;
};

function isCoarsePointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
}

export function useSidebarSwipe({ isOpen, onOpen, onClose, enabled = true }: Options) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const trackingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!isCoarsePointer()) return;

    const onTouchStart = (ev: TouchEvent) => {
      if (ev.touches.length !== 1) return;
      const t = ev.touches[0];
      startXRef.current = t.clientX;
      startYRef.current = t.clientY;
      trackingRef.current = true;
    };

    const onTouchMove = (ev: TouchEvent) => {
      if (!trackingRef.current) return;
      const startX = startXRef.current;
      const startY = startYRef.current;
      if (startX == null || startY == null) return;
      const t = ev.touches[0];

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // Ignore mostly-vertical gestures (scroll).
      if (Math.abs(dy) > Math.abs(dx)) return;

      // Open: swipe from left edge.
      if (!isOpen && startX < 24 && dx > 60) {
        trackingRef.current = false;
        onOpen();
      }

      // Close: swipe left anywhere when open.
      if (isOpen && dx < -60) {
        trackingRef.current = false;
        onClose();
      }
    };

    const onTouchEnd = () => {
      trackingRef.current = false;
      startXRef.current = null;
      startYRef.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart as any);
      window.removeEventListener('touchmove', onTouchMove as any);
      window.removeEventListener('touchend', onTouchEnd as any);
      window.removeEventListener('touchcancel', onTouchEnd as any);
    };
  }, [enabled, isOpen, onClose, onOpen]);
}

