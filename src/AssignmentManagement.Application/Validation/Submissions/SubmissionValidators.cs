using AssignmentManagement.Application.DTOs.Submissions;
using AssignmentManagement.Domain.Enums;
using FluentValidation;

namespace AssignmentManagement.Application.Validation.Submissions;

public sealed class SubmitAssignmentRequestDtoValidator : AbstractValidator<SubmitAssignmentRequestDto>
{
    private static readonly string[] AllowedExtensions = [".pdf", ".docx"];

    public SubmitAssignmentRequestDtoValidator()
    {
        RuleFor(request => request.File)
            .NotNull()
            .WithMessage("Submission file is required.")
            .Must(file => file != null && file.Length > 0)
            .WithMessage("File cannot be empty.")
            .Must(file =>
            {
                if (file == null) return false;
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                return AllowedExtensions.Contains(extension);
            })
            .WithMessage("Only PDF and DOCX files are allowed.");

        RuleFor(request => request.SubmissionText)
            .MaximumLength(4000)
            .WithMessage("Submission text cannot exceed 4000 characters.");
    }
}

public sealed class GradeSubmissionRequestDtoValidator : AbstractValidator<GradeSubmissionRequestDto>
{
    public GradeSubmissionRequestDtoValidator()
    {
        RuleFor(request => request.Marks)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Marks cannot be negative.");

        RuleFor(request => request.Feedback)
            .MaximumLength(4000)
            .WithMessage("Feedback text cannot exceed 4000 characters.");

        RuleFor(request => request.Status)
            .Must(status => status == null || Enum.IsDefined(typeof(SubmissionStatus), status.Value))
            .WithMessage("Invalid submission status value.");
    }
}

public sealed class UpdateSubmissionStatusRequestDtoValidator : AbstractValidator<UpdateSubmissionStatusRequestDto>
{
    public UpdateSubmissionStatusRequestDtoValidator()
    {
        RuleFor(request => request.Status)
            .Must(status => Enum.IsDefined(typeof(SubmissionStatus), status))
            .WithMessage("Invalid submission status value.");
    }
}
