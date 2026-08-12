using AssignmentManagement.Application.DTOs.Teachers;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Teachers;

public sealed class CreateTeacherRequestDtoValidator : AbstractValidator<CreateTeacherRequestDto>
{
    public CreateTeacherRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Password).NotEmpty().MinimumLength(8);
        RuleFor(request => request.Phone).MaximumLength(30);
        RuleFor(request => request.Designation).MaximumLength(100);
    }
}

public sealed class UpdateTeacherRequestDtoValidator : AbstractValidator<UpdateTeacherRequestDto>
{
    public UpdateTeacherRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Phone).MaximumLength(30);
        RuleFor(request => request.Designation).MaximumLength(100);
    }
}