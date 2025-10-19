using Foyer.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foyer.Migrations
{
    /// <inheritdoc />
    public partial class AddFrequency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:frequency", "daily,monthly,never,weekly,yearly");

            migrationBuilder.AddColumn<Frequency>(
                name: "frequency",
                table: "tasks",
                type: "frequency",
                nullable: false,
                defaultValue: Frequency.Never);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "frequency",
                table: "tasks");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:Enum:frequency", "daily,monthly,never,weekly,yearly");
        }
    }
}
