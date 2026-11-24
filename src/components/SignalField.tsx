import { useEffect, useRef } from 'react';

// Decorative perspective mesh. It never represents survey measurements.
export function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const context = canvas.getContext('2d');
      if (!context || !width || !height) return;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale * width / 700, 0, 0, scale * height / 290, 0, 0);
      const point = (column: number, row: number) => {
        const u = column / 104;
        const v = row / 42;
        const wave = Math.sin(u * 9.2 - v * 4.4 + 0.4) * 0.54
          + Math.cos(u * 6.1 + v * 2.65) * 0.46;
        return { x: u * 780 + (v - 0.5) * 142 - 25,
          y: 107 + v * 150 - wave * (63 + u * 46) - u * 44 };
      };
      for (let row = 0; row <= 42; row++) {
        const v = row / 42;
        context.beginPath();
        for (let col = 0; col <= 104; col++) {
          const p = point(col, row);
          if (col === 0) context.moveTo(p.x, p.y);
          else context.lineTo(p.x, p.y);
        }
        context.strokeStyle = 'rgba(110,180,255,' + (0.09 + v * 0.15) + ')';
        context.lineWidth = 0.62;
        context.stroke();
        for (let col = 0; col <= 104; col++) {
          const p = point(col, row);
          const hue = 181 + 63 * (1 - col / 104) + Math.sin(v * 3.9) * 6;
          context.fillStyle = 'hsla(' + hue + ',99%,73%,' + (0.35 + 0.5 * v) + ')';
          context.beginPath();
          context.arc(p.x, p.y, 0.55 + v * 0.66, 0, 2 * Math.PI);
          context.fill();
        }
      }
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, []);
  return <canvas className="signal-field" ref={ref} aria-hidden="true" />;
}

