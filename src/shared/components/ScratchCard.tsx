import { useEffect, useRef, useState, useCallback } from 'react';
import { Gift, Star, Zap, Award, Sparkles, Frown } from 'lucide-react';
import { Modal } from './UI';

// ─── Prize pool ──────────────────────────────────────────────────────────────
const PRIZES = [
  { points: 0,   label: 'Better Luck Next Time', icon: Frown,    color: 'from-slate-400 to-slate-600',    chance: 50 },
  { points: 1,  label: '1 Bonus Points',        icon: Star,     color: 'from-yellow-400 to-orange-400',  chance: 20 },
  { points: 2,  label: '2 Bonus Points',        icon: Zap,      color: 'from-cyan-400 to-blue-400',      chance: 13 },
  { points: 5,  label: '5 Bonus Points',        icon: Gift,     color: 'from-purple-400 to-pink-400',    chance: 9  },
  { points: 10, label: '10 Bonus Points',       icon: Award,    color: 'from-emerald-400 to-teal-400',   chance: 5  },
  { points: 20, label: '20 Bonus Points',       icon: Sparkles, color: 'from-rose-400 to-red-400',       chance: 2  },
  { points: 50, label: '🎉 JACKPOT! 50 Pts',   icon: Sparkles, color: 'from-yellow-300 to-yellow-500',  chance: 1  },
];

function pickPrize() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.chance;
    if (roll < cumulative) return prize;
  }
  return PRIZES[0];
}

// ─── Canvas scratch surface ───────────────────────────────────────────────────
const SCRATCH_THRESHOLD = 0.50;
const PRIZE_HEIGHT = 140;

interface ScratchCanvasProps {
  onRevealed: () => void;
}

function ScratchCanvas({ onRevealed }: ScratchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const revealed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Silver gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#94a3b8');
    grad.addColorStop(0.3, '#e2e8f0');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(0.7, '#e2e8f0');
    grad.addColorStop(1,   '#94a3b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sparkle dots
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    ctx.textAlign = 'center';
    ctx.font = '30px serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('🪙', w / 2, h / 2 - 12);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Scratch to Reveal!', w / 2, h / 2 + 10);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Drag your finger / mouse here', w / 2, h / 2 + 28);
  }, []);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const erase = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!drawing.current || revealed.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Sample every 4th pixel for performance
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0, total = 0;
    for (let i = 3; i < data.length; i += 16) {
      total++;
      if (data[i] < 128) transparent++;
    }
    if (transparent / total > SCRATCH_THRESHOLD && !revealed.current) {
      revealed.current = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onRevealed();
    }
  }, [onRevealed]);

  const startDraw = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if ('touches' in e) e.preventDefault();
    drawing.current = true;
    erase(e as React.MouseEvent<HTMLCanvasElement>);
  }, [erase]);

  const stopDraw = useCallback(() => { drawing.current = false; }, []);

  return (
    <canvas
      ref={canvasRef}
      // 2× intrinsic resolution for retina sharpness
      width={600}
      height={PRIZE_HEIGHT * 2}
      style={{
        display: 'block',
        width: '100%',
        height: `${PRIZE_HEIGHT}px`,
        cursor: 'crosshair',
        touchAction: 'none',
      }}
      onMouseDown={startDraw}
      onMouseUp={stopDraw}
      onMouseLeave={stopDraw}
      onMouseMove={erase}
      onTouchStart={startDraw}
      onTouchEnd={stopDraw}
      onTouchMove={erase}
    />
  );
}

// ─── Public modal ─────────────────────────────────────────────────────────────
interface ScratchCardModalProps {
  open: boolean;
  onClose: () => void;
  triggerType: 'recharge' | 'transfer';
  amount: number;
  onPointsEarned?: (pts: number) => void;
}

export function ScratchCardModal({
  open, onClose, triggerType, amount, onPointsEarned,
}: ScratchCardModalProps) {
  const [sessionKey, setSessionKey] = useState(0);
  const [prize,      setPrize]      = useState(() => pickPrize());
  const [scratched,  setScratched]  = useState(false);
  const [claimed,    setClaimed]    = useState(false);

  // Fresh prize + canvas every open
  useEffect(() => {
    if (open) {
      setPrize(pickPrize());
      setScratched(false);
      setClaimed(false);
      setSessionKey(k => k + 1);
    }
  }, [open]);

  const handleRevealed = useCallback(() => setScratched(true), []);

  const handleClaim = () => {
    setClaimed(true);
    if (prize.points > 0) onPointsEarned?.(prize.points);
    setTimeout(onClose, 1800);
  };

  const PrizeIcon = prize.icon;
  const isWin = prize.points > 0;

  return (
    <Modal
      open={open}
      onClose={scratched ? onClose : () => {}}
      title={triggerType === 'recharge' ? '🎁 Recharge Reward!' : '🎁 Transfer Reward!'}
    >
      <div className="space-y-4">
        {/* Context */}
        <p className="text-center text-sm text-[var(--text-muted)]">
          You {triggerType === 'recharge' ? 'added' : 'transferred'}{' '}
          <span className="font-bold text-[var(--text)] font-mono">
            ₹{Number(amount).toLocaleString('en-IN')}
          </span>{' '}
          — scratch to reveal your bonus!
        </p>

        {/* Scratch zone */}
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[var(--border)]"
          style={{ height: PRIZE_HEIGHT }}
        >
          {/* Prize always in DOM underneath */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${prize.color} flex flex-col items-center justify-center gap-1.5`}
          >
            <PrizeIcon className="w-10 h-10 text-white drop-shadow-lg" />
            <p className="text-white font-extrabold text-lg drop-shadow">{prize.label}</p>
            {isWin && <p className="text-white/80 text-xs">Bonus Reward Points</p>}
          </div>

          {/* Canvas overlay — remounted each open via key */}
          {!scratched && (
            <div className="absolute inset-0" key={sessionKey}>
              <ScratchCanvas onRevealed={handleRevealed} />
            </div>
          )}
        </div>

        {/* Controls */}
        {!scratched ? (
          <p className="text-center text-xs text-[var(--text-muted)] animate-pulse">
            👆 Drag your finger / mouse to scratch
          </p>
        ) : claimed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isWin ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {isWin
                ? <Star className="w-8 h-8 text-emerald-500" />
                : <Frown className="w-8 h-8 text-slate-400" />
              }
            </div>
            <p className={`font-bold ${isWin ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
              {isWin ? `+${prize.points} points added! 🎉` : 'Try again next time!'}
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={onClose}>Skip</button>
            <button className="btn-primary flex-1" onClick={handleClaim}>
              {isWin
                ? <><Gift className="w-4 h-4" /> Claim {prize.points} Points</>
                : <>OK, Got it</>
              }
            </button>
          </div>
        )}

        <p className="text-center text-[10px] text-[var(--text-muted)]">
          Points are awarded per transaction · Max 1 scratch card per transaction
        </p>
      </div>
    </Modal>
  );
}