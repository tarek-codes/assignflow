using AssignmentManagement.Domain.Common;
using AssignmentManagement.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace AssignmentManagement.Domain.Entities;

public sealed class User : EntityBase
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? LastName { get; set; }

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string Gender { get; set; } = "Male";

    public string? AvatarUrl { get; set; }

    public UserRole Role { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public Admin? Admin { get; set; }

    public Teacher? Teacher { get; set; }

    public Student? Student { get; set; }
}