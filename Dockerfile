FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY HaiDangHomes.API/HaiDangHomes.API.csproj HaiDangHomes.API/
COPY HaiDangHomes.Application/HaiDangHomes.Application.csproj HaiDangHomes.Application/
COPY HaiDangHomes.Infrastructure/HaiDangHomes.Infrastructure.csproj HaiDangHomes.Infrastructure/
COPY HaiDangHomes.Domain/HaiDangHomes.Domain.csproj HaiDangHomes.Domain/

# Restore dependencies
RUN dotnet restore HaiDangHomes.API/HaiDangHomes.API.csproj

# Copy all source files
COPY . .

# Build and publish
RUN dotnet publish HaiDangHomes.API/HaiDangHomes.API.csproj -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create uploads directory for S3 temp files
RUN mkdir -p /app/uploads

# Copy published output
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "HaiDangHomes.API.dll"]
