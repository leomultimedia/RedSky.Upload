using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using RedSky.Api.Data;
using RedSky.Api.Models;

namespace RedSky.Api.Services
{
    public class ExcelImportResult
    {
        public int PatientsInserted { get; set; }
        public int VisitsInserted { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class ExcelImportService
    {
        private readonly AppDbContext _db;
        public ExcelImportService(AppDbContext db)
        {
            _db = db;
        }

        /*public async Task<ExcelImportResult> ImportAsync(Stream fileStream, CancellationToken ct = default)
        {
            var result = new ExcelImportResult();

            using var workbook = new XLWorkbook(fileStream);
            var ws = workbook.Worksheets.First();

            // Expect header row at 1; find column indices by header names
            // Normalize headers to handle variants like "EMR No:", "Ins. Type", etc.
            // Some sheets may repeat the same header (e.g., "Code Type"). We take the first occurrence.
            var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            foreach (var cell in ws.Row(1).CellsUsed())
            {
                var key = NormalizeHeader(cell.GetString());
                if (string.IsNullOrWhiteSpace(key))
                {
                    continue; // skip empty header cells
                }
                if (!headers.ContainsKey(key))
                {
                    headers[key] = cell.Address.ColumnNumber;
                }
            }

            int GetCol(string name)
            {
                var norm = NormalizeHeader(name);
                return headers.TryGetValue(norm, out var idx) ? idx : -1;
            }

            int emrCol = GetCol("EMR No");
            int visitNoCol = GetCol("Visit No");
            if (emrCol == -1 || visitNoCol == -1)
            {
                result.Errors.Add("Missing required headers: 'EMR No' and/or 'Visit No'.");
                return result;
            }

            var emrToPatient = await _db.Patients.AsNoTracking().ToDictionaryAsync(p => p.EmrNo, ct);

            foreach (var row in ws.RowsUsed().Skip(1))
            {
                var emrNo = row.Cell(emrCol).GetString().Trim();
                var visitNo = row.Cell(visitNoCol).GetString().Trim();

                if (string.IsNullOrWhiteSpace(emrNo))
                {
                    result.Errors.Add($"Row {row.RowNumber()}: Missing EMR No");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(visitNo))
                {
                    result.Warnings.Add($"Row {row.RowNumber()}: Missing Visit No");
                }

                if (!emrToPatient.TryGetValue(emrNo, out var patient))
                {
                    patient = new Patient
                    {
                        EmrNo = emrNo,
                        Name = GetString("Pat Name"),
                        Age = GetInt("Age"),
                        Nationality = GetString("Nationality"),
                        InsuranceType = GetString("Ins. Type"),
                        InsuranceCompany = GetString("Ins. Company"),
                        InsuranceGroup = GetString("Ins. Group"),
                        InsurancePlan = GetString("Ins. Plan"),
                        EmiratesId = GetString("Emirates ID"),
                        MemberId = GetString("Member ID")
                    };
                    await _db.Patients.AddAsync(patient, ct);
                    emrToPatient[emrNo] = patient;
                    result.PatientsInserted++;
                }

                if (!string.IsNullOrWhiteSpace(visitNo))
                {
                    var visit = new Visit
                    {
                        VisitNo = visitNo,
                        VisitDate = GetDate("Visit Date"),
                        Department = GetString("Department"),
                        Doctor = GetString("Doctor"),
                        EncType = GetString("Enc Type"),
                        VatAmount = GetDecimal("Vat Amount"),
                        Patient = patient
                    };
                    _db.Visits.Add(visit);
                    result.VisitsInserted++;
                }

                string? GetString(string header)
                {
                    var col = GetCol(header);
                    return col == -1 ? null : row.Cell(col).GetString().Trim();
                }

                int? GetInt(string header)
                {
                    var s = GetString(header);
                    if (int.TryParse(s, out var i)) return i;
                    return null;
                }

                DateTime? GetDate(string header)
                {
                    var col = GetCol(header);
                    if (col == -1) return null;
                    var cell = row.Cell(col);
                    if (cell.DataType == XLDataType.DateTime) return cell.GetDateTime();
                    var s = cell.GetString();
                    if (DateTime.TryParse(s, out var d)) return d;
                    return null;
                }

                decimal? GetDecimal(string header)
                {
                    var s = GetString(header);
                    if (string.IsNullOrWhiteSpace(s)) return null;
                    if (decimal.TryParse(s, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var d)) return d;
                    if (decimal.TryParse(s, out d)) return d;
                    return null;
                }
            }

            await _db.SaveChangesAsync(ct);
            return result;
        }*/
public async Task<ExcelImportResult> ImportAsync(Stream fileStream, CancellationToken ct = default)
{
    var result = new ExcelImportResult();

    using var transaction = await _db.Database.BeginTransactionAsync(ct);
    try
    {
        using var workbook = new XLWorkbook(fileStream);
        var ws = workbook.Worksheets.First();

        // Header processing
        var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var cell in ws.Row(1).CellsUsed())
        {
            var key = NormalizeHeader(cell.GetString());
            if (!string.IsNullOrWhiteSpace(key))
            {
                headers[key] = cell.Address.ColumnNumber;
            }
        }

        // Helper methods
        string? GetString(IXLRow row, string header)
        {
            var norm = NormalizeHeader(header);
            return headers.TryGetValue(norm, out var col) ? 
                row.Cell(col).GetString().Trim() : null;
        }

        int? GetInt(IXLRow row, string header)
        {
            var s = GetString(row, header);
            return s != null && int.TryParse(s, out var i) ? i : null;
        }

        DateTime? GetDate(IXLRow row, string header)
        {
            var norm = NormalizeHeader(header);
            if (!headers.TryGetValue(norm, out var col)) return null;
            
            var cell = row.Cell(col);
            if (cell.DataType == XLDataType.DateTime) 
                return cell.GetDateTime();
            
            var s = cell.GetString().Trim();
            return DateTime.TryParse(s, out var d) ? d : null;
        }

        decimal? GetDecimal(IXLRow row, string header)
        {
            var s = GetString(row, header);
            if (string.IsNullOrWhiteSpace(s)) return null;
            
            if (decimal.TryParse(s, System.Globalization.NumberStyles.Any, 
                System.Globalization.CultureInfo.InvariantCulture, out var d))
                return d;
            
            return decimal.TryParse(s, out d) ? d : null;
        }

        // Validate required columns
        var requiredColumns = new[] { "EMR No", "Pat Name", "Visit No" };
        foreach (var col in requiredColumns)
        {
            if (!headers.ContainsKey(NormalizeHeader(col)))
            {
                result.Errors.Add($"Required column '{col}' not found in Excel file");
                return result;
            }
        }

        // Load existing data
        var emrToPatient = await _db.Patients
            .AsNoTracking()
            .ToDictionaryAsync(p => p.EmrNo, ct);

        var existingVisits = await _db.Visits
            .AsNoTracking()
            .Select(v => v.VisitNo)
            .ToHashSetAsync(ct);

        // Process rows
        foreach (var row in ws.RowsUsed().Skip(1))
        {
            var emrNo = GetString(row, "EMR No");
            var visitNo = GetString(row, "Visit No");
            var rowNum = row.RowNumber();

            // Skip empty rows at the end
            if (string.IsNullOrWhiteSpace(emrNo) && string.IsNullOrWhiteSpace(visitNo))
            {
                continue;
            }

            // Validate required data
            if (string.IsNullOrWhiteSpace(emrNo))
            {
                result.Errors.Add($"Row {rowNum}: Missing EMR No");
                continue;
            }

            try
            {
                // Process patient
                if (!emrToPatient.TryGetValue(emrNo, out var patient))
                {
                    var patName = GetString(row, "Pat Name");
                    if (string.IsNullOrWhiteSpace(patName))
                    {
                        result.Errors.Add($"Row {rowNum}: Missing Patient Name for EMR {emrNo}");
                        continue;
                    }

                    patient = new Patient
                    {
                        EmrNo = emrNo,
                        Name = patName,
                        Age = GetInt(row, "Age") ?? 0,
                        Nationality = GetString(row, "Nationality"),
                        InsuranceType = GetString(row, "Ins. Type"),
                        InsuranceCompany = GetString(row, "Ins. Company"),
                        InsuranceGroup = GetString(row, "Ins. Group"),
                        InsurancePlan = GetString(row, "Ins. Plan"),
                        EmiratesId = GetString(row, "Emirates ID"),
                        MemberId = GetString(row, "Member ID")
                    };

                    await _db.Patients.AddAsync(patient, ct);
                    emrToPatient[emrNo] = patient;
                    result.PatientsInserted++;
                }

                // Process visit
                if (!string.IsNullOrWhiteSpace(visitNo) && !existingVisits.Contains(visitNo))
                {
                    var visit = new Visit
                    {
                        VisitNo = visitNo,
                        VisitDate = GetDate(row, "Visit Date"),
                        Department = GetString(row, "Department"),
                        Doctor = GetString(row, "Doctor"),
                        EncType = GetString(row, "Enc Type"),
                        VatAmount = GetDecimal(row, "Vat Amount") ?? 0m,
                        Patient = patient
                    };

                    _db.Visits.Add(visit);
                    existingVisits.Add(visitNo);
                    result.VisitsInserted++;
                }
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Row {rowNum}: {ex.Message}");
            }
        }

        if (result.PatientsInserted > 0 || result.VisitsInserted > 0)
        {
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }

        return result;
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync(ct);
        result.Errors.Add($"Import failed: {ex.Message}");
        if (ex.InnerException != null)
        {
            result.Errors.Add($"Details: {ex.InnerException.Message}");
        }
        return result;
    }
}

        private static string NormalizeHeader(string? header)
        {
            if (string.IsNullOrWhiteSpace(header)) return string.Empty;
            var s = header.Trim();
            // remove punctuation commonly present in headers
            var chars = s.Where(ch => !":.-_/\\".Contains(ch)).ToArray();
            var noPunct = new string(chars);
            // collapse spaces
            var collapsed = System.Text.RegularExpressions.Regex.Replace(noPunct, "\\s+", " ").Trim();
            return collapsed.ToLowerInvariant();
        }
    }
}


