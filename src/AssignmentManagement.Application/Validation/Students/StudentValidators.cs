using AssignmentManagement.Application.DTOs.Students;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Students;

public sealed class CreateStudentRequestDtoValidator : AbstractValidator<CreateStudentRequestDto>
{
    public CreateStudentRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Password).NotEmpty().MinimumLength(8);
        RuleFor(request => request.Phone).MaximumLength(30);
        RuleFor(request => request.StudentNumber).NotEmpty().MaximumLength(50);
    }
}

public sealed class UpdateStudentRequestDtoValidator : AbstractValidator<UpdateStudentRequestDto>
{
    public UpdateStudentRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Phone).MaximumLength(30);
        RuleFor(request => request.StudentNumber).NotEmpty().MaximumLength(50);
    }
}