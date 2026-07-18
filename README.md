# HaiDang Homes - Hệ thống Thuê Phòng

Hệ thống đặt phòng trực tuyến được xây dựng với kiến trúc Clean Architecture.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **Architecture**: Clean Architecture
- **Database**: PostgreSQL (Neon DB)
- **Cache**: Redis
- **Storage**: AWS S3
- **Email**: Resend
- **Payment**: PayOS

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod

## Cấu trúc dự án

```
HaiDangHomesSystem/
├── HaiDangHomes.Domain/          # Domain Layer - Entities, Enums, Interfaces
├── HaiDangHomes.Application/     # Application Layer - Use Cases, Services, CQRS
├── HaiDangHomes.Infrastructure/   # Infrastructure Layer - Repositories, Services
├── HaiDangHomes.API/             # API Layer - Controllers, Configuration
└── frontend/                     # Next.js Frontend Application
```

## Tính năng

### 1. Người dùng & Hội viên
- Đăng ký / Đăng nhập (Email + Password)
- Guest Checkout (Khách vãng lai)
- RBAC: Customer, Host, Admin
- Loyalty System (Bạc/Vàng/Kim cương)

### 2. Hiển thị & Tìm kiếm
- Multi-category CMS
- Bộ lọc tìm kiếm
- Chi tiết phòng với gallery

### 3. Đặt phòng & Thanh toán
- Kiểm tra phòng trống (Chống overbooking)
- Tính hóa đơn tự động
- Booking Lifecycle
- Tích hợp PayOS

### 4. Email Automation
- Gửi hóa đơn tự động
- QR Code cho check-in nhanh

### 5. Đa ngôn ngữ
- Tiếng Việt (mặc định)
- Tiếng Anh

## Cài đặt

### Backend

1. Cài đặt dependencies:
```bash
dotnet restore
```

2. Cấu hình appsettings.json:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=your-neon-host;Port=5432;Database=haidanghomes;Username=user;Password=pass;sslmode=require",
    "Redis": "redis://host:6379"
  },
  "Jwt": {
    "Secret": "YourSuperSecretKey...",
    "Issuer": "HaiDangHomes",
    "Audience": "HaiDangHomesAPI"
  },
  "AWS": {
    "Region": "ap-southeast-1",
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "S3": {
      "BucketName": "haidanghomes-uploads"
    }
  },
  "Resend": {
    "ApiKey": "re_your-api-key"
  },
  "PayOS": {
    "ClientId": "YOUR_PAYOS_CLIENT_ID",
    "ApiKey": "YOUR_PAYOS_API_KEY",
    "ChecksumKey": "YOUR_PAYOS_CHECKSUM_KEY",
    "ReturnUrl": "https://your-domain.com/booking/success",
    "CancelUrl": "https://your-domain.com/booking/failed"
  }
}
```

3. Chạy migrations:
```bash
dotnet ef database update
```

4. Chạy ứng dụng:
```bash
dotnet run --project HaiDangHomes.API
```

### Frontend

1. Cài đặt dependencies:
```bash
cd frontend
npm install
```

2. Cấu hình .env.local:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Chạy ứng dụng:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-otp
- POST /api/auth/refresh-token
- GET /api/auth/me

### Properties
- GET /api/properties
- GET /api/properties/{id}
- GET /api/properties/featured
- GET /api/properties/search

### Rooms
- GET /api/rooms/{id}
- GET /api/rooms/property/{propertyId}
- GET /api/rooms/available
- GET /api/rooms/check-availability

### Bookings
- POST /api/bookings
- GET /api/bookings/{bookingCode}
- GET /api/bookings/my-bookings
- PUT /api/bookings/{bookingId}/status

### Payments
- POST /api/payments/create-payment-url
- GET /api/payments/payos-return
- POST /api/payments/payos-webhook
- GET /api/payments/check-status/{orderCode}

### Categories & Amenities
- GET /api/categories
- GET /api/amenities

## Loyalty System

| Hạng | Điểm tối thiểu | % Giảm giá |
|------|----------------|------------|
| Thường | 0 | 0% |
| Bạc | 100 | 5% |
| Vàng | 500 | 10% |
| Kim cương | 1000 | 15% |

**Quy tắc:**
- 1 điểm = 10,000 VND thanh toán
- Chỉ áp dụng cho khách có tài khoản
- Điểm được cộng khi đơn hoàn thành

## License

MIT License
