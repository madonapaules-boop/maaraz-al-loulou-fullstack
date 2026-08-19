using Microsoft.AspNetCore.Http;

namespace MaarazAlLoulou.Api.Services;

public interface IProductImageStorage
{
    Task<IReadOnlyList<NewProductImage>> SaveAsync(
        IReadOnlyList<IFormFile> files,
        int? mainImageIndex,
        CancellationToken cancellationToken);

    Task DeleteAsync(string imageUrl, CancellationToken cancellationToken);
}

public sealed class LocalProductImageStorage(IWebHostEnvironment environment) : IProductImageStorage
{
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    public async Task<IReadOnlyList<NewProductImage>> SaveAsync(
        IReadOnlyList<IFormFile> files,
        int? mainImageIndex,
        CancellationToken cancellationToken)
    {
        if (files.Count == 0)
        {
            throw new DomainValidationException("يرجى اختيار صورة واحدة على الأقل.");
        }

        ValidateFiles(files);
        var uploadDirectory = Path.Combine(environment.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadDirectory);

        var savedImages = new List<NewProductImage>();
        for (var index = 0; index < files.Count; index++)
        {
            var file = files[index];
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var storedFileName = $"{Guid.NewGuid():N}{extension}";
            var physicalPath = Path.Combine(uploadDirectory, storedFileName);

            await using var output = File.Create(physicalPath);
            await file.CopyToAsync(output, cancellationToken);
            savedImages.Add(new NewProductImage($"/uploads/{storedFileName}", mainImageIndex == index));
        }

        return savedImages;
    }

    public Task DeleteAsync(string imageUrl, CancellationToken cancellationToken)
    {
        if (!imageUrl.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return Task.CompletedTask;
        }

        var fileName = Path.GetFileName(imageUrl);
        var physicalPath = Path.Combine(environment.WebRootPath, "uploads", fileName);
        if (File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }

        return Task.CompletedTask;
    }

    private static void ValidateFiles(IReadOnlyList<IFormFile> files)
    {
        var containsInvalidFile = files.Any(file =>
            file.Length <= 0 ||
            file.Length > MaxFileSizeBytes ||
            !AllowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()));

        if (containsInvalidFile)
        {
            throw new DomainValidationException("الصور المسموحة هي JPG وPNG وWebP بحجم يصل إلى 5MB لكل صورة.");
        }
    }
}
