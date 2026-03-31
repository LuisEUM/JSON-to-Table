"use client";

import React from "react";

interface ResizeHandleProps {
  isResizing?: boolean;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  className?: string;
}

export const ResizeHandle = ({
  isResizing = false,
  onMouseDown,
  onTouchStart,
  className
}: ResizeHandleProps) => {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity duration-200 ${
        isResizing
          ? "bg-[hsl(var(--primary))] opacity-100"
          : "bg-[hsl(var(--border))] hover:opacity-100"
      } ${className || ""}`}
    />
  );
};