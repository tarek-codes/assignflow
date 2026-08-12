using AssignmentManagement.Application.DTOs.Users;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Users;

public sealed class CreateUserRequestDtoValidator : AbstractValidator<CreateUserRequestDto>
{
    public CreateUserRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Password).NotEmpty().MinimumLength(8);
        RuleFor(request => request.Phone).MaximumLength(30);
    }
}

public sealed class UpdateUserRequestDtoValidator : AbstractValidator<UpdateUserRequestDto>
{
    public UpdateUserRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Phone).MaximumLength(30);
    }
}