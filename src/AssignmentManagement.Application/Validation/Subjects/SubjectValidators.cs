using AssignmentManagement.Application.DTOs.Subjects;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Subjects;

public sealed class CreateSubjectRequestDtoValidator : AbstractValidator<CreateSubjectRequestDto>
{
    public CreateSubjectRequestDtoValidator()
    {
        RuleFor(request => request.SubjectName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.SubjectCode).MaximumLength(20);
        RuleFor(request => request.Description).MaximumLength(1000);
    }
}

public sealed class UpdateSubjectRequestDtoValidator : AbstractValidator<UpdateSubjectRequestDto>
{
    public UpdateSubjectRequestDtoValidator()
    {
        RuleFor(request => request.SubjectName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.SubjectCode).MaximumLength(20);
        RuleFor(request => request.Description).MaximumLength(1000);
    }
}