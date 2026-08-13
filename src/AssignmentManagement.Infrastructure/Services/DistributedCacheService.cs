using System.Collections.Concurrent;
using System.Text.Json;
using AssignmentManagement.Application.Abstractions.Services;
using Microsoft.Extensions.Caching.Distributed;

namespace AssignmentManagement.Infrastructure.Services;

public sealed class DistributedCacheService : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly IDistributedCache _cache;
    private readonly ConcurrentDictionary<string, byte> _memoryKeyRegistry = new();

    public DistributedCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var json = await _cache.GetStringAsync(key, cancellationToken);
            if (string.IsNullOrEmpty(json))
            {
                return default;
            }

            return JsonSerializer.Deserialize<T>(json, JsonOptions);
        }
        catch
        {
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var json = JsonSerializer.Serialize(value, JsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl ?? TimeSpan.FromMinutes(5),
            };

            await _cache.SetStringAsync(key, json, options, cancellationToken);
            _memoryKeyRegistry.TryAdd(key, 0);
        }
        catch
        {
            // Ignore caching failure
        }
    }

    public async Task<T> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? ttl = null,
        CancellationToken cancellationToken = default)
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null)
        {
            return cached;
        }

        var value = await factory();
        await SetAsync(key, value, ttl, cancellationToken);
        return value;
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await _cache.RemoveAsync(key, cancellationToken);
        }
        catch
        {
            // Ignore
        }
        _memoryKeyRegistry.TryRemove(key, out _);
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        var keysToRemove = _memoryKeyRegistry.Keys
            .Where(key => key.StartsWith(prefix, StringComparison.Ordinal))
            .ToList();

        foreach (var key in keysToRemove)
        {
            await RemoveAsync(key, cancellationToken);
        }
    }
}
