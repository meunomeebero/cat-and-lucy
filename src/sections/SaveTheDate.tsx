import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { FloatingAsset } from "../components/FloatingAsset";
import { Sticker } from "../components/Sticker";
import styles from "./SaveTheDate.module.css";

export function SaveTheDate() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax + dispersão ao rolar
  const balloonsY = useTransform(scrollYProgress, [0, 1], [0, -650]);
  const balloonsOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const starsScale = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const starsOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const cloudsLeftX = useTransform(scrollYProgress, [0, 1], [0, -380]);
  const cloudsRightX = useTransform(scrollYProgress, [0, 1], [0, 380]);
  const crownsY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const crownsOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className={styles.section}>
      <div className={`${styles.blob} ${styles.blobTopLeft}`} aria-hidden />
      <div className={`${styles.blob} ${styles.blobBottomRight}`} aria-hidden />

      {/* nuvens (deslizam pros lados no scroll) */}
      <motion.div className={`${styles.deco} ${styles.cloud1}`} style={{ x: cloudsLeftX }}>
        <FloatingAsset src="/assets/nuvem-1.png" width={150} duration={5} floatRange={10} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.cloud2}`} style={{ x: cloudsRightX }}>
        <FloatingAsset src="/assets/nuvem-2.png" width={120} duration={5.5} floatRange={9} delay={0.4} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.cloud3}`} style={{ x: cloudsLeftX }}>
        <FloatingAsset src="/assets/nuvem-3.png" width={130} duration={6} floatRange={11} delay={0.8} />
      </motion.div>

      {/* arco-íris */}
      <motion.div className={`${styles.deco} ${styles.rainbow1}`} style={{ x: cloudsLeftX, opacity: crownsOpacity }}>
        <FloatingAsset src="/assets/arco-iris-1.png" width={150} duration={6} floatRange={8} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.rainbow2}`} style={{ x: cloudsRightX, opacity: crownsOpacity }}>
        <FloatingAsset src="/assets/arco-iris-2.png" width={140} duration={6.5} floatRange={8} delay={0.5} />
      </motion.div>

      {/* coroas (sobem e somem) */}
      <motion.div className={`${styles.deco} ${styles.crown1}`} style={{ y: crownsY, opacity: crownsOpacity }}>
        <FloatingAsset src="/assets/coroa-1.png" width={120} duration={4.5} floatRange={9} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.crown2}`} style={{ y: crownsY, opacity: crownsOpacity }}>
        <FloatingAsset src="/assets/coroa-2.png" width={84} duration={5} floatRange={8} delay={0.3} />
      </motion.div>

      {/* estrelinhas (encolhem e desaparecem) */}
      <motion.div className={`${styles.deco} ${styles.star1}`} style={{ scale: starsScale, opacity: starsOpacity }}>
        <FloatingAsset src="/assets/estrela-1.png" width={46} duration={3} floatRange={7} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.star2}`} style={{ scale: starsScale, opacity: starsOpacity }}>
        <FloatingAsset src="/assets/estrela-2.png" width={40} duration={3.4} floatRange={7} delay={0.3} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.star3}`} style={{ scale: starsScale, opacity: starsOpacity }}>
        <FloatingAsset src="/assets/brilho-1.png" width={34} duration={2.8} floatRange={6} delay={0.6} />
      </motion.div>
      <motion.div className={`${styles.deco} ${styles.star4}`} style={{ scale: starsScale, opacity: starsOpacity }}>
        <FloatingAsset src="/assets/estrela-1.png" width={32} duration={3.2} floatRange={6} delay={0.9} />
      </motion.div>

      {/* texto central */}
      <motion.div className={styles.center} style={{ y: textY, opacity: textOpacity }}>
        <Sticker src="/assets/fita-save-the-date.png" width={210} className={styles.ribbon} alt="Save the date" />
        <h1 className={styles.nomes}>
          Catarina <span className={styles.e}>&amp;</span> Lucia
        </h1>
        <p className={styles.sub}>Festa de aniversário</p>
        <p className={styles.evento}>24 de junho · 13h</p>
        <p className={styles.local}>
          R. Palmares, 196 — Parque Industrial
          <br />
          São José dos Campos
        </p>
      </motion.div>

      {/* balões (sobem e somem) */}
      <motion.div className={styles.balloons} style={{ y: balloonsY, opacity: balloonsOpacity }}>
        <FloatingAsset src="/assets/balao-rosa.png" width={92} duration={4} floatRange={14} />
        <FloatingAsset src="/assets/balao-amarelo.png" width={80} duration={4.6} floatRange={16} delay={0.3} />
        <FloatingAsset src="/assets/balao-lilas.png" width={86} duration={5.2} floatRange={15} delay={0.6} />
      </motion.div>
    </section>
  );
}
