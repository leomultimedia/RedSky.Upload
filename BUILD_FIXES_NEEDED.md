# Build Fixes Required

## Current Status:
- ❌ Backend build failing with 7 errors
- ✅ Frontend components created
- ✅ Most services implemented

## Immediate Fixes Needed:

### 1. Backend Compilation Errors:
The main issues are in DashboardController.cs and related files:

1. **Missing using statements** - Add these to DashboardController.cs:
   ```csharp
   using Microsoft.AspNetCore.Mvc;
   using Microsoft.AspNetCore.Authorization;
   using Microsoft.EntityFrameworkCore;
   using RedSky.Api.Data;
   using RedSky.Api.Models;
   ```

2. **Fix anonymous object syntax** in DashboardController.cs line 59:
   ```csharp
   return Ok(new { total = total, data = patients });
   ```

3. **Update patient statistics query** to work with existing Visit model:
   ```csharp
   var stats = await _context.Visits
       .Where(v => v.VisitDate >= dateFrom)
       .GroupBy(v => v.VisitDate.Value.Date)
       .Select(g => new {
           Date = g.Key,
           NewPatients = g.Select(v => v.PatientId).Distinct().Count(),
           ReturningPatients = g.Count()
       })
       .OrderBy(s => s.Date)
       .ToListAsync();
   ```

### 2. Quick Fix Commands:

```bash
# Backend
cd backend
dotnet clean
dotnet restore
dotnet build

# Frontend (in separate terminal)
cd frontend
npm install chart.js chartjs-plugin-zoom date-fns @faker-js/faker react-query
npm start
```

### 3. Alternative Approach:
If build continues to fail, temporarily comment out:
- DashboardController.cs
- ExportController.cs
- SeedController.cs

This will allow the basic application to run, then fix issues one by one.

### 4. Expected Working Features:
Once fixed:
- ✅ Excel upload (existing functionality)
- ✅ Patient/Visit data viewing
- ✅ Dashboard with charts
- ✅ Export to Excel/PDF
- ✅ Sample data generation

## Next Steps:
1. Fix the compilation errors above
2. Test basic functionality
3. Add missing frontend routes to App.tsx
4. Test dashboard features
