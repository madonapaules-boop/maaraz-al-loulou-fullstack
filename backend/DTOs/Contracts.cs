using System.ComponentModel.DataAnnotations;
using MaarazAlLoulou.Api.Models;

namespace MaarazAlLoulou.Api.DTOs;

public sealed class ProductQuery
{
    public int? CategoryId { get; init; }
    public string? Color { get; init; }

    [Range(0, double.MaxValue)]
    public decimal? MinPrice { get; init; }

    [Range(0, double.MaxValue)]
    public decimal? MaxPrice { get; init; }

    public string? Sort { get; init; }
    public string? Search { get; init; }
}

public sealed record ProductImageResponse(int Id, string ImageUrl, bool IsMainImage);

public sealed record ProductResponse(
    int Id,
    string Name,
    string Description,
    decimal Price,
    decimal? DiscountPrice,
    decimal FinalPrice,
    int CategoryId,
    string CategoryNameArabic,
    string Color,
    int StockQuantity,
    bool IsAvailable,
    bool IsBestSeller,
    bool IsNewArrival,
    bool IsOnOffer,
    DateTime CreatedAt,
    IReadOnlyList<ProductImageResponse> Images);

public sealed record CategoryResponse(int Id, string NameArabic, string NameEnglish, string? Description);

public sealed record OrderItemResponse(int ProductId, string ProductName, int Quantity, decimal UnitPrice);

public sealed record OrderResponse(
    int Id,
    string CustomerName,
    string PhoneNumber,
    decimal TotalPrice,
    DateTime OrderDate,
    OrderStatus Status,
    IReadOnlyList<OrderItemResponse> Items);

public sealed class UpsertProductRequest : IValidatableObject
{
    [Required, StringLength(160)]
    public string Name { get; init; } = string.Empty;

    [Required, StringLength(1500)]
    public string Description { get; init; } = string.Empty;

    [Range(typeof(decimal), "0.01", "9999999")]
    public decimal Price { get; init; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; init; }

    [Required, StringLength(80)]
    public string Color { get; init; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; init; }

    public bool IsBestSeller { get; init; }
    public bool IsNewArrival { get; init; }
    public bool IsOnOffer { get; init; }

    [Range(typeof(decimal), "0.01", "9999999")]
    public decimal? DiscountPrice { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (IsOnOffer && (!DiscountPrice.HasValue || DiscountPrice >= Price))
        {
            yield return new ValidationResult(
                "سعر العرض مطلوب ويجب أن يكون أقل من السعر الأصلي.",
                [nameof(DiscountPrice)]);
        }

        if (!IsOnOffer && DiscountPrice.HasValue)
        {
            yield return new ValidationResult(
                "لا يمكن تحديد سعر عرض إلا عند تفعيل العرض.",
                [nameof(DiscountPrice)]);
        }
    }
}

public sealed class UpsertCategoryRequest
{
    [Required, StringLength(120)]
    public string NameArabic { get; init; } = string.Empty;

    [Required, StringLength(120)]
    public string NameEnglish { get; init; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; init; }
}

public sealed class LoginRequest
{
    [Required, StringLength(80)]
    public string Username { get; init; } = string.Empty;

    [Required, StringLength(200)]
    public string Password { get; init; } = string.Empty;
}

public sealed record LoginResponse(string Token, DateTime ExpiresAt, string Username, string Role);

public sealed class OrderLineRequest
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; init; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; init; }
}

public sealed class CreateOrderRequest
{
    [Required, StringLength(160)]
    public string CustomerName { get; init; } = string.Empty;

    [Required, StringLength(32)]
    public string PhoneNumber { get; init; } = string.Empty;

    [MinLength(1)]
    public List<OrderLineRequest> Items { get; init; } = [];

    public OrderStatus Status { get; init; } = OrderStatus.Pending;
}

public sealed class UpdateOrderRequest
{
    [Required]
    public OrderStatus Status { get; init; }
}
