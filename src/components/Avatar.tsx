import styles from "./Avatar.module.css";

export type AvatarProps = {
  foto?: string;
  nome: string;
  size?: number;
};

export function Avatar({ foto, nome, size = 56 }: AvatarProps) {
  const inicial = nome.trim() ? nome.trim()[0].toUpperCase() : "?";
  return (
    <span className={styles.ring}>
      {foto ? (
        <img className={styles.avatar} style={{ width: size, height: size }} src={foto} alt={nome} />
      ) : (
        <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.46 }}>
          {inicial}
        </span>
      )}
    </span>
  );
}
