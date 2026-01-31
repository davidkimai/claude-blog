"use client";

import {
  Fragment,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  showTooltip: (id: string, content: ReactNode, position: TooltipPosition) => void;
  hideTooltip: (id: string) => void;
}

type TooltipPosition = "top" | "bottom" | "left" | "right";

export type { TooltipPosition };

interface TooltipEntry {
  id: string;
  content: ReactNode;
  position: TooltipPosition;
  targetRect: DOMRect | null;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltips, setTooltips] = useState<TooltipEntry[]>([]);

  const showTooltip = useCallback(
    (id: string, content: ReactNode, position: TooltipPosition) => {
      setTooltips((prev) => {
        // Remove existing tooltip with same id
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, { id, content, position, targetRect: null }];
      });
    },
    []
  );

  const hideTooltip = useCallback((id: string) => {
    setTooltips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update tooltip positions based on their trigger elements
  useEffect(() => {
    const updatePositions = () => {
      setTooltips((prev) =>
        prev.map((tooltip) => {
          const element = document.getElementById(`tooltip-trigger-${tooltip.id}`);
          if (element) {
            return {
              ...tooltip,
              targetRect: element.getBoundingClientRect(),
            };
          }
          return tooltip;
        })
      );
    };

    updatePositions();
    window.addEventListener("scroll", updatePositions, true);
    window.addEventListener("resize", updatePositions);

    return () => {
      window.removeEventListener("scroll", updatePositions, true);
      window.removeEventListener("resize", updatePositions);
    };
  }, [tooltips]);

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div aria-live="polite" aria-atomic="true">
            {tooltips.map((tooltip) => (
              <TooltipBubble key={tooltip.id} tooltip={tooltip} onClose={() => hideTooltip(tooltip.id)} />
            ))}
          </div>,
          document.body
        )}
    </TooltipContext.Provider>
  );
}

interface TooltipBubbleProps {
  tooltip: TooltipEntry;
  onClose: () => void;
}

function TooltipBubble({ tooltip, onClose }: TooltipBubbleProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [positionStyles, setPositionStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!tooltipRef.current || !tooltip.targetRect) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    let top = 0;
    let left = 0;

    const { innerWidth, innerHeight } = window;

    switch (tooltip.position) {
      case "top":
        top = tooltip.targetRect.top - gap - tooltipRect.height;
        left = tooltip.targetRect.left + (tooltip.targetRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = tooltip.targetRect.bottom + gap;
        left = tooltip.targetRect.left + (tooltip.targetRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = tooltip.targetRect.top + (tooltip.targetRect.height - tooltipRect.height) / 2;
        left = tooltip.targetRect.left - gap - tooltipRect.width;
        break;
      case "right":
        top = tooltip.targetRect.top + (tooltip.targetRect.height - tooltipRect.height) / 2;
        left = tooltip.targetRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    left = Math.max(gap, Math.min(left, innerWidth - tooltipRect.width - gap));
    top = Math.max(gap, Math.min(top, innerHeight - tooltipRect.height - gap));

    setPositionStyles({ top, left });
  }, [tooltip]);

  // Auto-hide after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const positionClasses = {
    top: "animate-in fade-in zoom-in-95 duration-200",
    bottom: "animate-in fade-in slide-in-from-top-2 duration-200",
    left: "animate-in fade-in zoom-in-95 duration-200",
    right: "animate-in fade-in zoom-in-95 duration-200",
  };

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-tooltip px-3 py-1.5 rounded-lg bg-panel text-sm text-text shadow-lg border border-border/60",
        "max-w-xs break-words",
        positionClasses[tooltip.position]
      )}
      style={positionStyles}
    >
      {tooltip.content}
      {/* Arrow */}
      <div
        className={cn(
          "absolute w-2 h-2 bg-panel border-l border-t border-border/60 rotate-45",
          tooltip.position === "top" && "-bottom-1 left-1/2 -translate-x-1/2",
          tooltip.position === "bottom" && "-top-1 left-1/2 -translate-x-1/2",
          tooltip.position === "left" && "-right-1 top-1/2 -translate-y-1/2",
          tooltip.position === "right" && "-left-1 top-1/2 -translate-y-1/2"
        )}
      />
    </div>
  );
}

// Tooltip trigger component
interface TooltipProps {
  /**
   * Unique ID for the tooltip
   */
  id: string;
  /**
   * Content to display in tooltip
   */
  content: ReactNode;
  /**
   * Tooltip position
   * @default "top"
   */
  position?: TooltipPosition;
  /**
   * Children element to attach tooltip to
   */
  children: ReactNode;
  /**
   * Disable the tooltip
   */
  disabled?: boolean;
}

export function Tooltip({ id, content, position = "top", children, disabled }: TooltipProps) {
  const { showTooltip, hideTooltip } = useTooltip();

  if (disabled) return <>{children}</>;

  return (
    <span
      id={`tooltip-trigger-${id}`}
      onMouseEnter={() => showTooltip(id, content, position)}
      onMouseLeave={() => hideTooltip(id)}
      onFocus={() => showTooltip(id, content, position)}
      onBlur={() => hideTooltip(id)}
    >
      {children}
    </span>
  );
}
