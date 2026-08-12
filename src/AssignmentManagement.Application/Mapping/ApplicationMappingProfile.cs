using AutoMapper;
using AssignmentManagement.Application.DTOs.Assignments;
using AssignmentManagement.Application.DTOs.Classes;
using AssignmentManagement.Application.DTOs.Subjects;
using AssignmentManagement.Domain.Entities;

namespace AssignmentManagement.Application.Mapping;

public sealed class ApplicationMappingProfile : Profile
{
    public ApplicationMappingProfile()
    {
        CreateMap<Subject, SubjectListItemDto>();
        CreateMap<Subject, SubjectDetailDto>();
        CreateMap<Class, ClassListItemDto>();
        CreateMap<Class, ClassDetailDto>();
        CreateMap<Assignment, AssignmentListItemDto>();
        CreateMap<Assignment, AssignmentDetailDto>();
    }
}