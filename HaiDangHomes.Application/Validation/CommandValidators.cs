using FluentValidation;
using HaiDangHomes.Application.CQRS.Commands;

namespace HaiDangHomes.Application.Validation;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.PhoneNumber).MaximumLength(20);
        RuleFor(x => x.Password)
            .NotEmpty().MinimumLength(8).MaximumLength(128)
            .Matches("[A-Z]").WithMessage("Password must contain an uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain a lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain a number.");
    }
}

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(128);
    }
}

public sealed class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.RoomId).NotEmpty();
        RuleFor(x => x.CheckInDate)
            .GreaterThanOrEqualTo(_ => DateTime.UtcNow.Date)
            .WithMessage("Check-in date cannot be in the past.");
        RuleFor(x => x.CheckOutDate)
            .GreaterThan(x => x.CheckInDate)
            .WithMessage("Check-out date must be after check-in date.");
        RuleFor(x => x.NumberOfGuests).InclusiveBetween(1, 50);
        RuleFor(x => x.GuestFullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.GuestEmail).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.GuestPhone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.GuestIdCardNumber).MaximumLength(50);
        RuleFor(x => x.GuestAddress).MaximumLength(500);
        RuleFor(x => x.SpecialRequests).MaximumLength(2000);
    }
}

public sealed class CreatePropertyCommandValidator : AbstractValidator<CreatePropertyCommand>
{
    public CreatePropertyCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Address).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.Latitude).InclusiveBetween(-90, 90).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180, 180).When(x => x.Longitude.HasValue);
    }
}

public sealed class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
{
    public CreateRoomCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.PropertyId).NotEmpty();
        RuleFor(x => x.RoomNumber).GreaterThan(0);
        RuleFor(x => x.PricePerNight).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxOccupancy).InclusiveBetween(1, 50);
        RuleFor(x => x.BedCount).InclusiveBetween(0, 50);
        RuleFor(x => x.BathroomCount).InclusiveBetween(0, 20);
        RuleFor(x => x.SizeInSqm).GreaterThan(0);
    }
}
