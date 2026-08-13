using System.Collections.Concurrent;
using System.Text.Json;
using AssignmentManagement.Application.Abstractions.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using StackExchange.Redis;

namespace AssignmentManagement.Infrastructure.Services;

public sealed class DistributedCacheService : ICacheService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _redis;
    private readonly string _instancePrefix;
    private readonly ConcurrentDictionary<string, byte> _memoryKeyRegistry = new();

    public DistributedCacheService(
        IDistributedCache cache,
        IConfiguration configuration,
        IConnectionMultiplexer? redis = null)
    {
        _cache = cache;
        _redis = redis;
        _instancePrefix = configuration["Redis:InstanceName"] ?? "assignflow:";
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var json = await _cache.GetStringAsync(key, cancellationToken);
        if (string.IsNullOrEmpty(json))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(json, JsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(value, JsonOptions);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl ?? TimeSpan.FromMinutes(5),
        };

        await _cache.SetStringAsync(key, json, options, cancellationToken);
        _memoryKeyRegistry.TryAdd(key, 0);
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
        await _cache.RemoveAsync(key, cancellationToken);
        _memoryKeyRegistry.TryRemove(key, out _);
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        if (_redis is not null)
        {
            var database = _redis.GetDatabase();
            var pattern = $"{_instancePrefix}{prefix}*";

            foreach (var endpoint in _redis.GetEndPoints())
            {
                var server = _redis.GetServer(endpoint);
                if (!server.IsConnected || server.IsReplica)
                {
                    continue;
                }

                foreach (var key in server.Keys(database: database.Database, pattern: pattern))
                {
                    await database.KeyDeleteAsync(key);
                }
            }

            return;
        }

        var keysToRemove = _memoryKeyRegistry.Keys
            .Where(key => key.StartsWith(prefix, StringComparison.Ordinal))
            .ToList();

        foreach (var key in keysToRemove)
        {
            await RemoveAsync(key, cancellationToken);
        }
    }
}
