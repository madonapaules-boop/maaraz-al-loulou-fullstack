using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MaarazAlLoulou.Api.DTOs;
using MaarazAlLoulou.Api.Models;
using MaarazAlLoulou.Api.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace MaarazAlLoulou.Api.Services;

public sealed class DomainValidationException(string message) : Exception(message);

public interface IProductService
{
    Task<IReadOnlyList<ProductResponse>> ListAsync(ProductQuery query, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductResponse>> ListBestSellersAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductResponse>> ListNewArrivalsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductResponse>> ListOffersAsync(CancellationToken cancellationToken);
    Task<ProductResponse?> GetAsync(int id, CancellationToken cancellationToken);
    Task<ProductResponse> CreateAsync(UpsertProductRequest request, CancellationToken cancellationToken);
    Task<ProductResponse?> UpdateAsync(int id, UpsertProductRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<ProductImageResponse>?> AddImagesAsync(
        int productId,
        IEnumerable<NewProductImage> newImages,
        CancellationToken cancellationToken);
    Task<ProductImageResponse?> DeleteImageAsync(int imageId, CancellationToken cancellationToken);
}

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken cancellationToken);
    Task<CategoryResponse> CreateAsync(UpsertCategoryRequest request, CancellationToken cancellationToken);
    Task<CategoryResponse?> UpdateAsync(int id, UpsertCategoryRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}

public interface IOrderService
{
    Task<IReadOnlyList<OrderResponse>> ListAsync(OrderStatus? status, CancellationToken cancellationToken);
    Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken);
    Task<OrderResponse?> UpdateAsync(int id, UpdateOrderRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}

public interface IAuthenticationService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}

public sealed record NewProductImage(string Url, bool IsMainImage);

public sealed class ProductService(
    IRepository<Product> productRepository,
    IRepository<Category> categoryRepository,
    IRepository<ProductImage> imageRepository,
    IUnitOfWork unitOfWork) : IProductService
{
    public async Task<IReadOnlyList<ProductResponse>> ListAsync(
        ProductQuery query,
        CancellationToken cancellationToken)
    {
        IQueryable<Product> products = productRepository.Query()
            .AsNoTracking()
            .Include(product => product.Category)
            .Include(product => product.Images);

        products = ApplyFilters(products, query);
        products = ApplySort(products, query.Sort);

        var entities = await products.ToListAsync(cancellationToken);
        return entities.Select(ProductMapper.ToResponse).ToList();
    }

    public Task<IReadOnlyList<ProductResponse>> ListBestSellersAsync(CancellationToken cancellationToken) =>
        ListByFlagAsync(product => product.IsBestSeller, cancellationToken);

    public Task<IReadOnlyList<ProductResponse>> ListNewArrivalsAsync(CancellationToken cancellationToken) =>
        ListByFlagAsync(product => product.IsNewArrival, cancellationToken);

    public Task<IReadOnlyList<ProductResponse>> ListOffersAsync(CancellationToken cancellationToken) =>
        ListByFlagAsync(product => product.IsOnOffer, cancellationToken);

    public async Task<ProductResponse?> GetAsync(int id, CancellationToken cancellationToken)
    {
        var product = await GetTrackedProductAsync(id, cancellationToken);
        return product is null ? null : ProductMapper.ToResponse(product);
    }

    public async Task<ProductResponse> CreateAsync(UpsertProductRequest request, CancellationToken cancellationToken)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);

        var product = new Product();
        ApplyRequest(product, request);
        await productRepository.AddAsync(product, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return (await GetAsync(product.Id, cancellationToken))!;
    }

    public async Task<ProductResponse?> UpdateAsync(
        int id,
        UpsertProductRequest request,
        CancellationToken cancellationToken)
    {
        var product = await GetTrackedProductAsync(id, cancellationToken);
        if (product is null)
        {
            return null;
        }

        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);
        ApplyRequest(product, request);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ProductMapper.ToResponse(product);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var product = await productRepository.FindAsync(id, cancellationToken);
        if (product is null)
        {
            return false;
        }

        productRepository.Remove(product);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<ProductImageResponse>?> AddImagesAsync(
        int productId,
        IEnumerable<NewProductImage> newImages,
        CancellationToken cancellationToken)
    {
        var product = await GetTrackedProductAsync(productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        foreach (var newImage in newImages)
        {
            if (newImage.IsMainImage)
            {
                foreach (var existingImage in product.Images)
                {
                    existingImage.IsMainImage = false;
                }
            }

            product.Images.Add(new ProductImage
            {
                ImageUrl = newImage.Url,
                IsMainImage = newImage.IsMainImage || product.Images.Count == 0,
            });
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return product.Images.Select(ProductMapper.ToImageResponse).ToList();
    }

    public async Task<ProductImageResponse?> DeleteImageAsync(int imageId, CancellationToken cancellationToken)
    {
        var image = await imageRepository.FindAsync(imageId, cancellationToken);
        if (image is null)
        {
            return null;
        }

        var response = ProductMapper.ToImageResponse(image);
        imageRepository.Remove(image);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    private async Task<IReadOnlyList<ProductResponse>> ListByFlagAsync(
        System.Linq.Expressions.Expression<Func<Product, bool>> predicate,
        CancellationToken cancellationToken)
    {
        var products = await productRepository.Query()
            .AsNoTracking()
            .Where(predicate)
            .OrderByDescending(product => product.CreatedAt)
            .Include(product => product.Category)
            .Include(product => product.Images)
            .ToListAsync(cancellationToken);

        return products.Select(ProductMapper.ToResponse).ToList();
    }

    private async Task<Product?> GetTrackedProductAsync(int id, CancellationToken cancellationToken) =>
        await productRepository.Query()
            .Include(product => product.Category)
            .Include(product => product.Images)
            .FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken cancellationToken)
    {
        if (await categoryRepository.FindAsync(categoryId, cancellationToken) is null)
        {
            throw new DomainValidationException("القسم المحدد غير موجود.");
        }
    }

    private static IQueryable<Product> ApplyFilters(IQueryable<Product> products, ProductQuery query)
    {
        if (query.CategoryId.HasValue)
        {
            products = products.Where(product => product.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Color))
        {
            products = products.Where(product => product.Color == query.Color.Trim());
        }

        if (query.MinPrice.HasValue)
        {
            products = products.Where(product =>
                (product.IsOnOffer && product.DiscountPrice.HasValue
                    ? product.DiscountPrice.Value
                    : product.Price) >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            products = products.Where(product =>
                (product.IsOnOffer && product.DiscountPrice.HasValue
                    ? product.DiscountPrice.Value
                    : product.Price) <= query.MaxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            products = products.Where(product =>
                product.Name.Contains(searchTerm) || product.Description.Contains(searchTerm));
        }

        return products;
    }

    private static IQueryable<Product> ApplySort(IQueryable<Product> products, string? sort) =>
        sort?.Trim().ToLowerInvariant() switch
        {
            "price_asc" => products.OrderBy(product =>
                product.IsOnOffer && product.DiscountPrice.HasValue
                    ? product.DiscountPrice.Value
                    : product.Price),
            "price_desc" => products.OrderByDescending(product =>
                product.IsOnOffer && product.DiscountPrice.HasValue
                    ? product.DiscountPrice.Value
                    : product.Price),
            _ => products.OrderByDescending(product => product.CreatedAt),
        };

    private static void ApplyRequest(Product product, UpsertProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;
        product.Color = request.Color.Trim();
        product.StockQuantity = request.StockQuantity;
        product.IsBestSeller = request.IsBestSeller;
        product.IsNewArrival = request.IsNewArrival;
        product.IsOnOffer = request.IsOnOffer;
        product.DiscountPrice = request.IsOnOffer ? request.DiscountPrice : null;
        product.UpdatedAt = DateTime.UtcNow;
    }
}

public sealed class CategoryService(
    IRepository<Category> categoryRepository,
    IRepository<Product> productRepository,
    IUnitOfWork unitOfWork) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.Query()
            .AsNoTracking()
            .OrderBy(category => category.NameArabic)
            .ToListAsync(cancellationToken);

        return categories.Select(CategoryMapper.ToResponse).ToList();
    }

    public async Task<CategoryResponse> CreateAsync(
        UpsertCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = new Category();
        ApplyRequest(category, request);
        await categoryRepository.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return CategoryMapper.ToResponse(category);
    }

    public async Task<CategoryResponse?> UpdateAsync(
        int id,
        UpsertCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await categoryRepository.FindAsync(id, cancellationToken);
        if (category is null)
        {
            return null;
        }

        ApplyRequest(category, request);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return CategoryMapper.ToResponse(category);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.FindAsync(id, cancellationToken);
        if (category is null)
        {
            return false;
        }

        var containsProducts = await productRepository.Query()
            .AnyAsync(product => product.CategoryId == id, cancellationToken);
        if (containsProducts)
        {
            throw new DomainValidationException("لا يمكن حذف قسم مرتبط بمنتجات.");
        }

        categoryRepository.Remove(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static void ApplyRequest(Category category, UpsertCategoryRequest request)
    {
        category.NameArabic = request.NameArabic.Trim();
        category.NameEnglish = request.NameEnglish.Trim();
        category.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
    }
}

public sealed class OrderService(
    IRepository<Order> orderRepository,
    IRepository<Product> productRepository,
    IUnitOfWork unitOfWork) : IOrderService
{
    public async Task<IReadOnlyList<OrderResponse>> ListAsync(
        OrderStatus? status,
        CancellationToken cancellationToken)
    {
        var orders = orderRepository.Query()
            .AsNoTracking()
            .Include(order => order.Items)
            .OrderByDescending(order => order.OrderDate);

        if (status.HasValue)
        {
            orders = orders.Where(order => order.Status == status.Value).OrderByDescending(order => order.OrderDate);
        }

        return (await orders.ToListAsync(cancellationToken))
            .Select(OrderMapper.ToResponse)
            .ToList();
    }

    public async Task<OrderResponse> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var productIds = request.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await productRepository.Query()
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        if (products.Count != productIds.Count)
        {
            throw new DomainValidationException("يوجد منتج غير موجود في الطلب.");
        }

        var order = new Order
        {
            CustomerName = request.CustomerName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            Status = request.Status,
        };

        foreach (var line in request.Items)
        {
            var product = products[line.ProductId];
            if (product.StockQuantity < line.Quantity)
            {
                throw new DomainValidationException($"الكمية المطلوبة غير متاحة للمنتج: {product.Name}.");
            }

            var unitPrice = product.IsOnOffer && product.DiscountPrice.HasValue
                ? product.DiscountPrice.Value
                : product.Price;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = line.Quantity,
                UnitPrice = unitPrice,
            });
        }

        order.TotalPrice = order.Items.Sum(item => item.UnitPrice * item.Quantity);
        await orderRepository.AddAsync(order, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return OrderMapper.ToResponse(order);
    }

    public async Task<OrderResponse?> UpdateAsync(
        int id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken)
    {
        var order = await orderRepository.Query()
            .Include(existingOrder => existingOrder.Items)
            .FirstOrDefaultAsync(existingOrder => existingOrder.Id == id, cancellationToken);
        if (order is null)
        {
            return null;
        }

        order.Status = request.Status;
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return OrderMapper.ToResponse(order);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var order = await orderRepository.FindAsync(id, cancellationToken);
        if (order is null)
        {
            return false;
        }

        orderRepository.Remove(order);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed class AuthenticationService(
    IRepository<AdminUser> userRepository,
    IConfiguration configuration) : IAuthenticationService
{
    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.Query()
            .FirstOrDefaultAsync(existingUser => existingUser.Username == request.Username, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        var expiresAt = DateTime.UtcNow.AddHours(8);
        var signingKey = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            configuration["Jwt:Issuer"],
            configuration["Jwt:Audience"],
            claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new LoginResponse(
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt,
            user.Username,
            user.Role);
    }
}

internal static class ProductMapper
{
    public static ProductResponse ToResponse(Product product) => new(
        product.Id,
        product.Name,
        product.Description,
        product.Price,
        product.DiscountPrice,
        product.IsOnOffer && product.DiscountPrice.HasValue ? product.DiscountPrice.Value : product.Price,
        product.CategoryId,
        product.Category?.NameArabic ?? string.Empty,
        product.Color,
        product.StockQuantity,
        product.StockQuantity > 0,
        product.IsBestSeller,
        product.IsNewArrival,
        product.IsOnOffer,
        product.CreatedAt,
        product.Images
            .OrderByDescending(image => image.IsMainImage)
            .Select(ToImageResponse)
            .ToList());

    public static ProductImageResponse ToImageResponse(ProductImage image) =>
        new(image.Id, image.ImageUrl, image.IsMainImage);
}

internal static class CategoryMapper
{
    public static CategoryResponse ToResponse(Category category) =>
        new(category.Id, category.NameArabic, category.NameEnglish, category.Description);
}

internal static class OrderMapper
{
    public static OrderResponse ToResponse(Order order) => new(
        order.Id,
        order.CustomerName,
        order.PhoneNumber,
        order.TotalPrice,
        order.OrderDate,
        order.Status,
        order.Items
            .Select(item => new OrderItemResponse(item.ProductId, item.ProductName, item.Quantity, item.UnitPrice))
            .ToList());
}
