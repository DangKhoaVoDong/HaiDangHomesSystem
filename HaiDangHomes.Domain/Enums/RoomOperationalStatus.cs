namespace HaiDangHomes.Domain.Enums;

public enum RoomOperationalStatus
{
    Available = 1,      // Đang trống
    Occupied = 2,       // Đang sử dụng
    Maintenance = 3,     // Đang sửa chữa
    CheckOutSoon = 4,   // Sắp Check-out
    Blocked = 5         // Bị khóa/Ẩn
}
