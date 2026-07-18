using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Application.Mappings;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Interfaces;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

// ---------- BRAND QUERIES ----------

public class GetAllBrandsQueryHandler : IRequestHandler<GetAllBrandsQuery, List<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;

    public GetAllBrandsQueryHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<List<BrandDto>> Handle(GetAllBrandsQuery request, CancellationToken cancellationToken)
    {
        var brands = await _brandRepository.GetAllAsync(request.IncludeInactive, cancellationToken);
        return brands.Select(b => b.ToDto()).ToList();
    }
}

public class GetBrandByIdQueryHandler : IRequestHandler<GetBrandByIdQuery, BrandDto?>
{
    private readonly IBrandRepository _brandRepository;

    public GetBrandByIdQueryHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<BrandDto?> Handle(GetBrandByIdQuery request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.Id, cancellationToken);
        return brand?.ToDto();
    }
}

// ---------- BRAND COMMANDS ----------

public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Result<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;

    public CreateBrandCommandHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<Result<BrandDto>> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        var name = (request.Name ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<BrandDto>.Failure("Tên thương hiệu là bắt buộc.");
        }

        if (name.Length > 64)
        {
            return Result<BrandDto>.Failure("Tên thương hiệu không được vượt quá 64 ký tự.");
        }

        if (await _brandRepository.GetByNameAsync(name, cancellationToken) != null)
        {
            return Result<BrandDto>.Failure($"Thương hiệu \"{name}\" đã tồn tại.");
        }

        var brand = new Brand
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = request.Description,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin"
        };

        var created = await _brandRepository.AddAsync(brand, cancellationToken);
        return Result<BrandDto>.Success(created.ToDto());
    }
}

public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, Result<BrandDto>>
{
    private readonly IBrandRepository _brandRepository;

    public UpdateBrandCommandHandler(IBrandRepository brandRepository)
    {
        _brandRepository = brandRepository;
    }

    public async Task<Result<BrandDto>> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.Id, cancellationToken);
        if (brand == null)
        {
            return Result<BrandDto>.Failure("Không tìm thấy thương hiệu.");
        }

        var name = (request.Name ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<BrandDto>.Failure("Tên thương hiệu là bắt buộc.");
        }

        // Reject duplicate name collision
        var existing = await _brandRepository.GetByNameAsync(name, cancellationToken);
        if (existing != null && existing.Id != request.Id)
        {
            return Result<BrandDto>.Failure($"Thương hiệu \"{name}\" đã được sử dụng.");
        }

        brand.Name = name;
        brand.Description = request.Description;
        brand.IsActive = request.IsActive;

        await _brandRepository.UpdateAsync(brand, cancellationToken);
        return Result<BrandDto>.Success(brand.ToDto());
    }
}

public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, Result>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IPropertyRepository _propertyRepository;

    public DeleteBrandCommandHandler(
        IBrandRepository brandRepository,
        IPropertyRepository propertyRepository)
    {
        _brandRepository = brandRepository;
        _propertyRepository = propertyRepository;
    }

    public async Task<Result> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetByIdAsync(request.Id, cancellationToken);
        if (brand == null)
        {
            return Result.Failure("Không tìm thấy thương hiệu.");
        }

        var inUse = await _propertyRepository.GetAllAsync(cancellationToken);
        if (inUse.Any(p => p.BrandName != null &&
                           p.BrandName.ToUpper() == brand.Name.ToUpper()))
        {
            return Result.Failure($"Không thể xoá thương hiệu \"{brand.Name}\" vì đang có căn nhà sử dụng. Hãy chuyển sang thương hiệu khác trước.");
        }

        brand.IsActive = false;
        brand.IsDeleted = true;
        brand.DeletedAt = DateTime.UtcNow;
        await _brandRepository.UpdateAsync(brand, cancellationToken);

        return Result.Success();
    }
}
