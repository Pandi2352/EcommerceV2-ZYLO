import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

export type PopoverPlacement = 'bottom-start' | 'bottom-end';

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** Element the panel is positioned against */
  anchorRef: React.RefObject<HTMLElement | null>;
  placement?: PopoverPlacement;
  /** Make the panel at least as wide as the anchor (for select-style fields) */
  matchWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

const GAP = 4;
// Start fixed + hidden so the first measurement is the panel's natural (shrink-to-fit)
// size, not the full page width of a static block.
const HIDDEN: React.CSSProperties = { position: 'fixed', top: 0, left: 0, visibility: 'hidden' };
const VIEWPORT_MARGIN = 8;

/**
 * Floating panel rendered in a portal, so it is never clipped by scrolling
 * containers such as tables. Closes on outside click and Escape, follows the
 * anchor on scroll/resize, and flips above the anchor when there is no room below.
 */
export const Popover: React.FC<PopoverProps> = ({
  open,
  onClose,
  anchorRef,
  placement = 'bottom-start',
  matchWidth = false,
  className,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>(HIDDEN);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const rect = anchor.getBoundingClientRect();
    // Measure with the anchor's min-width applied, at the panel's natural size
    panel.style.minWidth = matchWidth ? `${rect.width}px` : '';
    const panelHeight = panel.offsetHeight;
    const panelWidth = panel.offsetWidth;
    const roomBelow = window.innerHeight - rect.bottom;
    const openUp = roomBelow < panelHeight + GAP + VIEWPORT_MARGIN && rect.top > roomBelow;

    let left = placement === 'bottom-end' ? rect.right - panelWidth : rect.left;
    left = Math.min(Math.max(VIEWPORT_MARGIN, left), window.innerWidth - panelWidth - VIEWPORT_MARGIN);

    setStyle({
      position: 'fixed',
      top: openUp ? rect.top - panelHeight - GAP : rect.bottom + GAP,
      left,
      minWidth: matchWidth ? rect.width : undefined,
      visibility: 'visible',
    });
  }, [anchorRef, matchWidth, placement]);

  useLayoutEffect(() => {
    if (open) reposition();
    else setStyle(HIDDEN);
  }, [open, reposition, children]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, onClose, anchorRef, reposition]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={cn(
        // Floating layer: the only elevated surface type, so it carries the shadow
        'z-[9000] rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-900/10',
        'animate-pop-in',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
};

export default Popover;
