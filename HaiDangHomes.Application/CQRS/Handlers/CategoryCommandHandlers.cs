using HaiDangHomes.Application.CQRS.Commands;
using HaiDangHomes.Application.CQRS.Queries;
using HaiDangHomes.Application.Common;
using HaiDangHomes.Application.DTOs;
using HaiDangHomes.Domain.Entities;
using HaiDangHomes.Domain.Enums;
using HaiDangHomes.Domain.Interfaces;
using MediatR;

namespace HaiDangHomes.Application.CQRS.Handlers;

// ---------- ADMIN CATEGORY HANDLERS ----------

public class GetAllCategoriesAdminQueryHandler : IRequestHandler<GetAllCategoriesAdminQuery, List<CategoryAdminDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public GetAllCategoriesAdminQueryHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<List<CategoryAdminDto>> Handle(GetAllCategoriesAdminQuery request, CancellationToken cancellationToken)
    {
        var categories = await _categoryRepository.GetAllAsync(cancellationToken);
        return categories
            .Select(c => new CategoryAdminDto(
                c.Id,
                TransOr(c, SupportedLanguage.Vi, t => t.Name),
                TransOr(c, SupportedLanguage.En, t => t.Name),
                TransOr(c, SupportedLanguage.Vi, t => t.Description),
                TransOr(c, SupportedLanguage.En, t => t.Description),
                c.IconUrl,
                c.DisplayOrder,
                c.IsActive,
                c.CreatedAt,
                c.UpdatedAt))
            .ToList();
    }

    private static string? TransOr(Category c, SupportedLanguage lang, Func<CategoryTranslation, string?> picker)
    {
        var t = c.Translations?.FirstOrDefault(x => x.Language == lang);
        return t == null ? null : picker(t);
    }
}

public class CreateAdminCategoryCommandHandler : IRequestHandler<CreateAdminCategoryCommand, Result<CategoryAdminDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public CreateAdminCategoryCommandHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryAdminDto>> Handle(
        CreateAdminCategoryCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.NameVi) || string.IsNullOrWhiteSpace(request.NameEn))
        {
            return Result<CategoryAdminDto>.Failure("Tên tiếng Việt và tiếng Anh là bắt buộc.");
        }

        var now = DateTime.UtcNow;
        var categoryId = Guid.NewGuid();

        var category = new Category
        {
            Id = categoryId,
            Name = request.NameVi,
            Description = request.DescriptionVi,
            IconUrl = request.IconUrl,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = now,
            CreatedBy = "admin"
        };

        await _categoryRepository.AddAsync(category, cancellationToken);

        await _categoryRepository.UpsertTranslationAsync(
            new CategoryTranslation
            {
                Id = Guid.NewGuid(),
                CategoryId = categoryId,
                Language = SupportedLanguage.Vi,
                Name = request.NameVi,
                Description = request.DescriptionVi,
                CreatedAt = now,
                CreatedBy = "admin"
            }, cancellationToken);

        await _categoryRepository.UpsertTranslationAsync(
            new CategoryTranslation
            {
                Id = Guid.NewGuid(),
                CategoryId = categoryId,
                Language = SupportedLanguage.En,
                Name = request.NameEn,
                Description = request.DescriptionEn,
                CreatedAt = now,
                CreatedBy = "admin"
            }, cancellationToken);

        return Result<CategoryAdminDto>.Success(new CategoryAdminDto(
            categoryId, request.NameVi, request.NameEn,
            request.DescriptionVi, request.DescriptionEn,
            request.IconUrl, request.DisplayOrder, true, now, null));
    }
}

public class UpdateAdminCategoryCommandHandler : IRequestHandler<UpdateAdminCategoryCommand, Result<CategoryAdminDto>>
{
    private readonly ICategoryRepository _categoryRepository;

    public UpdateAdminCategoryCommandHandler(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<Result<CategoryAdminDto>> Handle(
        UpdateAdminCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
        {
            return Result<CategoryAdminDto>.Failure("Không tìm thấy loại hình.");
        }

        if (string.IsNullOrWhiteSpace(request.NameVi) || string.IsNullOrWhiteSpace(request.NameEn))
        {
            return Result<CategoryAdminDto>.Failure("Tên tiếng Việt và tiếng Anh là bắt buộc.");
        }

        category.Name = request.NameVi;
        category.Description = request.DescriptionVi;
        category.IconUrl = request.IconUrl;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        await _categoryRepository.UpdateAsync(category, cancellationToken);

        var now = DateTime.UtcNow;
        await _categoryRepository.UpsertTranslationAsync(
            new CategoryTranslation
            {
                Id = Guid.NewGuid(),
                CategoryId = request.Id,
                Language = SupportedLanguage.Vi,
                Name = request.NameVi,
                Description = request.DescriptionVi,
                CreatedAt = now,
                CreatedBy = "admin"
            }, cancellationToken);

        await _categoryRepository.UpsertTranslationAsync(
            new CategoryTranslation
            {
                Id = Guid.NewGuid(),
                CategoryId = request.Id,
                Language = SupportedLanguage.En,
                Name = request.NameEn,
                Description = request.DescriptionEn,
                CreatedAt = now,
                CreatedBy = "admin"
            }, cancellationToken);

        return Result<CategoryAdminDto>.Success(new CategoryAdminDto(
            category.Id, request.NameVi, request.NameEn,
            request.DescriptionVi, request.DescriptionEn,
            category.IconUrl, category.DisplayOrder, category.IsActive,
            category.CreatedAt, category.UpdatedAt));
    }
}

public class DeleteAdminCategoryCommandHandler : IRequestHandler<DeleteAdminCategoryCommand, Result>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IPropertyRepository _propertyRepository;

    public DeleteAdminCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IPropertyRepository propertyRepository)
    {
        _categoryRepository = categoryRepository;
        _propertyRepository = propertyRepository;
    }

    public async Task<Result> Handle(DeleteAdminCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category == null)
        {
            return Result.Failure("Không tìm thấy loại hình.");
        }

        var inUse = await _propertyRepository.GetAllAsync(cancellationToken);
        if (inUse.Any(p => p.CategoryId == request.Id))
        {
            return Result.Failure("Không thể xoá loại hình đang được sử dụng bởi một căn nhà. Hãy chuyển sang loại khác trước.");
        }

        category.IsActive = false;
        category.IsDeleted = true;
        category.DeletedAt = DateTime.UtcNow;
        await _categoryRepository.UpdateAsync(category, cancellationToken);

        return Result.Success();
    }
}
