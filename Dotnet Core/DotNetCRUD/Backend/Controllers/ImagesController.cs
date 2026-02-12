using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IO;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ImagesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public ImagesController(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<IActionResult> GetImages()
    {
        var userId = GetUserId();
        var images = await _context.Images
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = images });
    }

    [HttpPost]
    public async Task<IActionResult> CreateImage([FromBody] CreateImageRequest request)
    {
        if (string.IsNullOrEmpty(request.Title) || string.IsNullOrEmpty(request.Url))
        {
            return BadRequest(new { success = false, message = "Title and URL are required" });
        }

        var userId = GetUserId();
        var image = new Image
        {
            UserId = userId,
            Title = request.Title,
            Url = request.Url,
            Description = request.Description ?? ""
        };

        _context.Images.Add(image);
        await _context.SaveChangesAsync();

        return StatusCode(201, new { success = true, data = image });
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage([FromForm] UploadImageRequest request)
    {
        if (request.Image == null || request.Image.Length == 0)
        {
            return BadRequest(new { success = false, message = "No image file provided" });
        }

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(request.Image.ContentType))
        {
            return BadRequest(new { success = false, message = "Only image files are allowed" });
        }

        var uploadsPath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "images");
        Directory.CreateDirectory(uploadsPath);

        var uniqueName = $"{DateTime.Now.Ticks}_{request.Image.FileName}";
        var filePath = Path.Combine(uploadsPath, uniqueName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.Image.CopyToAsync(stream);
        }

        var userId = GetUserId();
        var image = new Image
        {
            UserId = userId,
            Title = string.IsNullOrEmpty(request.Title) ? request.Image.FileName : request.Title,
            Url = $"/uploads/images/{uniqueName}",
            Description = request.Description ?? ""
        };

        _context.Images.Add(image);
        await _context.SaveChangesAsync();

        return StatusCode(201, new { success = true, data = image });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateImage(int id, [FromBody] UpdateImageRequest request)
    {
        var userId = GetUserId();
        var image = await _context.Images.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (image == null)
        {
            return NotFound(new { success = false, message = "Image not found" });
        }

        if (!string.IsNullOrEmpty(request.Title))
            image.Title = request.Title;
        if (!string.IsNullOrEmpty(request.Description))
            image.Description = request.Description;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = image });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var userId = GetUserId();
        var image = await _context.Images.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (image == null)
        {
            return NotFound(new { success = false, message = "Image not found" });
        }

        // Delete physical file if it's uploaded
        if (image.Url.StartsWith("/uploads/"))
        {
            var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, image.Url.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.Images.Remove(image);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Image deleted" });
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("id")?.Value;
        return int.Parse(userIdClaim!);
    }
}

public class CreateImageRequest
{
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UploadImageRequest
{
    public IFormFile Image { get; set; } = null!;
    public string? Title { get; set; }
    public string? Description { get; set; }
}

public class UpdateImageRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
}
