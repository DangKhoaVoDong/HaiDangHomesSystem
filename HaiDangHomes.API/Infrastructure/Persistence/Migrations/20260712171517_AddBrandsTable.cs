using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HaiDangHomes.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBrandsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Brands_Name",
                table: "Brands",
                column: "Name",
                unique: true);

            // Idempotent seed for the two default brands. Brand table is new; existing
            // properties referencing HAIDANG HOMESTAYS / NOVA WORD will validate against
            // these rows once AddBrandsTable is applied.
            migrationBuilder.Sql(@"
                INSERT INTO ""Brands"" (""Id"", ""Name"", ""Description"", ""IsActive"", ""CreatedAt"", ""IsDeleted"", ""CreatedBy"")
                SELECT gen_random_uuid(), 'HAIDANG HOMESTAYS', 'Thuong hieu homestay truyen thong Viet Nam', TRUE, NOW(), FALSE, 'system'
                WHERE NOT EXISTS (SELECT 1 FROM ""Brands"" WHERE ""Name"" = 'HAIDANG HOMESTAYS');

                INSERT INTO ""Brands"" (""Id"", ""Name"", ""Description"", ""IsActive"", ""CreatedAt"", ""IsDeleted"", ""CreatedBy"")
                SELECT gen_random_uuid(), 'NOVA WORD', 'Thuong hieu can hoi hien dai', TRUE, NOW(), FALSE, 'system'
                WHERE NOT EXISTS (SELECT 1 FROM ""Brands"" WHERE ""Name"" = 'NOVA WORD');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Brands");
        }
    }
}
