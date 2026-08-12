using AssignmentManagement.Application.DTOs.Admins;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Admins;

public sealed class CreateAdminRequestDtoValidator : AbstractValidator<CreateAdminRequestDto>
{
    public CreateAdminRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Password).NotEmpty().MinimumLength(8);
        RuleFor(request => request.Phone).MaximumLength(30);
    }
}

public sealed class UpdateAdminRequestDtoValidator : AbstractValidator<UpdateAdminRequestDto>
{
    public UpdateAdminRequestDtoValidator()
    {
        RuleFor(request => request.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.LastName).MaximumLength(100);
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(request => request.Phone).MaximumLength(30);
    }
}