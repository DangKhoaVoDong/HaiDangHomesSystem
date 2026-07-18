import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5203/api';

// Two thương hiệu hợp lệ — BE sẽ chuẩn hoá về uppercase và từ chối giá trị khác.
export const BRANDS = ['HAIDANG HOMESTAYS', 'NOVA WORD'] as const;
export type BrandName = typeof BRANDS[number];

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to extract data from ApiResponse
export function getApiData<T>(response: AxiosResponse<ApiResponse<T>> | undefined): T | null {
  if (response?.data?.success && response.data?.data !== undefined) {
    return response.data.data;
  }
  return null;
}

// Helper to check if API call was successful
export function isApiSuccess<T>(response: AxiosResponse<ApiResponse<T>> | undefined): boolean {
  return response?.data?.success === true;
}

// Helper to get error message from API response
export function getApiError<T>(response: AxiosResponse<ApiResponse<T>> | undefined): string {
  if (!response) return 'Network error';
  if (response.data?.errors && response.data.errors.length > 0) {
    return response.data.errors[0];
  }
  return response.data?.message || 'An error occurred';
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { email: string; phoneNumber?: string; password: string; fullName: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresAt: string; user: any }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresAt: string; user: any }>>('/auth/login', data),

  verifyOtp: (data: { email: string; otpCode: string }) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresAt: string; user: any }>>('/auth/verify-otp', data),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresAt: string; user: any }>>('/auth/refresh-token', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }),

  getCurrentUser: () =>
    api.get<ApiResponse<any>>('/auth/me'),
};

// Properties API
export const propertiesApi = {
  getAll: (params?: { page?: number; pageSize?: number; language?: string }) =>
    api.get<ApiResponse<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }>>('/properties', { params }),

  getFeatured: (params?: { count?: number; language?: string }) =>
    api.get<ApiResponse<any[]>>('/properties/featured', { params }),

  getById: (id: string, params?: { language?: string }) =>
    api.get<ApiResponse<any>>(`/properties/${id}`, { params }),

  search: (params: {
    searchTerm?: string;
    categoryId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests?: number;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    language?: string;
  }) => api.get<ApiResponse<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }>>('/properties/search', { params }),

  getMyProperties: (language?: string) =>
    api.get<ApiResponse<any[]>>('/properties/my-properties', { params: { language } }),

  create: (data: {
    name: string;
    description?: string;
    categoryId: string;
    address: string;
    city?: string;
    district?: string;
    ward?: string;
    latitude?: number;
    longitude?: number;
    thumbnailUrl?: string;
    isActive: boolean;
    isFeatured: boolean;
    brandName?: string;
  }) => api.post<ApiResponse<any>>('/properties', data),

  update: (
    id: string,
    data: {
      name: string;
      description?: string;
      categoryId: string;
      address: string;
      city?: string;
      district?: string;
      ward?: string;
      latitude?: number;
      longitude?: number;
      thumbnailUrl?: string;
      isActive: boolean;
      isFeatured: boolean;
      brandName?: string;
    }
  ) => api.put<ApiResponse<any>>(`/properties/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/properties/${id}`),
};

// Rooms API
export const roomsApi = {
  getById: (id: string, params?: { language?: string }) =>
    api.get<ApiResponse<any>>(`/rooms/${id}`, { params }),

  getByPropertyId: (propertyId: string, params?: { language?: string }) =>
    api.get<ApiResponse<any[]>>(`/rooms/property/${propertyId}`, { params }),

  getAvailable: (params: {
    checkIn: string;
    checkOut: string;
    guests: number;
    propertyId?: string;
    language?: string;
  }) => api.get<ApiResponse<any[]>>('/rooms/available', { params }),

  checkAvailability: (params: { roomId: string; checkIn: string; checkOut: string }) =>
    api.get<ApiResponse<boolean>>('/rooms/check-availability', { params }),

  // Manager endpoints
  getForManagement: (params?: {
    propertyId?: string;
    status?: number;
    page?: number;
    pageSize?: number;
  }) =>
    api.get<ApiResponse<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }>>(
      '/rooms/management',
      { params }
    ),

  create: (data: {
    name: string;
    description?: string;
    propertyId: string;
    roomNumber: number;
    floor: number;
    pricePerNight: number;
    maxOccupancy: number;
    bedCount: number;
    bathroomCount: number;
    sizeInSqm: number;
    imageUrls?: string[];
    amenityIds?: string[];
  }) => api.post<ApiResponse<any>>('/rooms', data),

  update: (
    id: string,
    data: {
      name: string;
      description?: string;
      roomNumber: number;
      floor: number;
      pricePerNight: number;
      maxOccupancy: number;
      bedCount: number;
      bathroomCount: number;
      sizeInSqm: number;
      isActive: boolean;
      isAvailable: boolean;
    }
  ) => api.put<ApiResponse<any>>(`/rooms/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/rooms/${id}`),
};

// Bookings API
export const bookingsApi = {
  getByCode: (bookingCode: string) =>
    api.get<ApiResponse<any>>(`/bookings/${bookingCode}`),

  getMyBookings: (status?: number) =>
    api.get<ApiResponse<any[]>>('/bookings/my-bookings', { params: { status } }),

  create: (data: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    specialRequests?: string;
    guestFullName?: string;
    guestEmail?: string;
    guestPhone?: string;
    guestIdCardNumber?: string;
  }) => api.post<ApiResponse<any>>('/bookings', data),

  updateStatus: (bookingId: string, newStatus: number) =>
    api.put<ApiResponse<any>>(`/bookings/${bookingId}/status`, { newStatus }),

  cancel: (bookingId: string, reason: string) =>
    api.post<ApiResponse<any>>(`/bookings/${bookingId}/cancel`, { reason }),

  // Manager endpoints
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    status?: number;
    propertyId?: string;
  }) =>
    api.get<ApiResponse<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }>>(
      '/bookings/all',
      { params }
    ),

  getCalendar: (params: { startDate: string; endDate: string; propertyId?: string }) =>
    api.get<ApiResponse<any[]>>('/bookings/calendar', { params }),

  getByProperty: (propertyId: string, params?: { fromDate?: string; toDate?: string }) =>
    api.get<ApiResponse<any[]>>(`/bookings/property/${propertyId}`, { params }),
};

// Upload API — posts a single image file to S3 via the BE and returns the public URL.
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ApiResponse<{ imageUrl: string; thumbnailUrl?: string }>>(
      '/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};

// Categories API
export const categoriesApi = {
  getAll: (language?: string) =>
    api.get<ApiResponse<any[]>>('/categories', { params: { language } }),

  getById: (id: string, language?: string) =>
    api.get<ApiResponse<any>>(`/categories/${id}`, { params: { language } }),
};

// Admin: Categories CRUD with Vi+En translations
export const categoriesAdminApi = {
  list: () => api.get<ApiResponse<any[]>>('/categories/admin'),

  create: (data: {
    nameVi: string;
    nameEn: string;
    descriptionVi?: string;
    descriptionEn?: string;
    iconUrl?: string;
    displayOrder: number;
  }) => api.post<ApiResponse<any>>('/categories', data),

  update: (
    id: string,
    data: {
      nameVi: string;
      nameEn: string;
      descriptionVi?: string;
      descriptionEn?: string;
      iconUrl?: string;
      displayOrder: number;
      isActive: boolean;
    }
  ) => api.put<ApiResponse<any>>(`/categories/${id}`, data),

  remove: (id: string) =>
    api.delete<ApiResponse<any>>(`/categories/${id}`),
};

// Brands API (public read, admin mutate)
export const brandsApi = {
  getAll: (includeInactive = false) =>
    api.get<ApiResponse<any[]>>('/brands', { params: { includeInactive } }),

  getById: (id: string) => api.get<ApiResponse<any>>(`/brands/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<any>>('/brands', data),

  update: (
    id: string,
    data: { name: string; description?: string; isActive: boolean }
  ) => api.put<ApiResponse<any>>(`/brands/${id}`, data),

  remove: (id: string) => api.delete<ApiResponse<any>>(`/brands/${id}`),
};

// Amenities API
export const amenitiesApi = {
  getAll: (language?: string) =>
    api.get<ApiResponse<any[]>>('/amenities', { params: { language } }),

  getById: (id: string, language?: string) =>
    api.get<ApiResponse<any>>(`/amenities/${id}`, { params: { language } }),
};

// Payments API
export const paymentsApi = {
  createPaymentUrl: (bookingId: string) =>
    api.post<ApiResponse<{ paymentUrl: string; transactionId: string }>>('/payments/create-payment-url', { bookingId }),

  checkPaymentStatus: (orderCode: string | number) =>
    api.get<ApiResponse<any>>(`/payments/check-status/${orderCode}`),
};
