using MaarazAlLoulou.Api.DTOs;
using MaarazAlLoulou.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MaarazAlLoulou.Api.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken cancellationToken) =>
        categoryService.ListAsync(cancellationToken);

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> CreateAsync(
        UpsertCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await categoryService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(ListAsync), new { id = category.Id }, category);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> UpdateAsync(
        int id,
        UpsertCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await categoryService.UpdateAsync(id, request, cancellationToken);
        return category is null ? NotFound() : Ok(category);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id, CancellationToken cancellationToken) =>
        await categoryService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();
}
