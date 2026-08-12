using AssignmentManagement.Application.DTOs.Assignments;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Assignments;

public sealed class CreateAssignmentRequestDtoValidator : AbstractValidator<CreateAssignmentRequestDto>
{
    public CreateAssignmentRequestDtoValidator()
    {
        RuleFor(request => request.ClassId).GreaterThan(0);
        RuleFor(request => request.Title).NotEmpty().MaximumLength(255);
        RuleFor(request => request.Description).MaximumLength(4000);
        RuleFor(request => request.Instructions).MaximumLength(4000);
        RuleFor(request => request.DeadlineUtc).Must(date => date > DateTime.UtcNow).WithMessage("Deadline must be in the future.");
        RuleFor(request => request.MaxMarks).GreaterThan(0);
    }
}

public sealed class UpdateAssignmentRequestDtoValidator : AbstractValidator<UpdateAssignmentRequestDto>
{
    public UpdateAssignmentRequestDtoValidator()
    {
        RuleFor(request => request.ClassId).GreaterThan(0);
        RuleFor(request => request.Title).NotEmpty().MaximumLength(255);
        RuleFor(request => request.Description).MaximumLength(4000);
        RuleFor(request => request.Instructions).MaximumLength(4000);
        RuleFor(request => request.DeadlineUtc).NotEmpty();
        RuleFor(request => request.MaxMarks).GreaterThan(0);
    }
}