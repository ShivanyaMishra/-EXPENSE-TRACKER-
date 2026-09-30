import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, ExpenseCategory } from '../../types/finance';
import { 
  Box, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Filter, 
  Layers, 
  Info,
  Maximize2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../../utils/analytics';

export const ThreeDAnalyticsView: React.FC = () => {
  const { monthTransactions, transactions, selectedMonth } = useFinance();

  const [scope, setScope] = useState<'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [renderMode, setRenderMode] = useState<'scatter' | 'pillars'>('scatter');

  // Interactive 3D Camera Controls
  const [rotX, setRotX] = useState<number>(25); // degrees
  const [rotY, setRotY] = useState<number>(-35); // degrees
  const [zoom, setZoom] = useState<number>(1.1);

  // Hover state
  const [hoveredTx, setHoveredTx] = useState<{
    tx: Transaction;
    screenX: number;
    screenY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  const activeTransactions = useMemo(() => {
    const list = (scope === 'month' ? monthTransactions : transactions).filter(t => !t.isIncome);
    if (selectedCategory !== 'ALL') {
      return list.filter(t => t.category === selectedCategory);
    }
    return list;
  }, [scope, monthTransactions, transactions, selectedCategory]);

  const categories: ExpenseCategory[] = [
    'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Other'
  ];

  const categoryColorMap: Record<string, string> = {
    'Food': '#06b6d4', // cyan
    'Transport': '#3b82f6', // blue
    'Bills': '#8b5cf6', // purple
    'Shopping': '#ec4899', // pink
    'Entertainment': '#f59e0b', // amber
    'Health': '#10b981', // emerald
    'Other': '#94a3b8', // slate
  };

  // 3D Canvas Projection Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Center of 3D universe
    const cx = width / 2;
    const cy = height / 2 + 30;

    // Rotation angles in radians
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    // 3D Rotation Function
    const project3D = (x: number, y: number, z: number) => {
      // Rotate around Y
      const x1 = x * cosY + z * sinY;
      const y1 = y;
      const z1 = -x * sinY + z * cosY;

      // Rotate around X
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 800;
      const scale = (cameraDistance / (cameraDistance + z2)) * zoom;

      return {
        px: cx + x2 * scale,
        py: cy - y2 * scale, // invert Y for screen
        depth: z2,
        scale,
      };
    };

    // Draw 3D Base Grid (X = Date, Z = Category)
    const gridSize = 240;
    const gridLines = 6;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridLines; i++) {
      const coord = -gridSize + (i * 2 * gridSize) / gridLines;

      // Lines along Z
      const p1 = project3D(coord, 0, -gridSize);
      const p2 = project3D(coord, 0, gridSize);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      // Lines along X
      const p3 = project3D(-gridSize, 0, coord);
      const p4 = project3D(gridSize, 0, coord);
      ctx.beginPath();
      ctx.moveTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.stroke();
    }

    // Draw Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    const axisX = project3D(gridSize + 25, 0, 0);
    ctx.fillText('X: Date ➜', axisX.px, axisX.py);

    const axisZ = project3D(0, 0, gridSize + 25);
    ctx.fillText('Z: Category ➜', axisZ.px, axisZ.py);

    const axisY = project3D(0, 260, 0);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText('▲ Y: Amount (₹)', axisY.px - 30, axisY.py - 10);

    // Map transactions to 3D Space
    // X: Day of month (1 to 31) -> mapped to -gridSize to gridSize
    // Y: Amount (0 to max) -> mapped to 0 to 220
    // Z: Category index (0 to 6) -> mapped to -gridSize to gridSize
    const maxAmount = Math.max(1000, ...activeTransactions.map(t => t.amount));

    const renderedPoints: Array<{
      tx: Transaction;
      screenX: number;
      screenY: number;
      radius: number;
      depth: number;
      color: string;
      baseX: number;
      baseY: number;
    }> = [];

    activeTransactions.forEach((tx) => {
      const day = parseInt(tx.date.split('-')[2] || '1', 10);
      const normX = ((day - 1) / 30) * 2 - 1; // -1 to 1
      const x3d = normX * (gridSize * 0.85);

      const normY = Math.min(1, tx.amount / maxAmount);
      const y3d = normY * 200 + 10;

      const catIdx = categories.indexOf(tx.category);
      const normZ = catIdx >= 0 ? (catIdx / (categories.length - 1)) * 2 - 1 : 0;
      const z3d = normZ * (gridSize * 0.8);

      const proj = project3D(x3d, y3d, z3d);
      const baseProj = project3D(x3d, 0, z3d);

      const color = categoryColorMap[tx.category] || '#94a3b8';

      renderedPoints.push({
        tx,
        screenX: proj.px,
        screenY: proj.py,
        radius: Math.max(4, Math.min(12, (tx.amount / maxAmount) * 12 + 4)) * proj.scale,
        depth: proj.depth,
        color,
        baseX: baseProj.px,
        baseY: baseProj.py,
      });
    });

    // Sort by depth (painter's algorithm)
    renderedPoints.sort((a, b) => b.depth - a.depth);

    // Draw points & pillars
    renderedPoints.forEach((pt) => {
      // If pillar mode, draw vertical light beam from base to point
      if (renderMode === 'pillars') {
        ctx.strokeStyle = `${pt.color}55`;
        ctx.lineWidth = Math.max(1, 3 * (canvas.width / 1000));
        ctx.beginPath();
        ctx.moveTo(pt.baseX, pt.baseY);
        ctx.lineTo(pt.screenX, pt.screenY);
        ctx.stroke();

        // Base foot circle
        ctx.fillStyle = `${pt.color}44`;
        ctx.beginPath();
        ctx.ellipse(pt.baseX, pt.baseY, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Drop shadow line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.baseX, pt.baseY);
        ctx.lineTo(pt.screenX, pt.screenY);
        ctx.stroke();
      }

      // 3D Sphere Point
      const isHovered = hoveredTx?.tx.id === pt.tx.id;
      const radius = isHovered ? pt.radius * 1.4 : pt.radius;

      // Glow radial gradient
      const grad = ctx.createRadialGradient(
        pt.screenX - radius * 0.3,
        pt.screenY - radius * 0.3,
        radius * 0.1,
        pt.screenX,
        pt.screenY,
        radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, pt.color);
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.screenX, pt.screenY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow ring if hovered
      if (isHovered) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Save points for hit testing
    (canvas as any).__renderedPoints = renderedPoints;

  }, [activeTransactions, rotX, rotY, zoom, renderMode, hoveredTx]);

  // Mouse drag rotation handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      setRotY(prev => prev + dx * 0.5);
      setRotX(prev => Math.max(-60, Math.min(80, prev - dy * 0.5)));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover hit test
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const points = (canvas as any).__renderedPoints as Array<{
      tx: Transaction;
      screenX: number;
      screenY: number;
      radius: number;
    }> || [];

    let found: { tx: Transaction; screenX: number; screenY: number } | null = null;
    for (let i = points.length - 1; i >= 0; i--) {
      const pt = points[i];
      const dist = Math.hypot(pt.screenX - mouseX, pt.screenY - mouseY);
      if (dist <= pt.radius + 6) {
        found = { tx: pt.tx, screenX: pt.screenX, screenY: pt.screenY };
        break;
      }
    }
    setHoveredTx(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.6, Math.min(2.2, prev - e.deltaY * 0.0015)));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 3D Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-3xl p-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Interactive 3D Multi-Axis Visualization
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            3D Expense Spatial Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            X = Date / Time • Y = Amount (₹) • Z = Category Grouping
          </p>
        </div>

        {/* 3D Visualizer Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setRenderMode('scatter')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                renderMode === 'scatter' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              3D Scatter
            </button>
            <button
              onClick={() => setRenderMode('pillars')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                renderMode === 'pillars' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              3D Light Pillars
            </button>
          </div>

          <button
            onClick={() => {
              setRotX(25);
              setRotY(-35);
              setZoom(1.1);
            }}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
            title="Reset Camera Angle"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Timeline & Category filter */}
      <div className="glass-panel-subtle rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Timeline:</span>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 font-semibold">
            <button
              onClick={() => setScope('month')}
              className={`px-3 py-1 rounded-lg ${
                scope === 'month' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              {selectedMonth}
            </button>
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1 rounded-lg ${
                scope === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
              }`}
            >
              All History
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === c
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColorMap[c] }}
              />
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Interactive Canvas Container */}
      <div className="relative glass-panel rounded-3xl border border-slate-800 overflow-hidden h-[540px] flex items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Hover Tooltip (Requirement 10) */}
        {hoveredTx && (
          <div
            className="absolute z-20 pointer-events-none p-3.5 glass-panel-glow rounded-2xl border border-cyan-400 shadow-2xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${Math.min(window.innerWidth - 300, hoveredTx.screenX + 15)}px`,
              top: `${Math.max(20, hoveredTx.screenY - 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white text-sm">{hoveredTx.tx.description}</span>
              <span className="font-mono font-bold text-cyan-300">
                {formatCurrency(hoveredTx.tx.amount)}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <p>Category: <strong className="text-white">{hoveredTx.tx.category}</strong></p>
              <p>Date: <strong className="text-white">{hoveredTx.tx.date}</strong></p>
              <p>Method: <span className="text-slate-400">{hoveredTx.tx.paymentMethod}</span></p>
            </div>
          </div>
        )}

        {/* 3D Quick Guide Overlay */}
        <div className="absolute bottom-4 left-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 pointer-events-none">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> 3D Interaction:
          </p>
          <p>• Click & drag to rotate camera in all axes</p>
          <p>• Mouse wheel to zoom in / out</p>
          <p>• Hover any sphere to inspect full transaction details</p>
        </div>

        {/* Camera Info Widget */}
        <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400">
          <span>Pitch: {rotX.toFixed(0)}° • Yaw: {rotY.toFixed(0)}° • Zoom: {(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
