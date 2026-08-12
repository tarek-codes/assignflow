using AssignmentManagement.Application.Common;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Common;

public sealed class PaginationQueryDtoValidator : AbstractValidator<PaginationQueryDto>
{
    public PaginationQueryDtoValidator()
    {
        RuleFor(query => query.PageNumber).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, 5000);
    }
}