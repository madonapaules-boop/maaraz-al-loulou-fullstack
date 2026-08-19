using MaarazAlLoulou.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace MaarazAlLoulou.Api.Repositories;

public interface IRepository<TEntity> where TEntity : class
{
    IQueryable<TEntity> Query();
    Task<TEntity?> FindAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    void Remove(TEntity entity);
}

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public sealed class EfRepository<TEntity>(MaarazDbContext database) : IRepository<TEntity> where TEntity : class
{
    public IQueryable<TEntity> Query() => database.Set<TEntity>();

    public Task<TEntity?> FindAsync(int id, CancellationToken cancellationToken = default) =>
        database.Set<TEntity>().FindAsync([id], cancellationToken).AsTask();

    public Task AddAsync(TEntity entity, CancellationToken cancellationToken = default) =>
        database.Set<TEntity>().AddAsync(entity, cancellationToken).AsTask();

    public void Remove(TEntity entity) => database.Set<TEntity>().Remove(entity);
}

public sealed class EfUnitOfWork(MaarazDbContext database) : IUnitOfWork
{
    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        database.SaveChangesAsync(cancellationToken);
}
