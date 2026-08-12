using AssignmentManagement.Application.DTOs.Authentication;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Authentication;

public sealed class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(request => request.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(request => request.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}