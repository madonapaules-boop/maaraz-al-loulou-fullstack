using MaarazAlLoulou.Api.DTOs;
using MaarazAlLoulou.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MaarazAlLoulou.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(
    IProductService productService,
    IProductImageStorage imageStorage) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<ProductResponse>> ListAsync([FromQuery] ProductQuery query, CancellationToken cancellationToken) =>
        productService.ListAsync(query, cancellationToken);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponse>> GetAsync(int id, CancellationToken cancellationToken)
    {
        var product = await productService.GetAsync(id, cancellationToken);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("best-sellers")]
    public Task<IReadOnlyList<ProductResponse>> GetBestSellersAsync(CancellationToken cancellationToken) =>
        productService.ListBestSellersAsync(cancellationToken);

    [HttpGet("new-arrivals")]
    public Task<IReadOnlyList<ProductResponse>> GetNewArrivalsAsync(CancellationToken cancellationToken) =>
        productService.ListNewArrivalsAsync(cancellationToken);

    [HttpGet("offers")]
    public Task<IReadOnlyList<ProductResponse>> GetOffersAsync(CancellationToken cancellationToken) =>
        productService.ListOffersAsync(cancellationToken);

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ProductResponse>> CreateAsync(
        UpsertProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await productService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAsync), new { id = product.Id }, product);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponse>> UpdateAsync(
        int id,
        UpsertProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await productService.UpdateAsync(id, request, cancellationToken);
        return product is null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAsync(int id, CancellationToken cancellationToken) =>
        await productService.DeleteAsync(id, cancellationToken) ? NoContent() : NotFound();

    [Authorize(Roles = "Admin")]
    [HttpPost("{id:int}/images")]
    [RequestSizeLimit(25 * 1024 * 1024)]
    public async Task<ActionResult<IReadOnlyList<ProductImageResponse>>> UploadImagesAsync(
        int id,
        [FromForm] List<IFormFile> files,
        [FromForm] int? mainImageIndex,
        CancellationToken cancellationToken)
    {
        var uploadedImages = await imageStorage.SaveAsync(files, mainImageIndex, cancellationToken);
        var productImages = await productService.AddImagesAsync(id, uploadedImages, cancellationToken);

        if (productImages is null)
        {
            foreach (var image in uploadedImages)
            {
                await imageStorage.DeleteAsync(image.Url, cancellationToken);
            }

            return NotFound();
        }

        return Ok(productImages);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("images/{imageId:int}")]
    public async Task<IActionResult> DeleteImageAsync(int imageId, CancellationToken cancellationToken)
    {
        var image = await productService.DeleteImageAsync(imageId, cancellationToken);
        if (image is null)
        {
            return NotFound();
        }

        await imageStorage.DeleteAsync(image.ImageUrl, cancellationToken);
        return NoContent();
    }
}
