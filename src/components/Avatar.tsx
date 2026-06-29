import styles from "./Avatar.module.css";

export type AvatarProps = {
  nome: string;
  size?: number;
};

export function Avatar({ nome, size = 56 }: AvatarProps) {
  const inicial = nome.trim() ? nome.trim()[0].toUpperCase() : "?";
  return (
    <span className={styles.ring}>
      <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.46 }}>
        {inicial}
      </span>
    </span>
  );
}
