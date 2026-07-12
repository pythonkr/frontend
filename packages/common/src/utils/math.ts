export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const snapToStep = (value: number, step: number): number => Math.round(value / step) * step;

export const stepsBetween = (from: number, to: number, step: number): number => Math.round((to - from) / step);
