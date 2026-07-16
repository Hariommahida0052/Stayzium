import React from 'react';

const SQUARE_GRID_BLOCKS = ["█", "▓", "▒"];

function SquareGrid({
  className = "",
  blocks = SQUARE_GRID_BLOCKS,
  size = 5,
  track = "░",
  style,
  ...props
}) {
  const cells = Math.max(2, Math.floor(size));
  const glyphs = SQUARE_GRID_BLOCKS.map(
    (_, index) => blocks[index] ?? SQUARE_GRID_BLOCKS[index]
  );
  const gridCells = Array.from({ length: cells * cells }, (_, index) => {
    const row = Math.floor(index / cells);
    const col = index % cells;

    return row === 0 || row === cells - 1 || col === 0 || col === cells - 1
      ? track
      : " ";
  });

  return (
    <>
      <style>{`
        @keyframes loading-ui-square-grid {
          0%,
          100% {
            transform: translate(0, 0);
          }

          25% {
            transform: translate(var(--loader-x), 0);
          }

          50% {
            transform: translate(var(--loader-x), var(--loader-y));
          }

          75% {
            transform: translate(0, var(--loader-y));
          }
        }
      `}</style>
      <span
        role="status"
        className={["relative inline-flex overflow-hidden font-mono text-xl leading-none text-current select-none", className].filter(Boolean).join(" ")}
        style={{
          height: 'var(--loader-size)',
          width: 'var(--loader-size)',
          "--loader-size": `${cells}ch`,
          "--loader-x": `${cells - 1}ch`,
          "--loader-y": `${cells - 1}ch`,
          ...style,
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${cells}, 1ch)`,
            gridTemplateRows: `repeat(${cells}, 1ch)`,
          }}
        >
          {gridCells.map((glyph, index) => (
            <span
              key={index}
              className="flex h-[1ch] w-[1ch] items-center justify-center"
            >
              {glyph}
            </span>
          ))}
        </span>
        {glyphs.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            aria-hidden="true"
            className={`pointer-events-none absolute top-0 left-0 flex h-[1ch] w-[1ch] items-center justify-center ${["z-30", "z-20", "z-10"][index]}`}
            style={{
              animation: "loading-ui-square-grid var(--duration, 2.8s) linear infinite",
              animationDelay: `calc(var(--delay, 0.06s) * ${index})`,
              backgroundColor: "var(--mask-color, #f9fafb)",
            }}
          >
            {glyph}
          </span>
        ))}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

const Loader = ({ text = "Loading...", fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="flex items-center gap-8">
        <SquareGrid className="text-[#2563eb]" size={5} />
        <SquareGrid className="text-[#16a34a]" size={5} />
        <SquareGrid className="text-[#e11d48]" size={5} />
      </div>
      {text && <p className="text-gray-600 font-medium animate-pulse tracking-wide">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-16 flex items-center justify-center w-full">
      {content}
    </div>
  );
};

export default Loader;
