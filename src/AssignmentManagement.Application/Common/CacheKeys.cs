using AssignmentManagement.Application.Abstractions.Services;

namespace AssignmentManagement.Application.Common;

public static class CacheKeys
{
    public const string DashboardPrefix = "dashboard:";
    public const string ListPrefix = "list:";

    public const string AdminDashboard = "dashboard:admin";

    public static string TeacherDashboard(int userId) => $"dashboard:teacher:{userId}";

    public static string StudentDashboard(int userId) => $"dashboard:student:{userId}";

    public static string Users(PaginationQueryDto query) =>
        $"list:users:{query.PageNumber}:{query.PageSize}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string Teachers(PaginationQueryDto query) =>
        $"list:teachers:{query.PageNumber}:{query.PageSize}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string Students(PaginationQueryDto query) =>
        $"list:students:{query.PageNumber}:{query.PageSize}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string Classes(PaginationQueryDto query, int? teacherUserId) =>
        $"list:classes:{query.PageNumber}:{query.PageSize}:{teacherUserId ?? 0}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string Assignments(PaginationQueryDto query, int? teacherUserId) =>
        $"list:assignments:{query.PageNumber}:{query.PageSize}:{teacherUserId ?? 0}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string Submissions(PaginationQueryDto query, int? teacherUserId) =>
        $"list:submissions:{query.PageNumber}:{query.PageSize}:{teacherUserId ?? 0}:{query.Search}:{query.SortBy}:{query.SortDirection}";

    public static string MySubmissions(int userId, PaginationQueryDto query) =>
        $"list:submissions:mine:{userId}:{query.PageNumber}:{query.PageSize}:{query.Search}:{query.SortBy}:{query.SortDirection}";
}

public static class CacheTtl
{
    public static readonly TimeSpan Dashboard = TimeSpan.FromMinutes(3);

    public static readonly TimeSpan List = TimeSpan.FromMinutes(5);
}

public static class CacheInvalidation
{
    public static Task OnDataChangedAsync(ICacheService cache, CancellationToken cancellationToken = default) =>
        cache.RemoveByPrefixAsync(CacheKeys.ListPrefix, cancellationToken);

    public static async Task OnDashboardDataChangedAsync(ICacheService cache, CancellationToken cancellationToken = default)
    {
        await cache.RemoveByPrefixAsync(CacheKeys.DashboardPrefix, cancellationToken);
        await cache.RemoveByPrefixAsync(CacheKeys.ListPrefix, cancellationToken);
    }
}
