using AssignmentManagement.Domain.Enums;

namespace AssignmentManagement.Application.DTOs.Dashboard;

public sealed class AdminDashboardDto
{
    public int TotalUsers { get; set; }

    public int TotalTeachers { get; set; }

    public int TotalStudents { get; set; }

    public int TotalAssignments { get; set; }

    public int TotalSubmissions { get; set; }

    public List<RecentActivityDto> LatestActivities { get; set; } = [];

    public AdminStatisticsDto Statistics { get; set; } = new();
}

public sealed class RecentActivityDto
{
    public string ActivityType { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string UserRole { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime TimestampUtc { get; set; }
}

public sealed class AdminStatisticsDto
{
    public Dictionary<string, int> UsersByRole { get; set; } = [];

    public Dictionary<string, int> AssignmentsByStatus { get; set; } = [];

    public Dictionary<string, int> SubmissionsByStatus { get; set; } = [];

    public Dictionary<string, int> AssignmentsCreatedPerMonth { get; set; } = [];

    public Dictionary<string, int> TopSubjectsByAssignments { get; set; } = [];

    public Dictionary<string, int> ClassPerformance { get; set; } = [];

    public List<MonthlyPerformanceMetricDto> MonthlyPerformance { get; set; } = [];
}

public sealed class MonthlyPerformanceMetricDto
{
    public string Month { get; set; } = string.Empty;
    public double SubmissionRate { get; set; }
    public double AverageGrade { get; set; }
    public double CompletionRate { get; set; }
}

public sealed class TeacherDashboardDto
{
    public int TotalAssignments { get; set; }

    public int TotalPendingReviews { get; set; }

    public int TotalGraded { get; set; }

    public List<TeacherAssignmentSummaryDto> RecentAssignments { get; set; } = [];

    public List<PendingReviewSummaryDto> PendingReviews { get; set; } = [];
}

public sealed class TeacherAssignmentSummaryDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    public DateTime DeadlineUtc { get; set; }

    public AssignmentStatus Status { get; set; }

    public int SubmissionCount { get; set; }
}

public sealed class PendingReviewSummaryDto
{
    public int SubmissionId { get; set; }

    public int AssignmentId { get; set; }

    public string AssignmentTitle { get; set; } = string.Empty;

    public string StudentName { get; set; } = string.Empty;

    public string StudentNumber { get; set; } = string.Empty;

    public DateTime SubmittedAtUtc { get; set; }

    public SubmissionStatus Status { get; set; }
}

public sealed class StudentDashboardDto
{
    public string StudentName { get; set; } = string.Empty;

    public string StudentNumber { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    public string Group { get; set; } = "None";

    public int PositionInClass { get; set; } = 1;

    public int TotalUpcomingAssignments { get; set; }

    public int TotalSubmitted { get; set; }

    public int TotalPending { get; set; }

    public int TotalLate { get; set; }

    public int TotalGraded { get; set; }

    public List<StudentUpcomingAssignmentDto> UpcomingAssignments { get; set; } = [];

    public List<StudentSubmissionSummaryDto> RecentSubmissions { get; set; } = [];

    public List<StudentGradeSummaryDto> Grades { get; set; } = [];
}

public sealed class StudentUpcomingAssignmentDto
{
    public int AssignmentId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public int ClassLevel { get; set; }

    public string? Description { get; set; }

    public string? Instructions { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime DeadlineUtc { get; set; }

    public int MaxMarks { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public bool HasSubmitted { get; set; }
}

public sealed class StudentSubmissionSummaryDto
{
    public int SubmissionId { get; set; }

    public int AssignmentId { get; set; }

    public string AssignmentTitle { get; set; } = string.Empty;

    public DateTime SubmittedAtUtc { get; set; }

    public SubmissionStatus Status { get; set; }
}

public sealed class StudentGradeSummaryDto
{
    public int SubmissionId { get; set; }

    public int AssignmentId { get; set; }

    public string AssignmentTitle { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public decimal Marks { get; set; }

    public int MaxMarks { get; set; }

    public string? Feedback { get; set; }

    public DateTime GradedAtUtc { get; set; }
}
