using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using HaiDangHomes.Infrastructure.Persistence;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260808000100_MakeBookingUserOptional")]
public partial class MakeBookingUserOptional : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "UserId",
            table: "Bookings",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DELETE FROM "Bookings"
            WHERE "UserId" IS NULL;
            """);

        migrationBuilder.AlterColumn<Guid>(
            name: "UserId",
            table: "Bookings",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty,
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);
    }
}
