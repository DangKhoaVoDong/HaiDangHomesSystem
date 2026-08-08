using HaiDangHomes.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260808000300_SetWholeUnitCategoryDefaults")]
public partial class SetWholeUnitCategoryDefaults : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Categories" AS c
            SET "AllowsRooms" = FALSE
            WHERE EXISTS (
                SELECT 1
                FROM "CategoryTranslations" AS t
                WHERE t."CategoryId" = c."Id"
                  AND LOWER(t."Name") IN ('căn hộ', 'apartment')
            );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE "Categories" AS c
            SET "AllowsRooms" = TRUE
            WHERE EXISTS (
                SELECT 1
                FROM "CategoryTranslations" AS t
                WHERE t."CategoryId" = c."Id"
                  AND LOWER(t."Name") IN ('căn hộ', 'apartment')
            );
            """);
    }
}
