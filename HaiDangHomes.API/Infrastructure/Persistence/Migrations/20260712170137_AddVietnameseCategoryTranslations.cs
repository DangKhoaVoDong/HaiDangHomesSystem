using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVietnameseCategoryTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert Vietnamese translations for the 4 default categories only when
            // the (CategoryId, Language) pair does not already exist. Idempotent so
            // re-running the migration is safe.
            migrationBuilder.Sql(@"
                INSERT INTO ""CategoryTranslations"" (""Id"", ""CategoryId"", ""Language"", ""Name"", ""Description"", ""CreatedAt"", ""CreatedBy"")
                SELECT gen_random_uuid(), ""Id"", 1, 'Khách sạn', 'Cơ sở lưu trú chuyên nghiệp với đầy đủ dịch vụ', NOW(), 'seed-vi'
                FROM ""Categories""
                WHERE ""Name"" = 'Khach san'
                  AND NOT EXISTS (
                      SELECT 1 FROM ""CategoryTranslations"" ct
                      WHERE ct.""CategoryId"" = ""Categories"".""Id"" AND ct.""Language"" = 1
                  );

                INSERT INTO ""CategoryTranslations"" (""Id"", ""CategoryId"", ""Language"", ""Name"", ""Description"", ""CreatedAt"", ""CreatedBy"")
                SELECT gen_random_uuid(), ""Id"", 1, 'Homestay', 'Trải nghiệm sống như người bản địa', NOW(), 'seed-vi'
                FROM ""Categories""
                WHERE ""Name"" = 'Homestay'
                  AND NOT EXISTS (
                      SELECT 1 FROM ""CategoryTranslations"" ct
                      WHERE ct.""CategoryId"" = ""Categories"".""Id"" AND ct.""Language"" = 1
                  );

                INSERT INTO ""CategoryTranslations"" (""Id"", ""CategoryId"", ""Language"", ""Name"", ""Description"", ""CreatedAt"", ""CreatedBy"")
                SELECT gen_random_uuid(), ""Id"", 1, 'Resort', 'Khu nghỉ dưỡng cao cấp, nhiều tiện ích', NOW(), 'seed-vi'
                FROM ""Categories""
                WHERE ""Name"" = 'Resort'
                  AND NOT EXISTS (
                      SELECT 1 FROM ""CategoryTranslations"" ct
                      WHERE ct.""CategoryId"" = ""Categories"".""Id"" AND ct.""Language"" = 1
                  );

                INSERT INTO ""CategoryTranslations"" (""Id"", ""CategoryId"", ""Language"", ""Name"", ""Description"", ""CreatedAt"", ""CreatedBy"")
                SELECT gen_random_uuid(), ""Id"", 1, 'Căn hộ', 'Căn hộ cho thuê đầy đủ nội thất', NOW(), 'seed-vi'
                FROM ""Categories""
                WHERE ""Name"" = 'Can ho'
                  AND NOT EXISTS (
                      SELECT 1 FROM ""CategoryTranslations"" ct
                      WHERE ct.""CategoryId"" = ""Categories"".""Id"" AND ct.""Language"" = 1
                  );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM ""CategoryTranslations""
                WHERE ""Language"" = 1
                  AND ""Name"" IN ('Khách sạn', 'Homestay', 'Resort', 'Căn hộ');
            ");
        }
    }
}
