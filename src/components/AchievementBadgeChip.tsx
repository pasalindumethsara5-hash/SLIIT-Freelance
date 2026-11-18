import { Award, CheckCircle2, Flame, GraduationCap, HeartHandshake, Lock, ShieldCheck } from 'lucide-react';
import type { AchievementBadge, AchievementBadgeId } from '../types/marketplace';

interface AchievementBadgeChipProps {
  badge: AchievementBadge;
  variant?: 'compact' | 'card';
}

function BadgeIcon({ id, className }: { id: AchievementBadgeId; className?: string }) {
  switch (id) {
    case 'top_rated_seller':
      return <Award className={className} />;
    case 'kuppi_master':
      return <GraduationCap className={className} />;
    case 'verified_closer':
      return <CheckCircle2 className={className} />;
    case 'study_streak':
      return <Flame className={className} />;
    case 'free_mentor':
      return <HeartHandshake className={className} />;
    case 'campus_verified':
      return <ShieldCheck className={className} />;
  }
}

const TIER_STYLES: Record<
  AchievementBadge['tier'],
  { surface: string; medallion: string; title: string; progress: string }
> = {
  gold: {
    surface: 'bg-amber-50/90 border-amber-300/80',
    medallion: 'bg-amber-500 text-white shadow-xs',
    title: 'text-amber-950',
    progress: 'text-amber-800',
  },
  navy: {
    surface: 'bg-slate-100/90 border-slate-300/80',
    medallion: 'bg-[#0B1F3A] text-white shadow-xs',
    title: 'text-[#0B1F3A]',
    progress: 'text-slate-700',
  },
  emerald: {
    surface: 'bg-emerald-50/90 border-emerald-300/80',
    medallion: 'bg-emerald-700 text-white shadow-xs',
    title: 'text-emerald-950',
    progress: 'text-emerald-800',
  },
  sky: {
    surface: 'bg-sky-50/90 border-sky-300/80',
    medallion: 'bg-sky-700 text-white shadow-xs',
    title: 'text-sky-950',
    progress: 'text-sky-800',
  },
};

export function AchievementBadgeChip({ badge, variant = 'compact' }: AchievementBadgeChipProps) {
  const palette = TIER_STYLES[badge.tier];

  if (variant === 'compact') {
    return (
      <span
        title={`${badge.label} — ${badge.progressLabel}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-semibold whitespace-nowrap shrink-0 ${
          badge.earned ? `${palette.surface} ${palette.title}` : 'bg-white/60 border-slate-200 text-slate-500'
        }`}
      >
        <span
          className={`w-4 h-4 rounded-md inline-flex items-center justify-center shrink-0 ${
            badge.earned ? palette.medallion : 'bg-slate-200 text-slate-500'
          }`}
        >
          <BadgeIcon id={badge.id} className="w-2.5 h-2.5" />
        </span>
        <span>{badge.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-colors ${
        badge.earned
          ? palette.surface
          : 'bg-white/45 border-slate-200/80 opacity-80'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          badge.earned ? palette.medallion : 'bg-slate-200/80 text-slate-500'
        }`}
      >
        {badge.earned ? <BadgeIcon id={badge.id} className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className={`text-sm font-bold leading-snug ${badge.earned ? palette.title : 'text-slate-700'}`}>
            {badge.label}
          </div>
          <span
            className={`font-mono-num text-[11px] font-semibold whitespace-nowrap shrink-0 ${
              badge.earned ? palette.progress : 'text-slate-500'
            }`}
          >
            {badge.earned ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{badge.description}</p>
        <div
          className={`mt-1.5 font-mono-num text-[11px] font-semibold ${
            badge.earned ? palette.progress : 'text-slate-500'
          }`}
        >
          {badge.progressLabel}
        </div>
      </div>
    </div>
  );
}
