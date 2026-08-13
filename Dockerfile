# =====================================================================
# AssignFlow Backend Web API - Multi-stage Dockerfile for Render
# =====================================================================

# Stage 1: Build and Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project files for layer caching
COPY ["src/AssignmentManagement.Api/AssignmentManagement.Api.csproj", "src/AssignmentManagement.Api/"]
COPY ["src/AssignmentManagement.Application/AssignmentManagement.Application.csproj", "src/AssignmentManagement.Application/"]
COPY ["src/AssignmentManagement.Domain/AssignmentManagement.Domain.csproj", "src/AssignmentManagement.Domain/"]
COPY ["src/AssignmentManagement.Infrastructure/AssignmentManagement.Infrastructure.csproj", "src/AssignmentManagement.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/AssignmentManagement.Api/AssignmentManagement.Api.csproj"

# Copy source code and build Release package
COPY . .
WORKDIR "/src/src/AssignmentManagement.Api"
RUN dotnet publish "AssignmentManagement.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Container
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app

# Bind container HTTP traffic to port 8080 for Render
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Prevent inotify file watcher limit crashes on Render/Linux container hosts
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

# Copy compiled binaries from build stage
COPY --from=build /app/publish .

# Create persistent storage directory for file submissions
RUN mkdir -p /app/storage/submissions

ENTRYPOINT ["dotnet", "AssignmentManagement.Api.dll"]
