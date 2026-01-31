"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text below the input
   */
  helperText?: string;
  /**
   * Full width input
   */
  fullWidth?: boolean;
  /**
   * Add visual wrapper
   */
  withWrapper?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = true,
      withWrapper = true,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const input = (
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-muted",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red focus:ring-red/50 focus:border-red",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />
    );

    if (!withWrapper) {
      return input;
    }

    return (
      <div className={cn("space-y-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        {input}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-muted"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label for the textarea
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text below the textarea
   */
  helperText?: string;
  /**
   * Maximum character count
   */
  maxLength?: number;
  /**
   * Show character count
   */
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      value,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const characterCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text placeholder:text-muted resize-none",
              "transition-all duration-200 min-h-[100px]",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red focus:ring-red/50 focus:border-red",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            maxLength={maxLength}
            {...props}
          />
          {showCount && maxLength && (
            <span
              className={cn(
                "absolute bottom-2 right-3 text-xs",
                characterCount >= maxLength ? "text-red" : "text-muted"
              )}
              aria-live="polite"
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="text-sm text-red flex items-center gap-1"
            role="alert"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="text-sm text-muted"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
