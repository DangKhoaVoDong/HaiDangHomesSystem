'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQueries, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Bed, ChevronLeft, ChevronRight, ImageIcon, MapPin, Maximize, Phone, Users, X } from 'lucide-react';
import { getApiData, propertiesApi, roomsApi } from '@/lib/api';
import { DateRangePicker } from '@/components/DateRangePicker';

const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-gray-100" />,
});

const orange = '#df4914';
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [roomModal, setRoomModal] = useState<any>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; title: string } | null>(null);

  const propertyQuery = useQuery({ queryKey: ['property', id], queryFn: () => propertiesApi.getById(id, { language: 'vi' }) });
  const roomsQuery = useQuery({ queryKey: ['property-rooms', id], queryFn: () => roomsApi.getByPropertyId(id, { language: 'vi' }) });
  const property: any = getApiData(propertyQuery.data);
  const roomSummaries: any[] = getApiData(roomsQuery.data) ?? [];
  const rooms: any[] = (property?.rooms?.length ? property.rooms : roomSummaries).map((room: any) => ({
    ...roomSummaries.find((item: any) => item.id === room.id),
    ...room,
  }));

  const availability = useQueries({
    queries: rooms.map(room => ({
      queryKey: ['availability', room.id, checkIn, checkOut],
      queryFn: async () => Boolean(getApiData(await roomsApi.checkAvailability({ roomId: room.id, checkIn, checkOut }))),
      enabled: Boolean(checkIn && checkOut && checkOut > checkIn),
    })),
  });

  const relatedQuery = useQuery({
    queryKey: ['related-properties', property?.city],
    queryFn: () => propertiesApi.search({ city: property.city, page: 1, pageSize: 5, language: 'vi' }),
    enabled: Boolean(property?.city),
  });
  const related = ((getApiData(relatedQuery.data) as any)?.items ?? []).filter((p: any) => p.id !== id).slice(0, 4);

  const gallery = useMemo(() => {
    const images = [property?.thumbnailUrl, ...(property?.images ?? []).map((x: any) => x.imageUrl)].filter(Boolean);
    return [...new Set(images)] as string[];
  }, [property]);
  const roomImages = roomModal
    ? [...new Set([roomModal.primaryImageUrl, ...(roomModal.images ?? []).map((x: any) => x.imageUrl)].filter(Boolean))] as string[]
    : [];
  const latitude = Number(property?.latitude);
  const longitude = Number(property?.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const fullAddress = [property?.address, property?.city].filter(Boolean).join(', ');

  const openLightbox = (images: string[], index: number, title: string) => {
    if (images.length > 0) setLightbox({ images, index, title });
  };

  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowLeft') setLightbox(current => current ? ({ ...current, index: (current.index - 1 + current.images.length) % current.images.length }) : null);
      if (event.key === 'ArrowRight') setLightbox(current => current ? ({ ...current, index: (current.index + 1) % current.images.length }) : null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox]);

  const goBooking = (room: any) => {
    const query = new URLSearchParams({ propertyId: id, checkIn, checkOut, guests: String(guests) });
    router.push(`/booking/${room.id}?${query}`);
  };

  if (propertyQuery.isLoading) return <div className="min-h-screen grid place-items-center">Đang tải thông tin chỗ nghỉ...</div>;
  if (!property) return <div className="min-h-screen grid place-items-center">Không tìm thấy chỗ nghỉ.</div>;

  return <main className="min-h-screen bg-[#f7f7f7] text-[#171717]">
    <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-8 lg:px-12 xl:px-16">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/" className="underline">Trang chủ</Link><span>›</span>
        <Link href="/properties" className="underline">Tìm phòng</Link><span>›</span>
        <span className="font-medium">{property.name}</span>
      </nav>

      <section className="grid h-[410px] grid-cols-1 gap-1 overflow-hidden rounded-lg md:grid-cols-2">
        <button type="button" onClick={() => openLightbox(gallery, 0, property.name)} className="h-full w-full cursor-zoom-in overflow-hidden bg-gray-100 text-left">
          <img src={gallery[0]} alt={property.name} className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
        </button>
        <div className="hidden grid-cols-2 gap-1 md:grid">
          {[1,2,3,4].map((n) => <button type="button" onClick={() => openLightbox(gallery, Math.min(n, Math.max(0, gallery.length - 1)), property.name)} className="relative cursor-zoom-in overflow-hidden bg-gray-100 text-left" key={n}>
            <img src={gallery[n] ?? gallery[0]} alt={`${property.name} ${n + 1}`} className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
            {n === 4 && <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 text-sm text-white"><ImageIcon className="mr-1 inline h-4 w-4" />{gallery.length} ảnh</span>}
          </button>)}
        </div>
      </section>

      <div className="sticky top-0 z-20 flex gap-10 border-b bg-white px-6 shadow-sm">
        <a href="#intro" className="border-b-2 px-1 py-4 font-semibold" style={{borderColor: orange}}>Giới thiệu</a>
        <a href="#rooms" className="px-1 py-4">Chọn phòng</a>
      </div>

      <section id="intro" className="grid gap-8 rounded-b-2xl bg-white p-6 md:grid-cols-[1fr_400px]">
        <div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight sm:text-5xl">{property.name}</h1>
          <p className="whitespace-pre-line leading-7 text-gray-700">{property.description || 'Không gian nghỉ dưỡng tiện nghi thuộc hệ thống HaiDang Homes.'}</p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold">Tiện nghi</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(property.amenities ?? []).map((a: any) => <div key={a.id} className="rounded-lg bg-orange-50 p-3 text-sm">✓ {a.name}</div>)}
          </div>
        </div>
        <div>
          {hasCoordinates ? (
            <PropertyMap latitude={latitude} longitude={longitude} name={property.name} address={fullAddress} />
          ) : (
            <div className="grid h-72 place-items-center rounded-xl bg-gray-100 px-6 text-center text-sm text-gray-500">
              Căn nhà chưa được cập nhật tọa độ trên bản đồ.
            </div>
          )}
          {hasCoordinates ? (
            <a
              className="mt-3 flex items-start gap-2 text-gray-700 hover:text-orange-600 hover:underline"
              target="_blank"
              rel="noreferrer"
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
              {fullAddress}
            </a>
          ) : (
            <p className="mt-3 flex items-start gap-2 text-gray-600">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
              {fullAddress}
            </p>
          )}
        </div>
      </section>

      <section id="rooms" className="scroll-mt-20 py-10">
        <h2 className="mb-5 text-3xl font-semibold">Lựa chọn phòng</h2>
        <div className="relative z-40 mb-7 overflow-visible rounded-xl border border-gray-100 bg-white shadow-[0_3px_14px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_.7fr_auto] md:items-stretch">
            <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(start,end)=>{setCheckIn(start);setCheckOut(end)}} />
            <label className="min-w-0 border-l border-t border-gray-100 px-5 py-4 md:border-t-0 md:border-gray-200">
              <span className="block text-xs font-medium text-orange-600">Khách</span>
              <span className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-900">
                <input aria-label="Số khách" className="w-9 border-0 bg-transparent p-0 font-semibold outline-none" type="number" min={1} value={guests} onChange={e => setGuests(Math.max(1, Number(e.target.value)))} /> khách
              </span>
            </label>
            <div className="col-span-2 p-3 md:col-span-1 md:px-4">
              <button className="w-full rounded-full border border-orange-600 px-8 py-3 text-sm font-medium text-orange-600 transition-all hover:bg-orange-600 hover:text-white active:scale-[0.98] md:min-w-[108px]">Áp dụng</button>
            </div>
          </div>
        </div>
        {guests > 8 && <div className="mb-5 flex items-start justify-between rounded-xl border border-orange-200 bg-orange-50 p-4"><p><Phone className="mr-2 inline h-5 w-5" />Bạn muốn đặt nhiều phòng? Liên hệ <a className="font-bold underline" href="tel:0938453798">0938453798</a> để nhận thêm ưu đãi.</p><button onClick={(e) => e.currentTarget.parentElement?.remove()} className="ml-3">×</button></div>}

        <div className="space-y-6">
          {rooms.map((room, index) => {
            const available = availability[index]?.data !== false && room.isAvailable !== false;
            return <article key={room.id} onClick={() => {setRoomModal(room);setImageIndex(0)}} className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
              <h3 className="mb-4 text-xl font-semibold">{room.name}</h3>
              <div className="grid gap-5 md:grid-cols-[290px_1fr_180px]">
                <img src={room.primaryImageUrl || room.images?.[0]?.imageUrl || gallery[0]} alt={room.name} className="h-52 w-full rounded-xl object-cover" />
                <div><div className="mb-3 flex flex-wrap gap-6 text-gray-600"><span><Maximize className="mr-1 inline h-5 w-5 text-orange-500" />{room.sizeInSqm ?? '—'} m²</span><span><Bed className="mr-1 inline h-5 w-5 text-orange-500" />{room.bedCount} giường</span><span><Users className="mr-1 inline h-5 w-5 text-orange-500" />{room.maxOccupancy} người</span></div><p className="line-clamp-3 text-sm leading-6 text-gray-700">{room.description}</p><button className="mt-7 text-sm font-semibold text-orange-600">Xem chi tiết phòng</button></div>
                <div className="flex flex-col items-end justify-end text-right"><strong className="text-2xl text-orange-600">{Number(room.pricePerNight).toLocaleString('vi-VN')}</strong><span className="text-sm">Đồng / Đêm</span><button disabled={!available} onClick={e => {e.stopPropagation(); if (available) goBooking(room)}} className="mt-6 rounded-full px-7 py-3 font-semibold text-white disabled:bg-gray-300" style={{backgroundColor: available ? orange : undefined}}>{available ? 'Chọn phòng' : 'Hết phòng'}</button></div>
              </div>
            </article>;
          })}
        </div>
      </section>

      {related.length > 0 && <section className="pb-12"><h2 className="mb-6 text-3xl font-semibold">Các chỗ nghỉ khác tại {property.city}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((p:any)=><Link href={`/properties/${p.id}`} key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm"><img src={p.thumbnailUrl} alt={p.name} className="h-44 w-full object-cover"/><div className="p-4"><h3 className="font-semibold">{p.name}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.address}</p><p className="mt-4 font-bold text-orange-600">{p.minPrice ? `Từ ${Number(p.minPrice).toLocaleString('vi-VN')}đ` : 'Liên hệ'}</p></div></Link>)}</div></section>}
    </div>

    {roomModal && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-0 sm:p-5" onClick={() => setRoomModal(null)}><div className="relative grid h-full w-full max-w-5xl overflow-hidden bg-white sm:h-auto sm:max-h-[90vh] sm:rounded-2xl md:grid-cols-[1.5fr_1fr]" onClick={e=>e.stopPropagation()}><button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow" onClick={()=>setRoomModal(null)}><X/></button><div className="flex min-h-[340px] flex-col bg-black"><div className="relative flex-1"><button type="button" onClick={() => openLightbox(roomImages.length ? roomImages : gallery, imageIndex, roomModal.name)} className="h-full w-full cursor-zoom-in"><img src={roomImages[imageIndex] || gallery[0]} className="h-full w-full object-cover" alt={`${roomModal.name} ${imageIndex + 1}`}/></button>{roomImages.length > 1 && <><button onClick={()=>setImageIndex((imageIndex-1+roomImages.length)%roomImages.length)} className="absolute left-3 top-1/2 rounded-full bg-white p-2"><ChevronLeft/></button><button onClick={()=>setImageIndex((imageIndex+1)%roomImages.length)} className="absolute right-3 top-1/2 rounded-full bg-white p-2"><ChevronRight/></button></>}</div>{roomImages.length > 0 && <div className="flex gap-2 overflow-x-auto p-3">{roomImages.map((img:string,i:number)=><img key={img} onClick={()=>setImageIndex(i)} src={img} className={`h-16 w-24 shrink-0 cursor-pointer rounded object-cover ${i===imageIndex?'ring-2 ring-orange-500':'opacity-60'}`} alt={`${roomModal.name} ${i+1}`}/>)}</div>}</div><div className="flex flex-col overflow-y-auto p-6"><h2 className="pr-8 text-2xl font-semibold">{roomModal.name}</h2><p className="my-5 text-sm leading-6 text-gray-700">{roomModal.description}</p><div className="space-y-3 border-y py-5"><p><Maximize className="mr-2 inline text-orange-500"/> {roomModal.sizeInSqm} m²</p><p><Bed className="mr-2 inline text-orange-500"/> {roomModal.bedCount} giường</p><p><Users className="mr-2 inline text-orange-500"/> {roomModal.maxOccupancy} người</p></div><h3 className="mt-5 font-semibold">Tiện nghi</h3><div className="mt-3 space-y-2 text-sm">{(roomModal.amenities ?? []).map((a:any)=><p key={a.id}>✓ {a.name}</p>)}</div><div className="mt-auto border-t pt-5"><strong className="text-2xl text-orange-600">{Number(roomModal.pricePerNight).toLocaleString('vi-VN')}đ</strong><span> / đêm</span><button onClick={()=>goBooking(roomModal)} className="mt-4 w-full rounded-full bg-orange-600 py-3 font-semibold text-white">Chọn phòng</button></div></div></div></div>}

    {lightbox && <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={() => setLightbox(null)}>
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6"><div><strong>{lightbox.title}</strong><span className="ml-3 text-sm text-white/70">{lightbox.index + 1} / {lightbox.images.length}</span></div><button type="button" aria-label="Đóng ảnh" className="rounded-full bg-white/10 p-2 hover:bg-white/20" onClick={() => setLightbox(null)}><X /></button></div>
      <div className="relative min-h-0 flex-1 px-4 pb-3" onClick={e => e.stopPropagation()}><img src={lightbox.images[lightbox.index]} alt={`${lightbox.title} ${lightbox.index + 1}`} className="h-full w-full object-contain" />{lightbox.images.length > 1 && <><button type="button" aria-label="Ảnh trước" onClick={() => setLightbox(current => current ? ({...current,index:(current.index-1+current.images.length)%current.images.length}) : null)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-black shadow hover:bg-white sm:left-8"><ChevronLeft /></button><button type="button" aria-label="Ảnh tiếp theo" onClick={() => setLightbox(current => current ? ({...current,index:(current.index+1)%current.images.length}) : null)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-black shadow hover:bg-white sm:right-8"><ChevronRight /></button></>}</div>
      {lightbox.images.length > 1 && <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-4" onClick={e => e.stopPropagation()}>{lightbox.images.map((image,index)=><button type="button" key={image} onClick={() => setLightbox(current => current ? ({...current,index}) : null)} className={`h-16 w-24 shrink-0 overflow-hidden rounded ${index===lightbox.index?'ring-2 ring-orange-500':'opacity-55 hover:opacity-90'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>}
    </div>}
  </main>;
}
