import { motion } from "motion/react";
import type { CSSProperties } from "react";

export type FloatingAssetProps = {
  src: string;
  alt?: string;
  width: number;
  rotate?: number;
  floatRange?: number;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function FloatingAsset({
  src,
  alt = "",
  width,
  rotate = 0,
  floatRange = 12,
  duration = 4,
  delay = 0,
  className,
  style,
}: FloatingAssetProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      style={{ width, height: "auto", ...style }}
      initial={{ y: 0, rotate }}
      animate={{ y: [0, -floatRange, 0], rotate: [rotate, rotate + 2, rotate] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
