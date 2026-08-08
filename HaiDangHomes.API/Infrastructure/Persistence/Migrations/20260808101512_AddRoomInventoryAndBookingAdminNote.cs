using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomInventoryAndBookingAdminNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalUnits",
                table: "Rooms",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "Bookings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalUnits",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "Bookings");

        }
    }
}
