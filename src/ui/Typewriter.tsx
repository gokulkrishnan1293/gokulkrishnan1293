import { useEffect, useState } from "react";

export function Typewriter({
  text,
  speed = 26,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!text) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          onDone?.();
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  const done = n >= text.length;
  return (
    <span className={`${className} ${done ? "" : "caret"}`}>{text.slice(0, n)}</span>
  );
}
