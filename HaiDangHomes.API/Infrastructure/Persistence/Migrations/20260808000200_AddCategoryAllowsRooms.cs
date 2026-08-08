using HaiDangHomes.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260808000200_AddCategoryAllowsRooms")]
public partial class AddCategoryAllowsRooms : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "AllowsRooms",
            table: "Categories",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        migrationBuilder.Sql("""
            UPDATE "Categories"
            SET "AllowsRooms" = FALSE
            WHERE LOWER("Name") IN ('căn hộ', 'apartment');
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "AllowsRooms",
            table: "Categories");
    }
}
