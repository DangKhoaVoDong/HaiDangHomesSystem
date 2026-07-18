using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBrandNameToProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BrandName",
                table: "Properties",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Properties_BrandName",
                table: "Properties",
                column: "BrandName");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_City",
                table: "Properties",
                column: "City");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Properties_BrandName",
                table: "Properties");

            migrationBuilder.DropIndex(
                name: "IX_Properties_City",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "BrandName",
                table: "Properties");
        }
    }
}
