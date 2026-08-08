'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
};

const toKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const fromKey = (value: string) => new Date(`${value}T00:00:00`);
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const fmt = (value: string) => {
  const date = fromKey(value);
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return `${weekdays[date.getDay()]} ${date.getDate()} Th${String(date.getMonth() + 1).padStart(2, '0')} ${date.getFullYear()}`;
};

export function DateRangePicker({ checkIn, checkOut, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [cursor, setCursor] = useState(() => new Date(fromKey(checkIn).getFullYear(), fromKey(checkIn).getMonth(), 1));
  const root = useRef<HTMLDivElement>(null);
  const today = useMemo(() => fromKey(toKey(new Date())), []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const choose = (date: Date) => {
    if (date < today) return;
    const key = toKey(date);
    if (!selectingEnd || key <= checkIn) {
      onChange(key, toKey(addDays(date, 1)));
      setSelectingEnd(true);
    } else {
      onChange(checkIn, key);
      setSelectingEnd(false);
      setOpen(false);
    }
  };

  const nights = Math.max(1, Math.round((fromKey(checkOut).getTime() - fromKey(checkIn).getTime()) / 86400000));

  return <div ref={root} className="relative col-span-2 grid grid-cols-2">
    <button type="button" onClick={() => { setOpen(true); setSelectingEnd(false); }} className="min-w-0 px-4 py-4 text-left md:px-5">
      <span className="block text-xs font-medium text-orange-600">Nhận phòng</span>
      <span className="mt-1 block truncate text-sm font-medium text-gray-900">{fmt(checkIn)}</span>
    </button>
    <button type="button" onClick={() => { setOpen(true); setSelectingEnd(true); }} className="min-w-0 border-l border-gray-200 px-4 py-4 text-left md:px-5">
      <span className="block text-xs font-medium text-orange-600">Trả phòng</span>
      <span className="mt-1 block truncate text-sm font-medium text-gray-900">{fmt(checkOut)}</span>
    </button>

    {open && <>
      <button type="button" aria-label="Đóng lịch" onClick={() => setOpen(false)} className="fixed inset-0 -z-10 cursor-default bg-black/30 backdrop-blur-[1px]" />
      <div className="absolute left-0 top-[calc(100%+20px)] z-50 w-[min(740px,calc(100vw-28px))] rounded-[18px] border border-gray-100 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,.22)] sm:p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <Month month={cursor} checkIn={checkIn} checkOut={checkOut} today={today} choose={choose} previous={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} />
        <div className="hidden md:block"><Month month={new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)} checkIn={checkIn} checkOut={checkOut} today={today} choose={choose} next={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} /></div>
      </div>
      <div className="mt-5 flex flex-col gap-1 border-t pt-4 text-right">
        <strong className="text-sm">{fmt(checkIn)} – {fmt(checkOut)} ({nights} đêm)</strong>
        <span className="text-xs text-gray-400">Tất cả ngày giờ theo giờ địa phương</span>
      </div>
      </div>
    </>}
  </div>;
}

function Month({month,checkIn,checkOut,today,choose,previous,next}:{month:Date;checkIn:string;checkOut:string;today:Date;choose:(d:Date)=>void;previous?:()=>void;next?:()=>void}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({length: count}, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  return <div>
    <div className="mb-5 flex items-center justify-between">
      <button type="button" aria-label="Tháng trước" onClick={previous} className={`rounded-full p-2 hover:bg-gray-100 ${previous ? '' : 'invisible'}`}><ChevronLeft /></button>
      <h3 className="text-lg font-semibold capitalize">Tháng {month.getMonth()+1} {month.getFullYear()}</h3>
      <button type="button" aria-label="Tháng sau" onClick={next} className={`rounded-full p-2 hover:bg-gray-100 ${next ? '' : 'invisible'}`}><ChevronRight /></button>
    </div>
    <div className="grid grid-cols-7 text-center text-xs text-gray-500">{['T2','T3','T4','T5','T6','T7','CN'].map(d=><span className="pb-3" key={d}>{d}</span>)}</div>
    <div className="grid grid-cols-7 gap-y-1">{cells.map((date,i) => {
      if (!date) return <span key={`blank-${i}`} />;
      const key=toKey(date); const disabled=date<today; const edge=key===checkIn||key===checkOut; const inRange=key>checkIn&&key<checkOut;
      return <button type="button" key={key} disabled={disabled} onClick={()=>choose(date)} className={`relative mx-auto grid h-10 w-10 place-items-center rounded-full text-sm transition ${disabled?'cursor-not-allowed text-gray-300':edge?'bg-orange-600 font-semibold text-white shadow-md':inRange?'bg-orange-50 text-orange-700 hover:bg-orange-100':'hover:bg-gray-100'}`}>{date.getDate()}</button>;
    })}</div>
  </div>;
}
