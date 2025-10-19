using Foyer.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foyer.Migrations
{
    /// <inheritdoc />
    public partial class AddFrequencyMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Meta>(
                name: "meta",
                table: "tasks",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "meta",
                table: "tasks");
        }
    }
}
