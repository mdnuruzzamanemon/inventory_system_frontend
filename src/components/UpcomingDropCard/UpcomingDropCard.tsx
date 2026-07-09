import type { Drop } from '../../types';
import CountdownTimer from '../CountdownTimer/CountdownTimer';

interface Props {
  drop: Drop;
}

export default function UpcomingDropCard({ drop }: Props) {
  return (
    <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{drop.name}</h3>
          {drop.description && (
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{drop.description}</p>
          )}
        </div>
        <span className="shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider bg-gray-800 text-gray-400 rounded-full">
          Upcoming
        </span>
      </div>

      <div className="flex items-center gap-4">
        <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <CountdownTimer targetDate={drop.startTime} />
      </div>

      <div className="flex flex-wrap gap-2">
        {drop.products.map((p) => (
          <span
            key={p.id}
            className="px-3 py-1.5 bg-gray-800/50 rounded-lg text-sm text-gray-300"
          >
            {p.name} — <span className="text-violet-400 font-medium">${Number(p.price).toFixed(2)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
