using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MaarazAlLoulou.Api.Data;

public sealed class MaarazDbContextFactory : IDesignTimeDbContextFactory<MaarazDbContext>
{
    public MaarazDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<MaarazDbContext>();
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__MaarazAlLoulou")
            ?? "Server=localhost,1433;Database=MaarazAlLoulou;User Id=sa;Password=ReplaceBeforeUse;TrustServerCertificate=True;";
        options.UseSqlServer(connection);
        return new MaarazDbContext(options.Options);
    }
}
