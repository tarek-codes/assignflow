using AssignmentManagement.Domain.Entities;
using AssignmentManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AssignmentManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Ensure database and schema are fully up to date with EF Core model changes
        await context.Database.EnsureCreatedAsync();
        try
        {
            await context.Database.ExecuteSqlRawAsync("ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Male';");
        }
        catch { }

        // Skip seeding if data already exists — prevents expensive re-seed on every cold start
        if (await context.Users.AnyAsync())
        {
            return;
        }

        // 1. Wipe out existing database completely for a clean state (only runs on first deploy)
        try
        {
            await context.Submissions.ExecuteDeleteAsync();
            await context.Assignments.ExecuteDeleteAsync();
            await context.StudentClasses.ExecuteDeleteAsync();
            await context.Classes.ExecuteDeleteAsync();
            await context.TeacherSubjects.ExecuteDeleteAsync();
            await context.Teachers.ExecuteDeleteAsync();
            await context.Students.ExecuteDeleteAsync();
            await context.Subjects.ExecuteDeleteAsync();
            await context.Admins.ExecuteDeleteAsync();
            await context.AppSettings.ExecuteDeleteAsync();
            await context.Users.ExecuteDeleteAsync();
        }
        catch { }

        var now = DateTime.UtcNow;
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        // ───────────────────────── 1. ADMIN USER (1 Admin) ─────────────────────────
        var adminUser = new User
        {
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@example.com",
            Phone = "+8801711000000",
            PasswordHash = passwordHash,
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAtUtc = now.AddMonths(-6),
            UpdatedAtUtc = now,
        };
        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();

        var admin = new Admin { UserId = adminUser.Id };
        await context.Admins.AddAsync(admin);
        await context.SaveChangesAsync();

        // ───────────────────────── 2. SUBJECTS ─────────────────────────
        var subjectDefs = new (string Code, string Name, string Desc)[]
        {
            ("BEN101", "Bengali Literature", "বাংলা সাহিত্য ও ব্যাকরণ"),
            ("ENG101", "English Grammar & Composition", "English Language, Grammar and Writing Skills"),
            ("MAT101", "General Mathematics", "Core Secondary Algebra, Arithmetic and Geometry"),
            ("HMT201", "Higher Mathematics", "Advanced Algebra, Trigonometry, Vectors and Calculus"),
            ("PHY201", "Physics", "Mechanics, Heat, Waves, Electricity and Modern Physics"),
            ("CHE201", "Chemistry", "Atomic Structure, Chemical Bonding, Reactions and Organic Chemistry"),
            ("BIO201", "Biology", "Plant & Animal Biology, Genetics and Ecology"),
            ("ICT101", "ICT", "Computer Basics, HTML, Networking and Cyber Security"),
            ("BGS101", "Bangladesh & Global Studies", "History of Bangladesh, Constitution and Social Governance"),
            ("RME101", "Religion & Moral Education", "Moral Values, Ethics and Religious Studies"),
            ("ACC201", "Principles of Accounting", "Financial Accounting, Bookkeeping and Balance Sheets"),
            ("FIN201", "Finance & Banking", "Financial Management, Money, Banking Systems and Investments"),
            ("SCI101", "Science", "General Science for Middle School"),
            ("DIG101", "Digital Technology", "Middle School Digital Literacy and IT Skills"),
            ("HSS101", "History and Social Science", "Social Science, Culture and History for Middle School"),
            ("LFL101", "Life and Livelihood", "Vocational, Life Skills and Entrepreneurship"),
            ("ARC101", "Arts and Culture", "Visual Arts, Drama and Cultural Heritage"),
            ("HPR101", "Health Protection", "Health, Hygiene and Physical Wellbeing"),
            ("BEN301", "Bangla 1st Paper", "উচ্চমাধ্যমিক বাংলা প্রথম পত্র"),
            ("BEN302", "Bangla 2nd Paper", "উচ্চমাধ্যমিক বাংলা দ্বিতীয় পত্র"),
            ("ENG301", "English 1st Paper", "Higher Secondary English 1st Paper"),
            ("ENG302", "English 2nd Paper", "Higher Secondary English 2nd Paper"),
            ("PHY301", "Physics 1st Paper", "Higher Secondary Physics Mechanics and Waves"),
            ("PHY302", "Physics 2nd Paper", "Higher Secondary Physics Electricity and Modern Physics"),
            ("CHE301", "Chemistry 1st Paper", "Higher Secondary Physical & Inorganic Chemistry"),
            ("CHE302", "Chemistry 2nd Paper", "Higher Secondary Organic Chemistry"),
            ("BIO301", "Biology 1st Paper", "Higher Secondary Botany"),
            ("BIO302", "Biology 2nd Paper", "Higher Secondary Zoology"),
            ("HMT301", "Higher Mathematics 1st Paper", "Higher Secondary Matrix, Geometry and Calculus"),
            ("HMT302", "Higher Mathematics 2nd Paper", "Higher Secondary Complex Numbers, Statics & Dynamics"),
            ("ACC301", "Accounting 1st Paper", "Higher Secondary Accounting Principles"),
            ("ACC302", "Accounting 2nd Paper", "Higher Secondary Cost & Financial Accounting"),
            ("FIN301", "Finance, Banking and Insurance 1st Paper", "Higher Secondary Finance Principles"),
            ("FIN302", "Finance, Banking and Insurance 2nd Paper", "Higher Secondary Banking & Insurance"),
            ("BOM301", "Business Organization and Management 1st Paper", "Higher Secondary Business Foundations"),
            ("BOM302", "Business Organization and Management 2nd Paper", "Higher Secondary Management Principles"),
            ("MKT301", "Marketing 1st Paper", "Higher Secondary Marketing Principles"),
            ("MKT302", "Marketing 2nd Paper", "Higher Secondary Consumer Behavior & Promotion"),
            ("PMM301", "Production Management & Marketing 1st Paper", "Higher Secondary Production Management"),
            ("PMM302", "Production Management & Marketing 2nd Paper", "Higher Secondary Supply Chain & Marketing"),
            ("ECO301", "Economics 1st Paper", "Higher Secondary Microeconomics"),
            ("ECO302", "Economics 2nd Paper", "Higher Secondary Macroeconomics & Bangladesh Economy"),
            ("CIV301", "Civics & Good Governance 1st Paper", "Higher Secondary Civics Principles"),
            ("CIV302", "Civics & Good Governance 2nd Paper", "Higher Secondary Constitution & Governance"),
            ("HIS301", "History 1st Paper", "Higher Secondary World History"),
            ("HIS302", "History 2nd Paper", "Higher Secondary History of Subcontinent & Bangladesh"),
            ("IHC301", "Islamic History & Culture 1st Paper", "Higher Secondary Islamic History"),
            ("IHC302", "Islamic History & Culture 2nd Paper", "Higher Secondary Islamic Culture & Heritage"),
            ("LOG301", "Logic 1st Paper", "Higher Secondary Deductive & Inductive Logic"),
            ("LOG302", "Logic 2nd Paper", "Higher Secondary Scientific Method & Fallacies"),
            ("SOC301", "Sociology 1st Paper", "Higher Secondary Sociological Concepts"),
            ("SOC302", "Sociology 2nd Paper", "Higher Secondary Society of Bangladesh"),
            ("SWK301", "Social Work 1st Paper", "Higher Secondary Social Work Foundations"),
            ("SWK302", "Social Work 2nd Paper", "Higher Secondary Social Welfare Methods"),
            ("GEO301", "Geography 1st Paper", "Higher Secondary Physical Geography"),
            ("GEO302", "Geography 2nd Paper", "Higher Secondary Human & Economic Geography"),
            ("PSY301", "Psychology 1st Paper", "Higher Secondary General Psychology"),
            ("PSY302", "Psychology 2nd Paper", "Higher Secondary Educational & Applied Psychology"),
        };

        var subjectsList = subjectDefs
            .Select(sub => new Subject { SubjectCode = sub.Code, SubjectName = sub.Name, Description = sub.Desc })
            .ToList();
        await context.Subjects.AddRangeAsync(subjectsList);
        await context.SaveChangesAsync();

        // ───────────────────────── 3. 20 BANGLADESHI TEACHERS ─────────────────────────
        var teacherDefs = new (string FirstName, string LastName, string Designation, string Phone, int[] SubjectIndices)[]
        {
            ("Anisur", "Rahman", "Head of Physics Department", "+8801711000001", new[] { 4, 7, 12, 22, 23 }),

            ("Nusrat", "Jahan", "Senior Bengali Teacher", "+8801711000002", new[] { 0, 18, 19 }),
            ("Tanvir", "Ahmed", "Assistant Math Teacher", "+8801711000003", new[] { 2, 3, 28, 29 }),
            ("Fatema", "Begum", "Senior Chemistry Lecturer", "+8801711000004", new[] { 5, 24, 25 }),
            ("Kamrul", "Hasan", "ICT Lecturer", "+8801711000005", new[] { 7, 13 }),
            ("Abul Bashar", "Khan", "Senior English Teacher", "+8801711000006", new[] { 1, 20, 21 }),
            ("Sharmin", "Sultana", "Biology Teacher", "+8801711000007", new[] { 6, 26, 27 }),
            ("Mahbubur", "Rahman", "Accounting Lecturer", "+8801711000008", new[] { 10, 30, 31 }),
            ("Farhana", "Chowdhury", "Social Studies Teacher", "+8801711000009", new[] { 8, 14, 15 }),
            ("Jahangir", "Alam", "Assistant Science Teacher", "+8801711000010", new[] { 4, 12 }),
            ("Mostafa", "Hossain", "Finance Lecturer", "+8801711000011", new[] { 11, 32, 33 }),
            ("Rizia", "Parveen", "Mathematics Teacher", "+8801711000012", new[] { 2, 12 }),
            ("Shafiqul", "Islam", "Arts & Culture Instructor", "+8801711000013", new[] { 16, 17 }),
            ("Abdul", "Latif", "Religion & Ethics Teacher", "+8801711000014", new[] { 9 }),
            ("Tahmina", "Akhter", "Business Studies Lecturer", "+8801711000015", new[] { 34, 35 }),
            ("Nazmul", "Huda", "Assistant ICT Instructor", "+8801711000016", new[] { 7, 13 }),
            ("Syeda", "Rokeya", "Senior History Teacher", "+8801711000017", new[] { 8, 14 }),
            ("Mahmudul", "Haque", "Physics Lecturer", "+8801711000018", new[] { 4, 22 }),
            ("Salma", "Khatun", "English Language Teacher", "+8801711000019", new[] { 1, 20 }),
            ("Shahadat", "Hossain", "General Science Lecturer", "+8801711000020", new[] { 12, 5 }),
        };

        var teachersList = new List<Teacher>();
        for (int i = 0; i < teacherDefs.Length; i++)
        {
            var item = teacherDefs[i];
            var email = i == 0 ? "teacher@example.com" : $"teacher{i + 1}@school.edu.bd";
            var femaleTeacherNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Nusrat", "Fatema", "Sharmin", "Farhana", "Rizia", "Tahmina", "Syeda", "Salma" };
            var isFemaleTeacher = femaleTeacherNames.Any(fn => item.FirstName.IndexOf(fn, StringComparison.OrdinalIgnoreCase) >= 0);
            var gender = isFemaleTeacher ? "Female" : "Male";

            var user = new User
            {
                FirstName = item.FirstName,
                LastName = item.LastName,
                Email = email,
                Phone = item.Phone,
                Gender = gender,
                PasswordHash = passwordHash,
                Role = UserRole.Teacher,
                IsActive = true,
                CreatedAtUtc = now.AddMonths(-6),
                UpdatedAtUtc = now,
            };
            teachersList.Add(new Teacher { Designation = item.Designation, User = user });
        }
        await context.Teachers.AddRangeAsync(teachersList);
        await context.SaveChangesAsync();

        // ───────────────────────── 4. TEACHER SUBJECT MAPPINGS ─────────────────────────
        var teacherSubjectsList = new List<TeacherSubject>();
        for (int i = 0; i < teacherDefs.Length; i++)
        {
            var teacher = teachersList[i];
            foreach (var subIdx in teacherDefs[i].SubjectIndices)
            {
                var sObj = subjectsList[subIdx % subjectsList.Count];
                teacherSubjectsList.Add(new TeacherSubject { TeacherId = teacher.Id, SubjectId = sObj.Id });
            }
        }
        await context.TeacherSubjects.AddRangeAsync(teacherSubjectsList);
        await context.SaveChangesAsync();

        // ───────────────────────── 4. 100 BANGLADESHI STUDENTS (Classes 6 to 12) ─────────────────────────
        var firstNames = new[]
        {
            "Abrar", "Samiul", "Naimur", "Sadia", "Mehedi", "Tasnim", "Farhan", "Lamia", "Zarin", "Rakib",
            "Abdullah", "Nahid", "Tamim", "Sourav", "Nabila", "Fahim", "Fariha", "Kazi", "Shakib", "Anika",
            "Arif", "Mahim", "Riya", "Sumaiya", "Tanvir", "Adnan", "Alvi", "Faisal", "Ishraq", "Minhaj",
            "Afrin", "Nabil", "Sabrina", "Zubair", "Mitu", "Raihan", "Rifat", "Jabin", "Hridoy", "Tashfia",
            "Siyam", "Jahid", "Sultana", "Nafis", "Mahrin", "Tahmid", "Nusrat", "Imtiaz", "Subah", "Rashed",
            "Maliha", "Sabbir", "Bushra", "Tanaz", "Labib", "Humaira", "Tanzil", "Orin", "Wasim", "Sneha",
            "Towhid", "Munim", "Sadman", "Arian", "Jannat", "Mehrab", "Zainab", "Ehsan", "Sanida", "Mahir",
            "Kavita", "Shahadat", "Lubna", "Ashfaq", "Tisha", "Safwan", "Nayla", "Rayan", "Tania", "Shafiq",
            "Ruhi", "Nayeem", "Maisha", "Hasib", "Nuhash", "Safa", "Rowan", "Jaria", "Aayan", "Zunaira",
            "Saad", "Faiaz", "Tasmia", "Arham", "Sarin", "Rafsan", "Riyaad", "Atif", "Afia", "Suhail"
        };
        var lastNames = new[] { "Rahman", "Ahmed", "Hossain", "Islam", "Khan", "Chowdhury", "Hasan", "Ali", "Siddiqui", "Mahmud", "Biswas", "Haque", "Miah", "Sarker", "Bhuiyan" };

        var femaleStudentNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Sadia", "Tasnim", "Lamia", "Zarin", "Nabila", "Fariha", "Anika", "Riya", "Sumaiya",
            "Afrin", "Sabrina", "Mitu", "Jabin", "Tashfia", "Sultana", "Mahrin", "Nusrat", "Subah",
            "Maliha", "Bushra", "Tanaz", "Humaira", "Orin", "Sneha", "Jannat", "Zainab", "Sanida",
            "Kavita", "Lubna", "Tisha", "Nayla", "Tania", "Ruhi", "Maisha", "Safa", "Jaria",
            "Zunaira", "Tasmia", "Sarin", "Afia"
        };

        var studentsList = new List<Student>();
        for (int i = 1; i <= 100; i++)
        {
            var fName = firstNames[i - 1];
            var lName = lastNames[(i - 1) % lastNames.Length];
            var email = i == 1 ? "student@example.com" : $"student{i}@school.edu.bd";
            // Distribution: Class 6: 15, Class 7: 15, Class 8: 15, Class 9: 15, Class 10: 15, Class 11: 13, Class 12: 12
            int studentClassLevel = i <= 15 ? 6 : i <= 30 ? 7 : i <= 45 ? 8 : i <= 60 ? 9 : i <= 75 ? 10 : i <= 88 ? 11 : 12;
            string studentGroup = studentClassLevel < 9 ? "None" : (i % 3 == 1 ? "Science" : i % 3 == 2 ? "Business Studies" : "Humanities");

            var studentGender = femaleStudentNames.Contains(fName) ? "Female" : "Male";

            var user = new User
            {
                FirstName = fName,
                LastName = lName,
                Email = email,
                Phone = $"+8801811{i:D6}",
                Gender = studentGender,
                PasswordHash = passwordHash,
                Role = UserRole.Student,
                IsActive = true,
                CreatedAtUtc = now.AddMonths(-6),
                UpdatedAtUtc = now,
            };
            studentsList.Add(new Student { StudentNumber = $"BD-2026-{i:D3}", ClassLevel = studentClassLevel, Group = studentGroup, User = user });
        }
        await context.Students.AddRangeAsync(studentsList);
        await context.SaveChangesAsync();

        // ───────────────────────── 5. CURRICULUM CLASSES ─────────────────────────
        var subjectQualifiedTeachers = subjectsList.ToDictionary(
            s => s.Id,
            s => teacherSubjectsList.Where(ts => ts.SubjectId == s.Id).Select(ts => ts.TeacherId).Distinct().ToList());
        var subjectTeacherCursor = subjectsList.ToDictionary(s => s.Id, _ => 0);
        var subjectByName = subjectsList.ToDictionary(s => s.SubjectName, s => s, StringComparer.OrdinalIgnoreCase);

        var gradeCurriculumMap = new Dictionary<int, List<string>>
        {
            [6] = new()
            {
                "Bengali Literature", "English Grammar & Composition", "General Mathematics", "Science",
                "Digital Technology", "History and Social Science", "Life and Livelihood", "Arts and Culture",
                "Health Protection", "Religion & Moral Education", "Bangladesh & Global Studies"
            },
            [7] = new()
            {
                "Bengali Literature", "English Grammar & Composition", "General Mathematics", "Science",
                "Digital Technology", "History and Social Science", "Life and Livelihood", "Arts and Culture",
                "Health Protection", "Religion & Moral Education", "Bangladesh & Global Studies"
            },
            [8] = new()
            {
                "Bengali Literature", "English Grammar & Composition", "General Mathematics", "Science",
                "Digital Technology", "History and Social Science", "Life and Livelihood", "Arts and Culture",
                "Health Protection", "Religion & Moral Education", "Bangladesh & Global Studies"
            },
            [9] = new()
            {
                "Bengali Literature", "English Grammar & Composition", "General Mathematics", "Higher Mathematics",
                "Physics", "Chemistry", "Biology", "ICT", "Bangladesh & Global Studies",
                "Religion & Moral Education", "Principles of Accounting", "Finance & Banking"
            },
            [10] = new()
            {
                "Bengali Literature", "English Grammar & Composition", "General Mathematics", "Higher Mathematics",
                "Physics", "Chemistry", "Biology", "ICT", "Bangladesh & Global Studies",
                "Religion & Moral Education", "Principles of Accounting", "Finance & Banking"
            },
            [11] = new()
            {
                "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper", "ICT",
                "Physics 1st Paper", "Physics 2nd Paper", "Chemistry 1st Paper", "Chemistry 2nd Paper",
                "Biology 1st Paper", "Biology 2nd Paper", "Higher Mathematics 1st Paper", "Higher Mathematics 2nd Paper",
                "Accounting 1st Paper", "Accounting 2nd Paper", "Finance, Banking and Insurance 1st Paper", "Finance, Banking and Insurance 2nd Paper",
                "Business Organization and Management 1st Paper", "Business Organization and Management 2nd Paper",
                "Marketing 1st Paper", "Marketing 2nd Paper", "Production Management & Marketing 1st Paper", "Production Management & Marketing 2nd Paper",
                "Economics 1st Paper", "Economics 2nd Paper", "Civics & Good Governance 1st Paper", "Civics & Good Governance 2nd Paper",
                "History 1st Paper", "History 2nd Paper", "Islamic History & Culture 1st Paper", "Islamic History & Culture 2nd Paper",
                "Logic 1st Paper", "Logic 2nd Paper", "Sociology 1st Paper", "Sociology 2nd Paper",
                "Social Work 1st Paper", "Social Work 2nd Paper", "Geography 1st Paper", "Geography 2nd Paper",
                "Psychology 1st Paper", "Psychology 2nd Paper"
            },
            [12] = new()
            {
                "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper", "ICT",
                "Physics 1st Paper", "Physics 2nd Paper", "Chemistry 1st Paper", "Chemistry 2nd Paper",
                "Biology 1st Paper", "Biology 2nd Paper", "Higher Mathematics 1st Paper", "Higher Mathematics 2nd Paper",
                "Accounting 1st Paper", "Accounting 2nd Paper", "Finance, Banking and Insurance 1st Paper", "Finance, Banking and Insurance 2nd Paper",
                "Business Organization and Management 1st Paper", "Business Organization and Management 2nd Paper",
                "Marketing 1st Paper", "Marketing 2nd Paper", "Production Management & Marketing 1st Paper", "Production Management & Marketing 2nd Paper",
                "Economics 1st Paper", "Economics 2nd Paper", "Civics & Good Governance 1st Paper", "Civics & Good Governance 2nd Paper",
                "History 1st Paper", "History 2nd Paper", "Islamic History & Culture 1st Paper", "Islamic History & Culture 2nd Paper",
                "Logic 1st Paper", "Logic 2nd Paper", "Sociology 1st Paper", "Sociology 2nd Paper",
                "Social Work 1st Paper", "Social Work 2nd Paper", "Geography 1st Paper", "Geography 2nd Paper",
                "Psychology 1st Paper", "Psychology 2nd Paper"
            },
        };

        var classList = new List<Class>();
        foreach (var (grade, subjectNames) in gradeCurriculumMap)
        {
            foreach (var sName in subjectNames)
            {
                if (!subjectByName.TryGetValue(sName, out var subject)) continue;

                var qualified = subjectQualifiedTeachers[subject.Id];
                var assignedTeacherId = qualified.Count > 0
                    ? qualified[subjectTeacherCursor[subject.Id]++ % qualified.Count]
                    : teachersList[0].Id;

                classList.Add(new Class
                {
                    ClassLevel = grade,
                    SubjectId = subject.Id,
                    TeacherId = assignedTeacherId,
                    Description = $"Class {grade} - {subject.SubjectName}",
                    IsActive = true,
                    CreatedAtUtc = now.AddMonths(-6),
                    UpdatedAtUtc = now,
                });
            }
        }
        await context.Classes.AddRangeAsync(classList);
        await context.SaveChangesAsync();

        // Helper to check if a Class 11/12 subject belongs to a student's group stream
        static bool IsSubjectForGroup(string subjectName, string group)
        {
            var s = subjectName.Trim().ToLower();
            if (s.Contains("bangla") || s.Contains("english")) return true;

            var g = group.Trim().ToLower();
            if (g.Contains("science"))
            {
                return s.Contains("physics") || s.Contains("chemistry") || s.Contains("biology") || s.Contains("higher mathematics");
            }
            if (g.Contains("humanities") || g.Contains("arts"))
            {
                return s.Contains("history") || s.Contains("civics") || s.Contains("economics") || s.Contains("geography");
            }
            if (g.Contains("business"))
            {
                return s.Contains("accounting") || s.Contains("finance") || s.Contains("business organization") || s.Contains("production management");
            }
            return true;
        }


        // ───────────────────────── 6. ENROLL STUDENTS IN CLASSES ─────────────────────────
        var studentClassesList = new List<StudentClass>();
        foreach (var student in studentsList)
        {
            var matchingClasses = classList
                .Where(c => c.ClassLevel == student.ClassLevel)
                .Where(c => student.ClassLevel < 11 || IsSubjectForGroup(c.Subject?.SubjectName ?? "", student.Group))
                .ToList();

            foreach (var targetClass in matchingClasses)
            {
                studentClassesList.Add(new StudentClass
                {
                    StudentId = student.Id,
                    ClassId = targetClass.Id,
                    EnrolledAtUtc = now.AddMonths(-5),
                });
            }
        }
        await context.StudentClasses.AddRangeAsync(studentClassesList);
        await context.SaveChangesAsync();


        // ───────────────────────── 7. CREATE ASSIGNMENTS ─────────────────────────
        // Required assignment mark range: 20 to 50 range!
        // We will create assignments across past months and current/future.
        // Bar Chart monthly distribution (Feb to Aug 2026):
        // 5 months ago (Feb): 15, 4 months ago (Mar): 25, 3 months ago (Apr): 35, 2 months ago (May): 45, 1 month ago (Jun): 55, current month (Jul/Aug): 65
        
        var assignmentTemplates = new (string Title, string Desc, int MaxMarks)[]
        {
            ("Term Midterm Examination Worksheet", "Complete comprehensive exercises covering core syllabus modules.", 50),
            ("Problem Solving & Critical Thinking Task", "Analytical problem solving assignment with step-by-step solutions.", 40),
            ("Weekly Practical Assessment", "Laboratory report and theoretical calculations for module evaluation.", 30),
            ("Chapter Review Quiz & Analytical Questions", "Multiple choice and short answer section covering key definitions.", 25),
            ("Research & Essay Presentation", "In-depth investigative report with historical and modern contexts.", 45),
            ("Group Case Study & Solution Draft", "Collaborative assignment investigating real-world applications.", 35),
            ("Bi-Weekly Continuous Assessment", "Short diagnostic assignment evaluating weekly learning progress.", 20),
            ("Final Project Draft & Diagrammatic Model", "Comprehensive synthesis project including diagrams and formulas.", 50),
            ("Homework & Practice Exercises", "Standard problem set covering daily classroom lectures.", 30),
            ("Advanced Skill Building Challenge", "Challenging problem set designed for higher-order cognitive skills.", 40),
            ("Pre-Board Mock Assessment", "Standardized mock exam format testing full term knowledge.", 50),
            ("Interactive Digital Assignment", "Digital submission focusing on practical and technological application.", 35),
        };

        var assignmentsList = new List<Assignment>();

        // Create past graded/submitted assignments for each class (created over the last 5 months)
        // We'll create:
        // - 6 Past Graded Assignments per class
        // - 2 Past Submitted (Ungraded) Assignments per class
        // - 1 Past Assignment with AllowResubmission = false (where non-submitters get 0)
        // - 1 Past Assignment with Late Submission allowed
        // - 3 Future/Active Assignments per class (1 due soon [due assignment], 2 pending later [pending assignments])

        int assignmentCounter = 0;
        foreach (var cls in classList)
        {
            var subName = cls.Subject?.SubjectName ?? "General";
            int safeDay = Math.Min(now.Day, 28);
            
            // --- 1. Past Graded Assignments (2 per class: created 4 months ago and 2 months ago) ---
            for (int p = 1; p <= 2; p++)
            {
                var template = assignmentTemplates[(p + assignmentCounter) % assignmentTemplates.Length];
                int monthsAgo = 5 - (p * 2); // 3 and 1 month ago
                var created = now.AddMonths(-monthsAgo).AddDays((cls.Id % 5) - 5);
                var deadline = created.AddDays(7);

                var title1 = GetRealisticAssignmentTitle(subName, cls.ClassLevel, p);
                var details1 = GetRealisticAssignmentDetails(title1, subName, cls.ClassLevel);
                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = title1,
                    Description = details1.Description,
                    Instructions = details1.Instructions,
                    MaxMarks = template.MaxMarks, // Range 20 - 50
                    DeadlineUtc = deadline,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = true,
                    CreatedAtUtc = created,
                    UpdatedAtUtc = created,
                });
            }

            // --- 2. Past Strict Deadline Quiz (1 per class: AllowResubmission = false) → moved to March ---
            {
                var template = assignmentTemplates[(5 + assignmentCounter) % assignmentTemplates.Length];
                var created = new DateTime(now.Year, 3, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-14);
                var deadline = new DateTime(now.Year, 3, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-7);
                var title2 = GetRealisticAssignmentTitle(subName, cls.ClassLevel, 3);
                var details2 = GetRealisticAssignmentDetails(title2, subName, cls.ClassLevel);

                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = title2,
                    Description = details2.Description,
                    Instructions = "Strict deadline. " + details2.Instructions,
                    MaxMarks = template.MaxMarks,
                    DeadlineUtc = deadline,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = false,
                    CreatedAtUtc = created,
                    UpdatedAtUtc = created,
                });
            }

            // --- 3. Active / Variant Assignment per Class (Due Soon, Pending, or Recent Draft) ---
            // Moved from July to March/April per request: keep day numbers, switch month.
            int variant = assignmentCounter % 3;
            if (variant == 0)
            {
                // Urgent Due Soon Task → moved to March
                var template = assignmentTemplates[(6 + assignmentCounter) % assignmentTemplates.Length];
                var created = new DateTime(now.Year, 3, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-2);
                var deadline = new DateTime(now.Year, 3, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(3);
                var title3 = GetRealisticAssignmentTitle(subName, cls.ClassLevel, 4);
                var details3 = GetRealisticAssignmentDetails(title3, subName, cls.ClassLevel);

                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = title3,
                    Description = details3.Description,
                    Instructions = details3.Instructions,
                    MaxMarks = template.MaxMarks,
                    DeadlineUtc = deadline,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = true,
                    CreatedAtUtc = created,
                    UpdatedAtUtc = created,
                });
            }
            else if (variant == 1)
            {
                // Pending Task → moved to April
                var template = assignmentTemplates[(7 + assignmentCounter) % assignmentTemplates.Length];
                var created = new DateTime(now.Year, 4, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-1);
                var deadline = new DateTime(now.Year, 4, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(12);
                var title4 = GetRealisticAssignmentTitle(subName, cls.ClassLevel, 5);
                var details4 = GetRealisticAssignmentDetails(title4, subName, cls.ClassLevel);

                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = title4,
                    Description = details4.Description,
                    Instructions = details4.Instructions,
                    MaxMarks = template.MaxMarks,
                    DeadlineUtc = deadline,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = true,
                    CreatedAtUtc = created,
                    UpdatedAtUtc = created,
                });
            }
            else
            {
                // Recent Draft for Submitted-but-Ungraded state → moved to April
                var template = assignmentTemplates[(8 + assignmentCounter) % assignmentTemplates.Length];
                var created = new DateTime(now.Year, 4, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-6);
                var deadline = new DateTime(now.Year, 4, safeDay, 0, 0, 0, DateTimeKind.Utc).AddDays(-1);
                var title5 = GetRealisticAssignmentTitle(subName, cls.ClassLevel, 6);
                var details5 = GetRealisticAssignmentDetails(title5, subName, cls.ClassLevel);

                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = title5,
                    Description = details5.Description,
                    Instructions = details5.Instructions,
                    MaxMarks = template.MaxMarks,
                    DeadlineUtc = deadline,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = true,
                    CreatedAtUtc = created,
                    UpdatedAtUtc = created,
                });
            }

            // --- 4. 2 Active 10-Mark Upcoming Assignments per Class (Deadlines 7 & 14 days in future) ---
            for (int actIdx = 0; actIdx < 2; actIdx++)
            {
                var createdActive = now.AddDays(-1);
                var deadlineActive = now.AddDays(7 * (actIdx + 1));
                var titleActive = GetRealisticAssignmentTitle(subName, cls.ClassLevel, actIdx + 85);
                var detailsActive = GetRealisticAssignmentDetails(titleActive, subName, cls.ClassLevel);

                assignmentsList.Add(new Assignment
                {
                    ClassId = cls.Id,
                    Title = titleActive,
                    Description = detailsActive.Description,
                    Instructions = detailsActive.Instructions,
                    MaxMarks = 10, // Explicitly 10 marks to minimize weight in total calculations
                    DeadlineUtc = deadlineActive,
                    Status = AssignmentStatus.Published,
                    AllowResubmission = true,
                    CreatedAtUtc = createdActive,
                    UpdatedAtUtc = createdActive,
                });
            }

            assignmentCounter++;
        }



        // --- 5. Add 50 assignments in June 2026 and 50 assignments in August 2026 specifically for Class 11 and Class 12 classes ---
        var extraJuneAssignments = new List<Assignment>();
        var extraAugAssignments = new List<Assignment>();

        var higherSecClasses = classList.Where(c => c.ClassLevel == 11 || c.ClassLevel == 12).ToList();
        if (higherSecClasses.Count == 0) higherSecClasses = classList;

        for (int i = 0; i < 50; i++)
        {
            var cls = higherSecClasses[i % higherSecClasses.Count];
            var subName = cls.Subject?.SubjectName ?? "General";
            var template = assignmentTemplates[(i * 3 + 1) % assignmentTemplates.Length];
            var titleJune = GetRealisticAssignmentTitle(subName, cls.ClassLevel, i + 10);
            var detailsJune = GetRealisticAssignmentDetails(titleJune, subName, cls.ClassLevel);

            int dayJune = (i % 28) + 1;
            var createdJune = new DateTime(2026, 6, dayJune, 10, 0, 0, DateTimeKind.Utc);
            var deadlineJune = createdJune.AddDays(7);

            extraJuneAssignments.Add(new Assignment
            {
                ClassId = cls.Id,
                Title = titleJune,
                Description = detailsJune.Description,
                Instructions = detailsJune.Instructions,
                MaxMarks = template.MaxMarks,
                DeadlineUtc = deadlineJune,
                Status = AssignmentStatus.Published,
                AllowResubmission = true,
                CreatedAtUtc = createdJune,
                UpdatedAtUtc = createdJune,
            });

            var templateAug = assignmentTemplates[(i * 3 + 2) % assignmentTemplates.Length];
            var titleAug = GetRealisticAssignmentTitle(subName, cls.ClassLevel, i + 40);
            var detailsAug = GetRealisticAssignmentDetails(titleAug, subName, cls.ClassLevel);

            int dayAug = (i % 28) + 1;
            var createdAug = new DateTime(2026, 8, dayAug, 10, 0, 0, DateTimeKind.Utc);
            var deadlineAug = createdAug.AddDays(7);

            extraAugAssignments.Add(new Assignment
            {
                ClassId = cls.Id,
                Title = titleAug,
                Description = detailsAug.Description,
                Instructions = detailsAug.Instructions,
                MaxMarks = templateAug.MaxMarks,
                DeadlineUtc = deadlineAug,
                Status = AssignmentStatus.Published,
                AllowResubmission = true,
                CreatedAtUtc = createdAug,
                UpdatedAtUtc = createdAug,
            });
        }

        assignmentsList.AddRange(extraJuneAssignments);
        assignmentsList.AddRange(extraAugAssignments);

        await context.Assignments.AddRangeAsync(assignmentsList);
        await context.SaveChangesAsync();

        // ───────────────────────── 8. GENERATE SUBMISSIONS & MARKS ─────────────────────────
        var studentClassesMap = (await context.StudentClasses.ToListAsync())
            .GroupBy(sc => sc.StudentId)
            .ToDictionary(g => g.Key, g => g.Select(sc => sc.ClassId).ToList());

        var classAssignmentsMap = (await context.Assignments.ToListAsync())
            .GroupBy(a => a.ClassId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var submissionsList = new List<Submission>();

        var gradeFeedbacks = new Dictionary<string, string[]>
        {
            ["A+"] = new[] { "Outstanding performance! Perfect understanding of concepts.", "Exceptional work with excellent analytical clarity." },
            ["A"] = new[] { "Excellent work! Clear understanding with neat execution.", "Great effort! Well structured and concise answers." },
            ["B"] = new[] { "Good submission. Fundamental concepts are solid with minor errors.", "Solid attempt. Review highlighted sections to improve." },
            ["C"] = new[] { "Satisfactory attempt. Core ideas present but needs more practice.", "Fair effort. Pay closer attention to calculation steps." },
            ["D"] = new[] { "Passable work. Essential concepts need thorough revision.", "Below average performance. Seek teacher guidance for core topics." },
            ["F"] = new[] { "Unsatisfactory. Missed critical requirements and key steps.", "Poor attempt. Please schedule a tutorial review." },
        };

        // Group students by ClassLevel for rank distribution (A+ to F)
        var studentsByGrade = studentsList
            .GroupBy(s => s.ClassLevel)
            .ToDictionary(g => g.Key, g => g.OrderBy(s => s.Id).ToList());

        foreach (var (gradeLevel, studentGroup) in studentsByGrade)
        {
            int studentCount = studentGroup.Count;

            for (int sIdx = 0; sIdx < studentCount; sIdx++)
            {
                var student = studentGroup[sIdx];
                var enrolledClassIds = studentClassesMap.GetValueOrDefault(student.Id, new List<int>());

                // Rank factor for performance gradient (A+ down to F)
                double rankFactor = (double)sIdx / Math.Max(1, studentCount - 1);
                // Classes 6-8 are boosted so top students can reach A/A+
                double baseHigh = (gradeLevel <= 8) ? 0.97 : 0.95;
                double baseRange = (gradeLevel <= 8) ? 0.50 : 0.58;
                double targetPct = baseHigh - (rankFactor * baseRange);
                // Additional 13% mark boost for class 6/7/8 students
                double markBoost = (gradeLevel <= 8) ? 0.13 : 0.0;

                int studentDueCount = 0;        // Target: 1 due assignment (unsubmitted)
                int studentPendingCount = 0;    // Target: 2 pending assignments (unsubmitted)
                int studentSubmittedCount = 0;  // Target: 5 submitted but ungraded assignments per student profile
                int studentLateCount = 0;       // Target: 1 late submission per student

                // Flatten all assignments for this student across all enrolled classes
                var allStudentAsgns = enrolledClassIds
                    .SelectMany(cId => classAssignmentsMap.GetValueOrDefault(cId, new List<Assignment>()))
                    .OrderBy(a => a.DeadlineUtc)
                    .ToList();

                foreach (var asgn in allStudentAsgns)
                {
                    var maxM = (double)asgn.MaxMarks;

                    // 1. Future / Active Assignments (Deadline in future)
                    if (asgn.DeadlineUtc > now)
                    {
                        if (studentSubmittedCount < 5)
                        {
                            studentSubmittedCount++;
                            submissionsList.Add(new Submission
                            {
                                AssignmentId = asgn.Id,
                                StudentId = student.Id,
                                SubmissionText = $"Respected Teacher, please find attached my solution draft for {asgn.Title}.",
                                FileUrl = "student_solution.pdf",
                                SubmittedAtUtc = now.AddHours(-2),
                                Marks = null, // Kept ungraded!
                                Feedback = "Submitted solution received. Pending teacher evaluation.",
                                Status = SubmissionStatus.Submitted, // Submitted state
                                UpdatedAtUtc = now,
                            });
                        }
                        else
                        {
                            // Remaining future active assignments stay unsubmitted
                            studentPendingCount++;
                        }
                    }


                    // 2. Past Strict Deadline Quiz (AllowResubmission = false)
                    else if (!asgn.AllowResubmission)
                    {
                        bool isMissing = (student.Id + asgn.Id) % 5 == 0 || targetPct < 0.45;
                        if (isMissing)
                        {
                            submissionsList.Add(new Submission
                            {
                                AssignmentId = asgn.Id,
                                StudentId = student.Id,
                                SubmissionText = null,
                                FileUrl = null,
                                SubmittedAtUtc = null,
                                Marks = 0, // 0 mark because missed deadline and no late submission allowed
                                Feedback = "Assignment deadline passed without submission. Late submission not permitted (0 marks assigned).",
                                Status = SubmissionStatus.Missing,
                                UpdatedAtUtc = asgn.DeadlineUtc,
                            });
                        }
                        else
                        {
                            double variation = (((student.Id * 13 + asgn.Id * 7) % 17) - 8) * 0.015;
                            double actualPct = Math.Clamp(targetPct + variation + markBoost, 0.20, 0.98);
                            decimal marks = Math.Round((decimal)(maxM * actualPct), 1);
                            string tierKey = actualPct >= 0.90 ? "A+" : actualPct >= 0.80 ? "A" : actualPct >= 0.70 ? "B" : actualPct >= 0.60 ? "C" : actualPct >= 0.50 ? "D" : "F";

                            submissionsList.Add(new Submission
                            {
                                AssignmentId = asgn.Id,
                                StudentId = student.Id,
                                SubmissionText = $"Attached solution for strict deadline task {asgn.Title}.",
                                FileUrl = "student_solution.pdf",
                                SubmittedAtUtc = asgn.DeadlineUtc.AddHours(-10),
                                Marks = marks,
                                Feedback = gradeFeedbacks[tierKey][(student.Id + asgn.Id) % 2],
                                Status = SubmissionStatus.Graded,
                                UpdatedAtUtc = asgn.DeadlineUtc.AddHours(12),
                            });
                        }
                    }
                    // 3. Past Regular Assignments
                    else
                    {
                        // Priority 1: Guarantee 1 Late Submission per student
                        if (studentLateCount < 1)
                        {
                            studentLateCount++;
                            double variation = (((student.Id * 11 + asgn.Id * 5) % 13) - 6) * 0.01;
                            double actualPct = Math.Clamp(targetPct * 0.85 + variation + markBoost, 0.25, 0.90);
                            decimal marks = Math.Round((decimal)(maxM * actualPct), 1);

                            submissionsList.Add(new Submission
                            {
                                AssignmentId = asgn.Id,
                                StudentId = student.Id,
                                SubmissionText = $"Respected Teacher, apologies for late submission of {asgn.Title}.",
                                FileUrl = "late_solution.pdf",
                                SubmittedAtUtc = asgn.DeadlineUtc.AddHours(18), // Submitted after deadline
                                Marks = marks,
                                Feedback = "Late submission accepted with late policy penalty applied.",
                                Status = SubmissionStatus.Late,
                                UpdatedAtUtc = asgn.DeadlineUtc.AddHours(24),
                            });
                        }
                        else
                        {
                            // Graded Submission
                            double variation = (((student.Id * 17 + asgn.Id * 23) % 21) - 10) * 0.012;
                            double actualPct = Math.Clamp(targetPct + variation + markBoost, 0.25, 0.98);
                            decimal marks = Math.Round((decimal)(maxM * actualPct), 1);

                            string tierKey = actualPct >= 0.90 ? "A+" : actualPct >= 0.80 ? "A" : actualPct >= 0.70 ? "B" : actualPct >= 0.60 ? "C" : actualPct >= 0.50 ? "D" : "F";
                            string fb = gradeFeedbacks[tierKey][(student.Id + asgn.Id) % 2];

                            submissionsList.Add(new Submission
                            {
                                AssignmentId = asgn.Id,
                                StudentId = student.Id,
                                SubmissionText = $"Respected Teacher, please find my submission for {asgn.Title}.",
                                FileUrl = "assignment_solution.pdf",
                                SubmittedAtUtc = asgn.DeadlineUtc.AddHours(-16),
                                Marks = marks,
                                Feedback = fb,
                                Status = SubmissionStatus.Graded,
                                UpdatedAtUtc = asgn.DeadlineUtc.AddHours(20),
                            });
                        }
                    }
                }
            }
        }

        await context.Submissions.AddRangeAsync(submissionsList);
        await context.SaveChangesAsync();

        // ───────────────────────── 9. GENERATE SUBMISSIONS FOR JUNE & AUGUST EXTRA ASSIGNMENTS ─────────────────────────
        // Requirement: 50% submission completed, 80-90% grades achieved by submitting students
        var extraSubmissions = new List<Submission>();
        var extraAllAssignments = extraJuneAssignments.Concat(extraAugAssignments).ToList();

        var existingKeys = new HashSet<(int AssignmentId, int StudentId)>(submissionsList.Select(s => (s.AssignmentId, s.StudentId)));

        foreach (var asgn in extraAllAssignments)
        {
            var enrolledStudents = studentsList.Where(s => studentClassesMap.GetValueOrDefault(s.Id, new List<int>()).Contains(asgn.ClassId)).ToList();
            int totalEnrolled = enrolledStudents.Count;
            if (totalEnrolled == 0) continue;

            int submitCount = Math.Max(1, (int)Math.Round(totalEnrolled * 0.5)); // Exactly 50% submissions

            for (int s = 0; s < totalEnrolled; s++)
            {
                var student = enrolledStudents[s];
                if (existingKeys.Contains((asgn.Id, student.Id))) continue;
                existingKeys.Add((asgn.Id, student.Id));

                var maxM = (double)asgn.MaxMarks;

                if (s < submitCount)
                {
                    // For 60% of submitting students, keep as Submitted (ungraded, awaiting teacher evaluation)
                    bool isUngraded = (s % 5 != 0);
                    if (isUngraded)
                    {
                        extraSubmissions.Add(new Submission
                        {
                            AssignmentId = asgn.Id,
                            StudentId = student.Id,
                            SubmissionText = $"Respected Teacher, please find attached my solution draft for {asgn.Title}.",
                            FileUrl = "student_solution.pdf",
                            SubmittedAtUtc = asgn.CreatedAtUtc.AddDays(2),
                            Marks = null,
                            Feedback = "Submitted solution received. Pending teacher evaluation.",
                            Status = SubmissionStatus.Submitted,
                            UpdatedAtUtc = asgn.CreatedAtUtc.AddDays(2),
                        });
                    }
                    else
                    {
                        // 70% to 90% grade percentage for graded ones
                        double pct = 0.70 + ((student.Id * 7 + asgn.Id * 13) % 21) * 0.01; // 0.70 - 0.90
                        decimal marks = Math.Round((decimal)(maxM * pct), 1);
                        string tierKey = pct >= 0.90 ? "A+" : pct >= 0.80 ? "A" : "B";

                        extraSubmissions.Add(new Submission
                        {
                            AssignmentId = asgn.Id,
                            StudentId = student.Id,
                            SubmissionText = $"Attached solution for term evaluation task {asgn.Title}.",
                            FileUrl = "student_solution.pdf",
                            SubmittedAtUtc = asgn.CreatedAtUtc.AddDays(3),
                            Marks = marks,
                            Feedback = gradeFeedbacks[tierKey][(student.Id + asgn.Id) % 2],
                            Status = SubmissionStatus.Graded,
                            UpdatedAtUtc = asgn.CreatedAtUtc.AddDays(4),
                        });
                    }
                }
                else
                {
                    // Unsubmitted / Missing for the remaining 50%
                    extraSubmissions.Add(new Submission
                    {
                        AssignmentId = asgn.Id,
                        StudentId = student.Id,
                        SubmissionText = null,
                        FileUrl = null,
                        SubmittedAtUtc = null,
                        Marks = 0,
                        Feedback = "Assignment deadline passed without submission.",
                        Status = SubmissionStatus.Missing,
                        UpdatedAtUtc = asgn.DeadlineUtc,
                    });
                }
            }
        }

        if (extraSubmissions.Count > 0)
        {
            await context.Submissions.AddRangeAsync(extraSubmissions);
            await context.SaveChangesAsync();
        }

        // ───────────────────────── 10. BUMP ALL GRADED SUBMISSIONS BY 5% & GUARANTEE AT LEAST 2 A/A+ STUDENTS IN CLASS 6, 7, 8 ─────────────────────────
        var allSubmissionsToBump = await context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.Status == SubmissionStatus.Graded && s.Marks != null && s.Assignment != null)
            .ToListAsync();

        foreach (var sub in allSubmissionsToBump)
        {
            var maxM = (double)sub.Assignment!.MaxMarks;
            if (maxM <= 0) continue;

            double currentPct = (double)sub.Marks!.Value / maxM;
            // General 5% bump (capped at 95%)
            if (currentPct < 0.95)
            {
                double newPct = Math.Min(0.95, currentPct + 0.05);
                sub.Marks = Math.Round((decimal)(maxM * newPct), 1);
            }
        }

        // Additional Boost for Class 6, 7, and 8: Ensure at least top 2 students in each Class 6, 7, 8 average >= 80% (A / A+)
        var lowerClassSubmissions = allSubmissionsToBump
            .Where(s => s.Student != null && (s.Student.ClassLevel == 6 || s.Student.ClassLevel == 7 || s.Student.ClassLevel == 8))
            .GroupBy(s => s.Student!.ClassLevel);

        foreach (var classGroup in lowerClassSubmissions)
        {
            // Group by student within the class level
            var studentSubmissionsMap = classGroup.GroupBy(s => s.StudentId).ToList();

            // Find top 2 students in this class level based on current average
            var top2Students = studentSubmissionsMap
                .Select(g => new { StudentId = g.Key, AvgPct = g.Average(s => (double)s.Marks!.Value / (double)s.Assignment!.MaxMarks) })
                .OrderByDescending(x => x.AvgPct)
                .Take(2)
                .Select(x => x.StudentId)
                .ToHashSet();

            foreach (var g in studentSubmissionsMap.Where(g => top2Students.Contains(g.Key)))
            {
                foreach (var sub in g)
                {
                    var maxM = (double)sub.Assignment!.MaxMarks;
                    if (maxM <= 0) continue;

                    // Boost top 2 students' scores up to 88% - 96% range so they achieve overall A / A+
                    double curPct = (double)sub.Marks!.Value / maxM;
                    double boostedPct = Math.Max(curPct, 0.88 + (((sub.StudentId * 13 + sub.AssignmentId * 7) % 7) * 0.012));
                    sub.Marks = Math.Round((decimal)(maxM * boostedPct), 1);
                }
            }
        }

        await context.SaveChangesAsync();
    }

    private static string GetRealisticAssignmentTitle(string subName, int classLevel, int assignmentIndex)
    {
        var lower = subName.ToLowerInvariant();

        if (lower.Contains("bangla") || lower.Contains("bengali"))
        {
            string[] banglaTitles = new[]
            {
                "কবিতা পাঠ ও মূলভাব বিশ্লেষণ (Poetry Analysis)",
                "সৃজনশীল অনুচ্ছেদ ও ব্যাকরণ বিধি (Creative Writing & Grammar)",
                "উপন্যাস ও নাটক চরিত্র বিশ্লেষণ (Novel Character Study)",
                "বাংলা গদ্য ও সাহিত্য রচনার সমীকরণ (Prose & Literary Composition)"
            };
            return banglaTitles[assignmentIndex % banglaTitles.Length];
        }

        if (lower.Contains("english"))
        {
            string[] englishTitles = new[]
            {
                "Reading Comprehension & Critical Vocabulary Practice",
                "Formal Letter & Argumentative Essay Writing Assignment",
                "Grammar Mastery: Sentence Transformation & Voice Change",
                "Poetry Summary & Literary Theme Analysis"
            };
            return englishTitles[assignmentIndex % englishTitles.Length];
        }

        if (lower.Contains("physics"))
        {
            string[] physicsTitles = new[]
            {
                "Newton's Laws of Motion & Kinematics Problem Solving",
                "Work, Power, Energy & Mechanical Efficiency Analysis",
                "Refraction of Light & Optical Lens Geometry",
                "Electric Current, Ohm's Law & Circuit Analysis"
            };
            return physicsTitles[assignmentIndex % physicsTitles.Length];
        }

        if (lower.Contains("chemistry"))
        {
            string[] chemistryTitles = new[]
            {
                "Atomic Structure & Electron Configuration Exercises",
                "Chemical Bonding, Periodic Table & Valency Assessment",
                "Mole Concept & Chemical Stoichiometry Calculations",
                "Acid-Base Equilibrium & Oxidation-Reduction Reactions"
            };
            return chemistryTitles[assignmentIndex % chemistryTitles.Length];
        }

        if (lower.Contains("biology"))
        {
            string[] biologyTitles = new[]
            {
                "Cell Division (Mitosis & Meiosis) Diagrammatic Report",
                "Plant Tissue Systems & Photosynthesis Experiment Study",
                "Human Organ Systems & Physiology Case Study",
                "Genetics, DNA Structure & Hereditary Patterns Analysis"
            };
            return biologyTitles[assignmentIndex % biologyTitles.Length];
        }

        if (lower.Contains("ict") || lower.Contains("digital") || lower.Contains("information"))
        {
            string[] ictTitles = new[]
            {
                "Cyber Security, Password Protection & Ethical Guidelines",
                "Database Management Systems (DBMS) & SQL Queries",
                "Responsive Web Page Design using HTML5 & CSS3",
                "Computer Topologies & Data Communication Networks"
            };
            return ictTitles[assignmentIndex % ictTitles.Length];
        }

        if (lower.Contains("math"))
        {
            string[] mathTitles = new[]
            {
                "Algebraic Expressions & Factorization Problem Solving",
                "Trigonometric Identities & Practical Geometry Construction",
                "Indices, Logarithms & Exponential Equations Worksheet",
                "Statistics & Data Distribution Analysis Project"
            };
            return mathTitles[assignmentIndex % mathTitles.Length];
        }

        if (lower.Contains("accounting"))
        {
            string[] accountingTitles = new[]
            {
                "Double Entry Bookkeeping & Journal Ledger Posting",
                "Trial Balance Preparation & Financial Adjustments",
                "Financial Statements: Income Statement & Balance Sheet",
                "Cost Accounting & Asset Depreciation Analysis"
            };
            return accountingTitles[assignmentIndex % accountingTitles.Length];
        }

        if (lower.Contains("finance"))
        {
            string[] financeTitles = new[]
            {
                "Time Value of Money & Net Present Value Calculations",
                "Capital Budgeting & Investment Decision Portfolio",
                "Commercial Banking Credit Systems & Loan Risk Analysis",
                "Financial Markets, Securities & Bond Evaluation"
            };
            return financeTitles[assignmentIndex % financeTitles.Length];
        }

        if (lower.Contains("bangladesh") || lower.Contains("global"))
        {
            string[] bgsTitles = new[]
            {
                "Liberation War of 1971 & Historical Context Report",
                "Socio-Economic Development & Governance in Bangladesh",
                "United Nations & Global Climate Change Action Plan",
                "Constitutional Framework & Fundamental Rights Analysis"
            };
            return bgsTitles[assignmentIndex % bgsTitles.Length];
        }

        string[] defaultTitles = new[]
        {
            "Curriculum Concept Review & Analytical Problem Set",
            "Term Comprehensive Study & Theoretical Worksheet",
            "Practical Application & Research Case Summary",
            "Core Syllabus Module Evaluation & Presentation Draft"
        };
        return defaultTitles[assignmentIndex % defaultTitles.Length];
    }

    private static (string Description, string Instructions) GetRealisticAssignmentDetails(string title, string subName, int classLevel)
    {
        var lower = subName.ToLowerInvariant();

        if (lower.Contains("bangla") || lower.Contains("bengali"))
        {
            return (
                "বাংলা সাহিত্যের নির্দিষ্ট অধ্যায় পাঠ করে এর কেন্দ্রীয় চরিত্র, কবির জীবনদর্শন, অলংকার ও মূলভাব বিস্তারিত বিশ্লেষণ করুন। (Detailed literary analysis of central theme, poetic devices, and core message.)",
                "ক্যালোগ্রাফি বা স্পষ্ট হস্তাক্ষরে অথবা টাইপকৃত ৩-৪ পৃষ্ঠার PDF জমা দিন। প্রধান পয়েন্টসমূহ বুলেট আকারে লিখুন।"
            );
        }

        if (lower.Contains("english"))
        {
            return (
                "Read the designated text passage, answer analytical comprehension questions, rewrite key sentences using formal vocabulary, and compose a 150-word summary.",
                "Submit a well-formatted PDF document. Ensure proper grammar, clear paragraph structure, and cite passage evidence directly."
            );
        }

        if (lower.Contains("physics"))
        {
            return (
                "Comprehensive physics assignment covering theoretical principles, vector forces, kinematics equations of motion, and practical numerical calculations.",
                "Show full step-by-step mathematical derivations with SI units for all numerical problems. Free-body diagrams must be drawn clearly in PDF submission."
            );
        }

        if (lower.Contains("chemistry"))
        {
            return (
                "Theoretical and mathematical assignment on atomic structure models, quantum numbers, electron configuration anomalies, and periodic trend properties.",
                "Draw orbital diagrams clearly. Explain periodic trends in ionization energy and electronegativity with logical reasoning in your PDF solution."
            );
        }

        if (lower.Contains("biology"))
        {
            return (
                "Laboratory-focused assignment exploring stages of cell division (Mitosis & Meiosis), plant tissue vascular systems (Xylem & Phloem), and metabolic pathways.",
                "Include neat, labeled diagrams for each biological structure and division stage. Submit your solution as a single PDF file."
            );
        }

        if (lower.Contains("ict") || lower.Contains("digital") || lower.Contains("information"))
        {
            return (
                "Practical computer science task on relational database normalization (1NF to 3NF), SQL query execution, cybersecurity protocols, and HTML web page design.",
                "Provide SQL code snippets alongside screenshot output tables. For cybersecurity questions, detail 5 essential data protection best practices."
            );
        }

        if (lower.Contains("math"))
        {
            return (
                "Advanced mathematics problem set covering algebraic expressions, trigonometric identities, quadratic equation factorization, and synthetic division.",
                "Solve all questions sequentially showing complete logical steps. Highlight final numerical and algebraic answers in bold boxes."
            );
        }

        if (lower.Contains("accounting"))
        {
            return (
                "Financial accounting project covering double-entry journal entries, T-account ledger posting, trial balance reconciliation, and financial statements preparation.",
                "Draw standard accounting ledger tables and financial statement layouts clearly with debit/credit balance headers accurately calculated."
            );
        }

        if (lower.Contains("finance"))
        {
            return (
                "Financial management assignment analyzing Net Present Value (NPV), Internal Rate of Return (IRR), time value of money, and commercial bank credit risk.",
                "Show complete financial formulas, cash flow tables, and discount factor steps. Round calculations to 2 decimal places."
            );
        }

        if (lower.Contains("bangladesh") || lower.Contains("global"))
        {
            return (
                "Historical and social science research assignment examining the 1971 Liberation War of Bangladesh, constitutional framework, and international diplomatic relations.",
                "Write an 800-1000 word structured essay with Introduction, Key Historical Phases, International Diplomacy, and Conclusion. Include reference citations."
            );
        }

        return (
            "In-depth curriculum assessment task designed to evaluate core theoretical concepts, problem-solving techniques, and practical syllabus applications.",
            "Submit your completed work as a clean, single PDF file before the posted deadline. Ensure all prompt requirements are addressed."
        );
    }
}
