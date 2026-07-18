namespace HaiDangHomes.Domain.Enums;

public enum BookingStatus
{
    Pending = 1,      // Chờ thanh toán
    Confirmed = 2,    // Đã xác nhận
    CheckedIn = 3,    // Đã nhận phòng
    Completed = 4,     // Hoàn thành
    Cancelled = 5,    // Đã hủy
    Refunded = 6      // Đã hoàn tiền
}
