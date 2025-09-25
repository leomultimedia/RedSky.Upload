using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RedSky.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Patients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    EmrNo = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    Age = table.Column<int>(type: "INTEGER", nullable: true),
                    Nationality = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    InsuranceType = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    InsuranceCompany = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    InsurancePlan = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    InsuranceGroup = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    EmiratesId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    MemberId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Patients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    VisitNo = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    VisitDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Department = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    Doctor = table.Column<string>(type: "TEXT", maxLength: 128, nullable: true),
                    EncType = table.Column<string>(type: "TEXT", maxLength: 32, nullable: true),
                    VatAmount = table.Column<decimal>(type: "TEXT", nullable: true),
                    PatientId = table.Column<int>(type: "INTEGER", nullable: false),
                    BillNo = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    ClaimUniqueId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Visits_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Patients_EmrNo",
                table: "Patients",
                column: "EmrNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Visits_PatientId",
                table: "Visits",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_VisitNo",
                table: "Visits",
                column: "VisitNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Visits");

            migrationBuilder.DropTable(
                name: "Patients");
        }
    }
}
