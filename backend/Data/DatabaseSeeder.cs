using MaarazAlLoulou.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MaarazAlLoulou.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MaarazDbContext db, IConfiguration configuration)
    {
        if (!await db.Categories.AnyAsync())
        {
            var categories = new[]
            {
                ("أطقم عشا", "Dinner Sets"), ("أطقم افطار", "Breakfast Sets"), ("أطقم صيني", "Chinaware Sets"),
                ("أطقم حلل", "Cookware Sets"), ("أطقم توابل", "Spice Sets"), ("أطقم صواني", "Tray Sets"),
                ("أطباق فاكهه", "Fruit Plates"), ("أطقم توزيع", "Serving Sets"), ("اكسسورات وديكور", "Accessories & Decor"),
                ("رفايع", "Rafay3"), ("أكواب وفناجين", "Cups & Mugs"), ("هدايا مناسبات", "Occasion Gifts")
            };
            db.Categories.AddRange(categories.Select(x => new Category { NameArabic = x.Item1, NameEnglish = x.Item2 }));
            await db.SaveChangesAsync();
        }

        if (!await db.Products.AnyAsync())
        {
            var categoryMap = await db.Categories.ToDictionaryAsync(x => x.NameArabic, x => x.Id);
            var items = new[]
            {
                ("طقم عشا روز 26 قطعة", "طقم بورسلين هادئ لتفاصيل المائدة اليومية والضيافة.", 1890m, "أطقم عشا", "وردي", 8, true, true, false, (decimal?)null),
                ("طقم إفطار لؤلؤي", "أكواب وأطباق إفطار بلمسة كريمية ناعمة.", 1250m, "أطقم افطار", "كريمي", 12, true, false, false, (decimal?)null),
                ("طقم صيني كلاسيك", "تشكيلة صيني أنيقة للمناسبات والعزومات.", 2350m, "أطقم صيني", "أبيض", 5, false, false, true, 1990m),
                ("طقم حلل جرانيت", "حلل عملية بغطاء زجاجي ومقابض مريحة.", 3100m, "أطقم حلل", "رمادي", 4, true, false, true, 2790m),
                ("طقم توابل ذهبي", "برطمانات توابل زجاجية بقاعدة معدنية رشيقة.", 690m, "أطقم توابل", "ذهبي", 18, false, true, false, (decimal?)null),
                ("طقم صواني تقديم", "صواني تقديم متدرجة تضيف لمسة خاصة للضيافة.", 975m, "أطقم صواني", "بيج", 9, true, false, false, (decimal?)null),
                ("طبق فاكهة زجاجي", "طبق فاكهة شفاف بنقوش ناعمة.", 450m, "أطباق فاكهه", "شفاف", 15, false, true, false, (decimal?)null),
                ("طقم توزيع مناسبات", "قطع تقديم عملية للحلويات والضيافة.", 840m, "أطقم توزيع", "عسلي", 7, false, false, true, 720m),
                ("فازة سيراميك هادئة", "فازة ديكور بلون عاجي لزوايا البيت.", 520m, "اكسسورات وديكور", "عاجي", 11, true, true, false, (decimal?)null),
                ("قطعة رفايع كريستال", "قطعة ديكور صغيرة للاستخدام أو العرض.", 395m, "رفايع", "لؤلؤي", 3, false, false, false, (decimal?)null),
                ("مجموعة مجات قهوة", "6 مجات قهوة بنقشة هادئة ومقابض مريحة.", 610m, "أكواب وفناجين", "وردي", 14, false, true, false, (decimal?)null),
                ("بوكس هدية مناسبات", "هدية مرتبة تضم تفاصيل ضيافة مميزة.", 1150m, "هدايا مناسبات", "ذهبي", 6, true, false, true, 990m)
            };
            foreach (var item in items)
            {
                var product = new Product { Name = item.Item1, Description = item.Item2, Price = item.Item3, CategoryId = categoryMap[item.Item4], Color = item.Item5, StockQuantity = item.Item6, IsBestSeller = item.Item7, IsNewArrival = item.Item8, IsOnOffer = item.Item9, DiscountPrice = item.Item10 };
                product.Images.Add(new ProductImage { ImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85", IsMainImage = true });
                db.Products.Add(product);
            }
            await db.SaveChangesAsync();
        }

        if (!await db.AdminUsers.AnyAsync())
        {
            var username = configuration["SeedAdmin:Username"] ?? "admin";
            var password = configuration["SeedAdmin:Password"] ?? "ChangeMeBeforeProduction!";
            db.AdminUsers.Add(new AdminUser { Username = username, PasswordHash = BCrypt.Net.BCrypt.HashPassword(password), Role = "Admin" });
            await db.SaveChangesAsync();
        }
    }
}
