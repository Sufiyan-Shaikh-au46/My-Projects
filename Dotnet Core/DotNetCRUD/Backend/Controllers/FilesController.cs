using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;
using System.Net.Http.Headers;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public FilesController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetFiles()
    {
        var userId = GetUserId();
        var files = await _context.Files
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = files });
    }

    [HttpPost]
    public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
    {
        if (request.File == null || request.File.Length == 0)
        {
            return BadRequest(new { success = false, message = "No file provided" });
        }

        if (string.IsNullOrEmpty(request.Title))
        {
            return BadRequest(new { success = false, message = "Title is required" });
        }

        var allowedTypes = new[] { "application/pdf", "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "image/jpeg", "image/png", "image/gif", "image/webp" };

        if (!allowedTypes.Contains(request.File.ContentType))
        {
            return BadRequest(new { success = false, message = "Invalid file type" });
        }

        var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "files");
        Directory.CreateDirectory(uploadsPath);

        var uniqueName = $"{DateTime.Now.Ticks}_{request.File.FileName}";
        var filePath = Path.Combine(uploadsPath, uniqueName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream);
        }

        var userId = GetUserId();
        var file = new FileModel
        {
            UserId = userId,
            OriginalName = request.File.FileName,
            StoredName = uniqueName,
            MimeType = request.File.ContentType,
            Size = request.File.Length,
            Title = request.Title,
            Description = request.Description ?? "",
            Path = Path.Combine("uploads", "files", uniqueName).Replace("\\", "/")
        };

        _context.Files.Add(file);
        await _context.SaveChangesAsync();

        return StatusCode(201, new { success = true, data = file });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFile(int id, [FromBody] UpdateFileRequest request)
    {
        var userId = GetUserId();
        var file = await _context.Files.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (file == null)
        {
            return NotFound(new { success = false, message = "File not found" });
        }

        file.Title = request.Title ?? file.Title;
        file.Description = request.Description ?? file.Description;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = file });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFile(int id)
    {
        var userId = GetUserId();
        var file = await _context.Files.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (file == null)
        {
            return NotFound(new { success = false, message = "File not found" });
        }

        // Delete physical file
        var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, file.Path);
        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.Files.Remove(file);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "File deleted" });
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(int id)
    {
        var userId = GetUserId();
        var file = await _context.Files.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

        if (file == null)
        {
            return NotFound(new { success = false, message = "File not found" });
        }

        var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, file.Path);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { success = false, message = "File not found on disk" });
        }

        var stream = System.IO.File.OpenRead(filePath);
        return File(stream, file.MimeType, file.OriginalName);
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("id")?.Value;
        return int.Parse(userIdClaim!);
    }
}

public class UploadFileRequest
{
    public IFormFile File { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateFileRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
}
