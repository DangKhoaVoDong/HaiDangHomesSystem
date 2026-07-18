namespace HaiDangHomes.Domain.ValueObjects;

public record DateRange
{
    public DateTime CheckIn { get; init; }
    public DateTime CheckOut { get; init; }
    
    public DateRange() { }
    
    public DateRange(DateTime checkIn, DateTime checkOut)
    {
        if (checkOut <= checkIn)
            throw new ArgumentException("Check-out must be after check-in");
        
        CheckIn = checkIn;
        CheckOut = checkOut;
    }
    
    public int NumberOfNights => (CheckOut - CheckIn).Days;
    
    public bool Overlaps(DateRange other)
    {
        return CheckIn < other.CheckOut && other.CheckIn < CheckOut;
    }
    
    public bool Contains(DateTime date)
    {
        return date >= CheckIn && date < CheckOut;
    }
}
