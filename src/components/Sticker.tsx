import type { CSSProperties } from "react";

export type StickerProps = {
  src: string;
  alt?: string;
  width: number;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
};

export function Sticker({ src, alt = "", width, rotate = 0, className, style }: StickerProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      style={{ width, height: "auto", transform: `rotate(${rotate}deg)`, ...style }}
    />
  );
}
