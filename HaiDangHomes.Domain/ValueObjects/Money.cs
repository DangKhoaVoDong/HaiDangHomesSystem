namespace HaiDangHomes.Domain.ValueObjects;

public record Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "VND";
    
    public Money() { }
    
    public Money(decimal amount, string currency = "VND")
    {
        Amount = amount;
        Currency = currency;
    }
    
    public static Money Zero => new(0, "VND");
    
    public Money Add(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException("Cannot add money with different currencies");
        return new Money(Amount + other.Amount, Currency);
    }
    
    public Money Subtract(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException("Cannot subtract money with different currencies");
        return new Money(Amount - other.Amount, Currency);
    }
    
    public Money Multiply(decimal factor)
    {
        return new Money(Amount * factor, Currency);
    }
    
    public override string ToString() => $"{Amount:N0} {Currency}";
}
