using OfficeOpenXml;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using System.Collections.Generic;

namespace RedSky.Api.Services
{
    public class ExportService
    {
        public byte[] GenerateExcel<T>(List<T> data)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Export");
            
            var properties = typeof(T).GetProperties();
            for (int i = 0; i < properties.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = properties[i].Name;
            }

            for (int i = 0; i < data.Count; i++)
            {
                for (int j = 0; j < properties.Length; j++)
                {
                    worksheet.Cells[i + 2, j + 1].Value = 
                        properties[j].GetValue(data[i])?.ToString();
                }
            }

            return package.GetAsByteArray();
        }

        public byte[] GeneratePdf<T>(List<T> data)
        {
            using var stream = new MemoryStream();
            using var writer = new PdfWriter(stream);
            using var pdf = new PdfDocument(writer);
            using var document = new Document(pdf);
            
            document.Add(new Paragraph("Export Report"));
            
            var properties = typeof(T).GetProperties();
            var table = new Table(properties.Length);
            
            // Add headers
            foreach (var prop in properties)
                table.AddHeaderCell(prop.Name);
            
            // Add data
            foreach (var item in data)
            {
                foreach (var prop in properties)
                    table.AddCell(prop.GetValue(item)?.ToString() ?? "");
            }
            
            document.Add(table);
            
            return stream.ToArray();
        }
    }
}