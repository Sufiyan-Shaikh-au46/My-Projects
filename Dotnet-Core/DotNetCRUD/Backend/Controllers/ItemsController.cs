using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems()
    {
        var userId = GetUserId();
        var items = await _context.Items
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = items });
    }

    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] CreateItemRequest request)
    {
        if (string.IsNullOrEmpty(request.Title))
        {
            return BadRequest(new { success = false, message = "Title is required" });
        }

        var userId = GetUserId();
        var item = new Item
        {
            UserId = userId,
            Title = request.Title,
            Description = request.Description ?? ""
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return StatusCode(201, new { success = true, data = item });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItemRequest request)
    {
        var userId = GetUserId();
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (item == null)
        {
            return NotFound(new { success = false, message = "Item not found" });
        }

        if (!string.IsNullOrEmpty(request.Title))
            item.Title = request.Title;
        if (!string.IsNullOrEmpty(request.Description))
            item.Description = request.Description;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = item });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var userId = GetUserId();
        var item = await _context.Items.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (item == null)
        {
            return NotFound(new { success = false, message = "Item not found" });
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Item deleted" });
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("id")?.Value;
        return int.Parse(userIdClaim!);
    }
}

public class CreateItemRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateItemRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
}
