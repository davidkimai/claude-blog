"use client";

import {
  Fragment,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
}

interface TabsContextValue {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a Tabs component");
  }
  return context;
}

export interface TabsProps {
  /**
   * Array of tab configurations
   */
  tabs: Tab[];
  /**
   * Currently active tab ID
   */
  activeTab: string;
  /**
   * Callback when tab changes
   */
  onChange: (tabId: string) => void;
  /**
   * Children to render (TabPanel components)
   */
  children: ReactNode;
  /**
   * Full width tabs
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Size of tabs
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Visual variant
   * @default "default"
   */
  variant?: "default" | "pills" | "underline";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  children,
  fullWidth = false,
  size = "md",
  variant = "default",
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ tabs, activeTab, setActiveTab: onChange }}>
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="Content tabs"
          className={cn(
            "flex gap-1",
            fullWidth && "w-full",
            variant === "pills" && "bg-accent/50 p-1 rounded-lg"
          )}
          style={{ overflowX: "auto", overflowY: "hidden" }}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => onChange(tab.id)}
              fullWidth={fullWidth}
              size={size}
              variant={variant}
            />
          ))}
        </div>
        <div className="tab-panels">
          {children}
        </div>
      </div>
    </TabsContext.Provider>
  );
}

interface TabButtonProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  fullWidth: boolean;
  size: "sm" | "md" | "lg";
  variant: "default" | "pills" | "underline";
}

function TabButton({
  tab,
  isActive,
  onClick,
  fullWidth,
  size,
  variant,
}: TabButtonProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
    default: cn(
      "rounded-lg transition-all",
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "text-muted hover:text-text hover:bg-accent/50"
    ),
    pills: cn(
      "rounded-md transition-all",
      isActive
        ? "bg-panel text-text shadow-sm"
        : "text-muted hover:text-text"
    ),
    underline: cn(
      "border-b-2 transition-all",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-muted hover:text-text hover:border-border"
    ),
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${tab.id}`}
      id={`tab-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 font-medium whitespace-nowrap",
        fullWidth && "flex-1",
        sizes[size],
        variants[variant],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
      )}
    >
      {tab.icon}
      <span>{tab.label}</span>
      {tab.badge !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full text-xs font-semibold",
            isActive && variant === "default" ? "bg-white/20" : "bg-accent"
          )}
          aria-label={`${tab.badge} items`}
        >
          {tab.badge}
        </span>
      )}
    </button>
  );
}

export interface TabPanelProps {
  /**
   * ID of the tab this panel belongs to
   */
  tabId: string;
  /**
   * Children to render
   */
  children: ReactNode;
  /**
   * Hide the panel when not active
   * @default true
   */
  hidden?: boolean;
}

export function TabPanel({
  tabId,
  children,
  hidden = true,
}: TabPanelProps) {
  const { activeTab } = useTabs();
  const isActive = activeTab === tabId;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={hidden && !isActive}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        "animate-in fade-in duration-200",
        hidden && !isActive && "hidden"
      )}
    >
      {children}
    </div>
  );
}
