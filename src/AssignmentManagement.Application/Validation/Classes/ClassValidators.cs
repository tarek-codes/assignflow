using AssignmentManagement.Application.DTOs.Classes;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Classes;

public sealed class CreateClassRequestDtoValidator : AbstractValidator<CreateClassRequestDto>
{
    public CreateClassRequestDtoValidator()
    {
        RuleFor(request => request.ClassLevel).GreaterThan(0);
        RuleFor(request => request.SubjectId).GreaterThan(0);
        RuleFor(request => request.TeacherId).GreaterThan(0);
        RuleFor(request => request.Description).MaximumLength(1000);
    }
}

public sealed class UpdateClassRequestDtoValidator : AbstractValidator<UpdateClassRequestDto>
{
    public UpdateClassRequestDtoValidator()
    {
        RuleFor(request => request.ClassLevel).GreaterThan(0);
        RuleFor(request => request.SubjectId).GreaterThan(0);
        RuleFor(request => request.TeacherId).GreaterThan(0);
        RuleFor(request => request.Description).MaximumLength(1000);
    }
}

public sealed class AssignSubjectRequestDtoValidator : AbstractValidator<AssignSubjectRequestDto>
{
    public AssignSubjectRequestDtoValidator()
    {
        RuleFor(request => request.SubjectId).GreaterThan(0);
    }
}

public sealed class AssignTeacherRequestDtoValidator : AbstractValidator<AssignTeacherRequestDto>
{
    public AssignTeacherRequestDtoValidator()
    {
        RuleFor(request => request.TeacherId).GreaterThan(0);
    }
}
