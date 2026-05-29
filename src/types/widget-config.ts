// src/types/widget-config.ts

export type DisplayMode = "flyout" | "inline";
export type LayoutMode = "grid" | "carousel";
export type ThemeName = "default" | "modern" | "professional" | "pastel";
export type FlyoutPosition = "bottom-right" | "bottom-center" | "bottom-left";

export interface WidgetConfig {
  placeId: string;
  mode: DisplayMode;
  layout: LayoutMode;
  theme: ThemeName;
  position: FlyoutPosition;
  maxReviews: number;
  ctaText?: string;
  ctaUrl?: string;
  mount?: string;
  customClass?: string;
}
