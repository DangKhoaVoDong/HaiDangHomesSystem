'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { CalendarDays, Check, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingsApi, getApiData, getApiError, roomsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

const today = new Date().toISOString().slice(0,10);

export default function BookingPage() {
  const { id } = useParams<{id:string}>();
  const search = useSearchParams();
  const user = useAuthStore(s => s.user);
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [checkIn, setCheckIn] = useState(search.get('checkIn') || today);
  const [checkOut, setCheckOut] = useState(search.get('checkOut') || new Date(Date.now()+86400000).toISOString().slice(0,10));
  const [guests, setGuests] = useState(Number(search.get('guests') || 1));
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phoneNumber || '', note: '' });
  const roomQuery = useQuery({queryKey:['room',id],queryFn:()=>roomsApi.getById(id,{language:'vi'})});
  const room:any = getApiData(roomQuery.data);
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000));
  const total = Number(room?.pricePerNight || 0)*nights;

  const create = useMutation({
    mutationFn:()=>bookingsApi.create({roomId:id,checkInDate:checkIn,checkOutDate:checkOut,numberOfGuests:guests,specialRequests:form.note,guestFullName:form.fullName,guestEmail:form.email,guestPhone:form.phone}),
    onSuccess:r=>{const data=getApiData(r);if(data){setResult(data);setStep(3)}else toast.error(getApiError(r)||'Không thể gửi yêu cầu')},
    onError:e=>toast.error(getApiError(e)||'Phòng vừa hết, vui lòng chọn phòng khác.'),
  });

  const valid = useMemo(()=>form.fullName.trim() && /.+@.+\..+/.test(form.email) && form.phone.trim() && checkOut>checkIn && guests>0 && guests<=Number(room?.maxOccupancy||99),[form,checkIn,checkOut,guests,room]);
  const submit=(e:FormEvent)=>{e.preventDefault();if(!valid){toast.error('Vui lòng kiểm tra đầy đủ thông tin');return}setStep(2)};

  if(roomQuery.isLoading)return <div className="min-h-screen grid place-items-center">Đang tải...</div>;
  if(!room)return <div className="min-h-screen grid place-items-center">Không tìm thấy phòng.</div>;

  return <main className="min-h-screen bg-[#f7f7f7] pb-14">
    <div className="border-b bg-white"><div className="mx-auto flex w-full max-w-[1440px] items-center px-4 py-5 sm:px-8 lg:px-12">{['Thông tin khách hàng','Kiểm tra thông tin','Xác nhận đặt phòng'].map((label,i)=><div key={label} className={`flex flex-1 items-center gap-2 ${step>=i+1?'text-orange-600':'text-gray-400'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${step>=i+1?'bg-orange-600 text-white':'bg-gray-200'}`}>{i+1}</span><b className="hidden text-sm sm:block">{label}</b>{i<2&&<span className="mx-2 h-px flex-1 bg-gray-200"/>}</div>)}</div></div>
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12"><h1 className="text-3xl font-semibold">{step===3?'Yêu cầu đã được tiếp nhận':'Hoàn tất đặt phòng của bạn'}</h1><p className="mt-2 text-gray-600">{step===3?'Phòng đang được xem xét và chúng tôi sẽ liên hệ với bạn sớm nhất.':'Kiểm tra kỹ thông tin trước khi gửi yêu cầu giữ phòng.'}</p>

      {step===3 ? <section className="mt-7 rounded-2xl bg-white p-7 text-center shadow-sm"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-600"><Check className="h-8 w-8"/></span><h2 className="mt-5 text-2xl font-semibold">Cảm ơn bạn đã gửi yêu cầu</h2><p className="mx-auto mt-3 max-w-xl text-gray-600">Yêu cầu của bạn đang được xem xét. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p><div className="mx-auto mt-6 max-w-md rounded-xl bg-gray-50 p-4 text-left text-sm"><p>Mã yêu cầu: <b>{result?.bookingCode}</b></p><p className="mt-2">{room.propertyName} · {room.name}</p><p className="mt-2">{new Date(checkIn).toLocaleDateString('vi-VN')} – {new Date(checkOut).toLocaleDateString('vi-VN')}</p><p className="mt-2 font-semibold">Tổng dự kiến: {total.toLocaleString('vi-VN')} VND</p></div><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-full border px-6 py-3">Về trang chủ</Link>{user&&<Link href="/bookings" className="rounded-full bg-orange-600 px-6 py-3 text-white">Xem lịch sử</Link>}</div></section> :
      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]">
        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm">
          {step===1 ? <><h2 className="text-xl font-semibold">Thông tin liên hệ</h2><p className="mt-1 text-sm text-gray-500">Thông tin được dùng để liên hệ về yêu cầu đặt phòng.</p><div className="mt-6 space-y-5"><Field label="Họ và tên *" value={form.fullName} onChange={v=>setForm({...form,fullName:v})}/><div className="grid gap-5 sm:grid-cols-2"><Field type="email" label="Địa chỉ email *" value={form.email} onChange={v=>setForm({...form,email:v})}/><Field type="tel" label="Số điện thoại *" value={form.phone} onChange={v=>setForm({...form,phone:v})}/></div><label className="block text-sm font-semibold">Yêu cầu đặc biệt hoặc Xuất hóa đơn VAT<textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} rows={4} className="mt-2 w-full rounded-lg border p-3 font-normal outline-orange-500"/><small className="mt-1 block font-normal text-gray-500">Bạn sẽ biết tình trạng có sẵn của yêu cầu bổ sung trong quá trình nhận phòng. Có thể phát sinh phí bổ sung nhưng bạn vẫn có thể hủy yêu cầu sau đó.</small></label><button className="w-full rounded-full bg-orange-600 py-3 font-semibold text-white">Tiếp tục kiểm tra</button></div></>:
          <><h2 className="text-xl font-semibold">Kiểm tra thông tin</h2><div className="mt-5 divide-y rounded-xl border"><Review label="Họ và tên" value={form.fullName}/><Review label="Email" value={form.email}/><Review label="Số điện thoại" value={form.phone}/><Review label="Yêu cầu bổ sung" value={form.note||'Không có'}/><Review label="Thời gian" value={`${new Date(checkIn).toLocaleDateString('vi-VN')} – ${new Date(checkOut).toLocaleDateString('vi-VN')}`}/></div><div className="mt-6 flex gap-3"><button type="button" onClick={()=>setStep(1)} className="flex-1 rounded-full border py-3">Quay lại</button><button type="button" disabled={create.isPending} onClick={()=>create.mutate()} className="flex-1 rounded-full bg-orange-600 py-3 font-semibold text-white disabled:opacity-60">{create.isPending?'Đang gửi...':'Gửi yêu cầu đặt phòng'}</button></div></>}
        </form>
        <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-24"><div className="flex gap-3"><img src={room.images?.[0]?.imageUrl} alt="" className="h-24 w-24 rounded-lg object-cover"/><div><b>{room.propertyName}</b><p className="mt-1 text-sm text-gray-600">{room.name}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 border-y py-5"><label className="text-xs text-gray-500"><CalendarDays className="mb-1 h-4 w-4"/>Nhận phòng<input type="date" min={today} value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="mt-1 w-full text-sm text-black"/></label><label className="text-xs text-gray-500"><CalendarDays className="mb-1 h-4 w-4"/>Trả phòng<input type="date" min={checkIn} value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="mt-1 w-full text-sm text-black"/></label></div><label className="mt-4 block text-xs text-gray-500"><Users className="mr-1 inline h-4 w-4"/>Số khách<input type="number" min={1} max={room.maxOccupancy} value={guests} onChange={e=>setGuests(Number(e.target.value))} className="ml-3 w-16 rounded border p-1 text-black"/></label><div className="mt-5 flex justify-between border-t pt-5"><span>Tổng tiền dự kiến<br/><small>{nights} đêm</small></span><b className="text-xl text-orange-600">{total.toLocaleString('vi-VN')} VND</b></div></aside>
      </div>}
    </div>
  </main>;
}

function Field({label,value,onChange,type='text'}:{label:string,value:string,onChange:(v:string)=>void,type?:string}){return <label className="block text-sm font-semibold">{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-lg border p-3 font-normal outline-orange-500"/></label>}
function Review({label,value}:{label:string,value:string}){return <div className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]"><span className="text-sm text-gray-500">{label}</span><b className="break-words">{value}</b></div>}
