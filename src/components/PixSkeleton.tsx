// Mock fofo de QR code (rosa pastel) que fica no lugar do QR até o Pix ser gerado.
// Padrão determinístico (sem Math.random) — só decorativo.
export function PixSkeleton() {
  const N = 13;
  const cell = 15;
  const pad = 10;
  const size = N * cell + pad * 2;

  const isFinder = (x: number, y: number) =>
    (x < 3 && y < 3) || (x >= N - 3 && y < 3) || (x < 3 && y >= N - 3);

  const modules: { x: number; y: number }[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isFinder(x, y)) continue;
      if ((x * 3 + y * 7 + x * y * 2) % 5 < 2) modules.push({ x, y });
    }
  }

  const finder = (fx: number, fy: number) => {
    const ox = pad + fx * cell;
    const oy = pad + fy * cell;
    return (
      <g key={`f-${fx}-${fy}`}>
        <rect x={ox} y={oy} width={cell * 3} height={cell * 3} rx={9} fill="var(--rosa-forte)" />
        <rect x={ox + cell * 0.55} y={oy + cell * 0.55} width={cell * 1.9} height={cell * 1.9} rx={6} fill="var(--creme)" />
        <rect x={ox + cell} y={oy + cell} width={cell} height={cell} rx={4} fill="var(--rosa-forte)" />
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="esqueleto do QR do Pix"
      style={{ display: "block" }}
    >
      {modules.map((m, i) => (
        <rect
          key={i}
          x={pad + m.x * cell + 1.5}
          y={pad + m.y * cell + 1.5}
          width={cell - 3}
          height={cell - 3}
          rx={4}
          fill="var(--rosa)"
        />
      ))}
      {finder(0, 0)}
      {finder(N - 3, 0)}
      {finder(0, N - 3)}
    </svg>
  );
}
