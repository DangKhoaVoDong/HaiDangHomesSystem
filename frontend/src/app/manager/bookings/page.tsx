'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, Loader2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi, getApiData, getApiError } from '@/lib/api';

const statuses: Record<number,{label:string,style:string}> = {
  0:{label:'Chờ xử lý',style:'bg-amber-100 text-amber-700'},
  1:{label:'Đã xác nhận',style:'bg-green-100 text-green-700'},
  4:{label:'Đã từ chối',style:'bg-red-100 text-red-700'},
};

function statusNumber(status: number | string): number {
  if (typeof status === 'number') return status;
  const values: Record<string, number> = {
    Pending: 0,
    Confirmed: 1,
    CheckedIn: 2,
    Completed: 3,
    Cancelled: 4,
    Refunded: 5,
  };
  return values[status] ?? -1;
}

export function BookingManagementView({adminMode=false}:{adminMode?:boolean}) {
  const qc=useQueryClient();
  const [tab,setTab]=useState<number|null>(null);
  const [search,setSearch]=useState('');
  const [date,setDate]=useState('');
  const [decision,setDecision]=useState<{booking:any,status:number}|null>(null);
  const [note,setNote]=useState('');
  const query=useQuery({queryKey:['booking-requests',tab],queryFn:()=>bookingsApi.getAll({page:1,pageSize:200,status:tab??undefined})});
  const items:any[]=(getApiData(query.data) as any)?.items??[];
  const shown=useMemo(()=>items.filter(b=>{
    const hay=`${b.bookingCode} ${b.guestFullName||b.userName} ${b.guestEmail||b.userEmail} ${b.guestPhone}`.toLowerCase();
    return (!search||hay.includes(search.toLowerCase()))&&(!date||String(b.checkInDate).slice(0,10)===date);
  }),[items,search,date]);
  const update=useMutation({mutationFn:()=>bookingsApi.updateStatus(decision!.booking.id,decision!.status,note||undefined),onSuccess:r=>{if(getApiData(r)){toast.success('Đã lưu quyết định');setDecision(null);setNote('');qc.invalidateQueries({queryKey:['booking-requests']})}else toast.error(getApiError(r))},onError:e=>toast.error(getApiError(e))});

  return <main className="min-h-screen bg-[#faf8f7] p-4 sm:p-7 lg:p-10">
    <div className="mx-auto max-w-7xl"><div><h1 className="text-3xl font-semibold">Yêu cầu đặt phòng</h1><p className="mt-1 text-gray-500">Tiếp nhận, xác nhận hoặc từ chối yêu cầu của khách hàng.</p></div>
    <div className="mt-7 flex gap-2 overflow-x-auto border-b">{[{v:null,l:'Tất cả'},{v:0,l:'Chờ xử lý'},{v:1,l:'Đã xác nhận'},{v:4,l:'Đã từ chối'}].map(t=><button key={String(t.v)} onClick={()=>setTab(t.v)} className={`shrink-0 border-b-2 px-5 py-3 ${tab===t.v?'border-orange-600 font-semibold text-orange-600':'border-transparent'}`}>{t.l}</button>)}</div>
    <div className="my-5 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_250px]"><label className="flex items-center gap-2 rounded-lg border px-3"><Search className="h-4 w-4 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full py-3 outline-none" placeholder="Tìm mã, tên, email, số điện thoại..."/></label><label className="flex items-center gap-2 rounded-lg border px-3"><Calendar className="h-4 w-4 text-gray-400"/><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full py-3 outline-none"/></label></div>
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">{query.isLoading?<div className="grid place-items-center py-20"><Loader2 className="animate-spin text-orange-600"/></div>:shown.length===0?<div className="py-20 text-center text-gray-500">Không có yêu cầu phù hợp.</div>:<div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr>{['Mã yêu cầu','Khách hàng','Căn nhà / Phòng','Thời gian','Yêu cầu bổ sung','Tổng tiền','Trạng thái','Thao tác'].map(x=><th className="px-4 py-3" key={x}>{x}</th>)}</tr></thead><tbody className="divide-y">{shown.map(b=>{const normalizedStatus=statusNumber(b.status);const st=statuses[normalizedStatus]??{label:`Trạng thái ${b.status}`,style:'bg-gray-100'};return <tr key={b.id} className="align-top hover:bg-gray-50"><td className="px-4 py-4 font-mono">{b.bookingCode}</td><td className="px-4 py-4"><b>{b.guestFullName||b.userName}</b><p>{b.guestEmail||b.userEmail}</p><p>{b.guestPhone}</p></td><td className="px-4 py-4"><b>{b.propertyName}</b><p>{b.roomName}</p><p>{b.numberOfGuests} khách</p></td><td className="px-4 py-4">{new Date(b.checkInDate).toLocaleDateString('vi-VN')}<br/>đến {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</td><td className="max-w-[220px] px-4 py-4 whitespace-pre-wrap">{b.specialRequests||'—'}{b.adminNote&&<p className="mt-2 text-xs text-gray-500">Ghi chú nội bộ: {b.adminNote}</p>}</td><td className="px-4 py-4 font-semibold">{Number(b.finalPrice).toLocaleString('vi-VN')}đ</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs ${st.style}`}>{st.label}</span></td><td className="px-4 py-4">{normalizedStatus===0?<div className="flex gap-2"><button onClick={()=>setDecision({booking:b,status:1})} className="rounded-lg bg-green-600 p-2 text-white" title="Xác nhận"><Check className="h-4 w-4"/></button><button onClick={()=>setDecision({booking:b,status:4})} className="rounded-lg bg-red-600 p-2 text-white" title="Từ chối"><X className="h-4 w-4"/></button></div>:<span className="text-xs text-gray-400">Đã xử lý</span>}</td></tr>})}</tbody></table></div>}</div></div>
    {decision&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6"><h2 className="text-xl font-semibold">{decision.status===1?'Xác nhận yêu cầu':'Từ chối yêu cầu'}</h2><p className="mt-2 text-sm text-gray-500">{decision.booking.bookingCode} · {decision.booking.roomName}</p><label className="mt-5 block text-sm font-medium">Lý do / ghi chú nội bộ (không bắt buộc)<textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border p-3 outline-orange-500"/></label><div className="mt-5 flex justify-end gap-3"><button onClick={()=>{setDecision(null);setNote('')}} className="rounded-lg border px-5 py-2">Hủy</button><button disabled={update.isPending} onClick={()=>update.mutate()} className={`rounded-lg px-5 py-2 text-white ${decision.status===1?'bg-green-600':'bg-red-600'}`}>{update.isPending?'Đang lưu...':'Xác nhận'}</button></div></div></div>}
  </main>;
}

export default function ManagerBookingsPage(){return <BookingManagementView/>}
