namespace AssignmentManagement.Application.Common;

public sealed class PaginationQueryDto
{
    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 10;

    public string? Search { get; set; }

    public string? SortBy { get; set; }

    public SortDirection SortDirection { get; set; } = SortDirection.Asc;
}