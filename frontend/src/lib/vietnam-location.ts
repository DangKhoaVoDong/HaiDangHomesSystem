export type AdministrativeUnit = {
  code: number;
  name: string;
  codename?: string;
  division_type?: string;
  province_code?: number;
};

export type GeocodingResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    suburb?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
};

const ADMIN_API = 'https://provinces.open-api.vn/api/v2';
const GEOCODING_API = 'https://nominatim.openstreetmap.org/search';

export async function getVietnamProvinces(signal?: AbortSignal): Promise<AdministrativeUnit[]> {
  const response = await fetch(`${ADMIN_API}/p/`, { signal });
  if (!response.ok) throw new Error('Không tải được danh sách tỉnh/thành phố');
  return response.json();
}

export async function getVietnamWards(
  provinceCode: number,
  signal?: AbortSignal
): Promise<AdministrativeUnit[]> {
  const response = await fetch(`${ADMIN_API}/w/?province=${provinceCode}`, { signal });
  if (!response.ok) throw new Error('Không tải được danh sách phường/xã');
  return response.json();
}

export async function searchVietnamAddress(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'vn',
    limit: '5',
    accept_language: 'vi',
  });
  const response = await fetch(`${GEOCODING_API}?${params}`, { signal });
  if (!response.ok) throw new Error('Dịch vụ bản đồ đang bận, vui lòng thử lại');
  return response.json();
}

export function isApproximateResult(result: GeocodingResult): boolean {
  const address = result.address;
  return !address?.house_number || !(address.road || address.pedestrian);
}
