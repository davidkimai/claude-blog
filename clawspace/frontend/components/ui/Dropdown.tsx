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

export interface DropdownItem {
  /**
   * Unique identifier for the item
   */
  id: string;
  /**
   * Display label
   */
  label: string;
  /**
   * Optional icon
   */
  icon?: ReactNode;
  /**
   * Optional keyboard shortcut
   */
  shortcut?: string;
  /**
   * Visual variant
   * @default "default"
   */
  variant?: "default" | "danger";
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Nested items (creates submenu)
   */
  items?: DropdownItem[];
}

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown component");
  }
  return context;
}

export interface DropdownProps {
  /**
   * Trigger element (button, icon, etc.)
   */
  trigger: ReactNode;
  /**
   * Dropdown menu items
   */
  items: DropdownItem[];
  /**
   * Whether the dropdown is open
   */
  isOpen: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Dropdown alignment
   * @default "end"
   */
  align?: "start" | "center" | "end";
  /**
   * Disable the dropdown
   */
  disabled?: boolean;
  /**
   * CSS class name
   */
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  isOpen,
  onOpenChange,
  align = "end",
  disabled,
  className,
}: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onOpenChange]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onOpenChange]);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen: onOpenChange, close }}>
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {trigger}
        {mounted &&
          isOpen &&
          createPortal(
            <div className="fixed inset-0 z-dropdown" onClick={close}>
              <div
                className={cn(
                  "absolute top-full mt-1 min-w-[180px] rounded-xl border border-border/60 bg-panel shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
                  alignClasses[align]
                )}
                role="menu"
                aria-orientation="vertical"
              >
                {items.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    item={item}
                    onSelect={() => {
                      if (!item.disabled && !item.items) {
                        close();
                      }
                    }}
                  />
                ))}
              </div>
            </div>,
            document.body
          )}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownMenuItemProps {
  item: DropdownItem;
  onSelect: () => void;
}

function DropdownMenuItem({ item, onSelect }: DropdownMenuItemProps) {
  const { close } = useDropdown();
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleClick = () => {
    if (item.items) {
      setSubmenuOpen(!submenuOpen);
    } else {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleMouseEnter = () => {
    if (item.items) {
      setSubmenuOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setSubmenuOpen(false);
  };

  const itemClasses = cn(
    "flex items-center gap-2 px-3 py-2 text-sm text-text transition-colors",
    "cursor-pointer select-none",
    "hover:bg-accent focus:bg-accent focus:outline-none",
    item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    item.variant === "danger" && "hover:bg-red/10 focus:bg-red/10 text-red"
  );

  if (item.items) {
    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={itemClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={submenuOpen}
          disabled={item.disabled}
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={cn("h-4 w-4 text-muted transition-transform", submenuOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {submenuOpen && (
          <div
            className="absolute left-full top-0 ml-0.5 min-w-[180px] rounded-xl border border-border/60 bg-panel shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="menu"
          >
            {item.items.map((subItem) => (
              <DropdownMenuItem
                key={subItem.id}
                item={subItem}
                onSelect={() => {
                  onSelect();
                  close();
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className={itemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      disabled={item.disabled}
    >
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <span className="flex-1 text-left">{item.label}</span>
      {item.shortcut && (
        <span className="text-xs text-muted font-mono">{item.shortcut}</span>
      )}
    </button>
  );
}

// Simple dropdown trigger button
interface DropdownButtonProps {
  /**
   * Button children
   */
  children: ReactNode;
  /**
   * Button class names
   */
  className?: string;
  /**
   * Aria-label
   */
  "aria-label"?: string;
}

export function DropdownTrigger({ children, className, "aria-label": ariaLabel }: DropdownButtonProps) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-2 text-muted transition-colors",
        "hover:bg-accent hover:text-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isOpen && "bg-accent text-text",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={ariaLabel || "Menu"}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {children}
    </button>
  );
}
