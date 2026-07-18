// User types
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
  avatarUrl?: string;
  role: 'Customer' | 'Manager' | 'Admin';
  isVerified: boolean;
  loyaltyPoints: number;
  membershipTier: 'Regular' | 'Silver' | 'Gold' | 'Diamond';
}

// Property types
export interface PropertyList {
  id: string;
  name: string;
  description?: string;
  categoryName: string;
  address: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  totalRooms: number;
  minPrice?: number;
}

export interface Property {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  hostName: string;
  categoryId: string;
  categoryName: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  thumbnailUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  totalRooms: number;
  rooms: Room[];
  images: PropertyImage[];
  amenities: Amenity[];
}

// Room types
export interface RoomList {
  id: string;
  name: string;
  propertyId: string;
  propertyName: string;
  roomNumber: number;
  pricePerNight: number;
  maxOccupancy: number;
  isAvailable: boolean;
  primaryImageUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  propertyId: string;
  propertyName: string;
  roomNumber: number;
  floor: number;
  pricePerNight: number;
  maxOccupancy: number;
  bedCount: number;
  bathroomCount: number;
  sizeInSqm: number;
  isActive: boolean;
  isAvailable: boolean;
  images: RoomImage[];
  amenities: Amenity[];
}

// Booking types
export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail?: string;
  roomId: string;
  roomName: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  qrCode?: string;
  paidAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  specialRequests?: string;
}

export interface BookingList {
  id: string;
  bookingCode: string;
  roomName: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  finalPrice: number;
  status: BookingStatus;
}

// Category & Amenity types
export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
  translations?: CategoryTranslation[];
}

export interface CategoryTranslation {
  language: 'Vi' | 'En';
  name: string;
  description?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface RoomImage {
  id: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface PropertyImage {
  id: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  isPrimary: boolean;
}

// Enums
export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled' | 'Refunded';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

// API Response types - Match backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Search/Pagination result - Match backend SearchResult<T>
export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types - Match backend AuthResponse
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// Search filters
export interface SearchFilters {
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
}
