using MaarazAlLoulou.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MaarazAlLoulou.Api.Data;

public sealed class MaarazDbContext(DbContextOptions<MaarazDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<Product>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(160).IsRequired();
            entity.Property(x => x.Price).HasPrecision(18, 2);
            entity.Property(x => x.DiscountPrice).HasPrecision(18, 2);
            entity.Property(x => x.Color).HasMaxLength(80).IsRequired();
            entity.HasOne(x => x.Category).WithMany(x => x.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });
        builder.Entity<ProductImage>(entity => entity.Property(x => x.ImageUrl).HasMaxLength(500).IsRequired());
        builder.Entity<Category>(entity =>
        {
            entity.Property(x => x.NameArabic).HasMaxLength(120).IsRequired();
            entity.Property(x => x.NameEnglish).HasMaxLength(120).IsRequired();
            entity.HasIndex(x => x.NameArabic).IsUnique();
        });
        builder.Entity<Order>(entity => entity.Property(x => x.TotalPrice).HasPrecision(18, 2));
        builder.Entity<OrderItem>(entity => entity.Property(x => x.UnitPrice).HasPrecision(18, 2));
        builder.Entity<AdminUser>(entity => entity.HasIndex(x => x.Username).IsUnique());
    }
}
