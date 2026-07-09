import { useState, useEffect } from 'react';

interface Props {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function CountdownTimer({ targetDate }: Props) {
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(target));

  useEffect(() => {
    if (target <= Date.now()) return;
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (target <= Date.now()) {
    return <span className="text-emerald-400 text-sm font-medium">Live now</span>;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: pad(timeLeft.hours) },
        { label: 'Min', value: pad(timeLeft.minutes) },
        { label: 'Sec', value: pad(timeLeft.seconds) },
      ].map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-lg px-2 py-1 min-w-[36px] text-center">
            <span className="text-sm font-bold text-violet-400 tabular-nums">{unit.value}</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
