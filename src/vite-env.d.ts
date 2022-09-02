/// <reference types="vite/client" />
/// <reference types="react" />

declare module 'draggabilly';

declare type ElementLike = string | HTMLElement;

declare type PlainNode = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};
