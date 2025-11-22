# Test Login Endpoints
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AITS CSMS - API Login Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Admin Login
Write-Host "1. Testing ADMIN Login..." -ForegroundColor Yellow
$adminBody = @{
    email = "admin@aits.edu"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

try {
    $adminResponse = Invoke-RestMethod -Uri 'http://localhost:8001/api/auth/login' -Method POST -Body $adminBody -ContentType 'application/json'
    Write-Host "   SUCCESS" -ForegroundColor Green
    Write-Host "   User: $($adminResponse.user.name)" -ForegroundColor White
    Write-Host "   Email: $($adminResponse.user.email)" -ForegroundColor White
    Write-Host "   Role: $($adminResponse.user.role)" -ForegroundColor White
    Write-Host "   Token: $($adminResponse.token.Substring(0,30))..." -ForegroundColor White
} catch {
    Write-Host "   FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" 

# Test 2: Teacher Login
Write-Host "2. Testing TEACHER Login..." -ForegroundColor Yellow
$teacherBody = @{
    email = "priya.sharma@aits.edu"
    password = "teacher123"
    role = "teacher"
} | ConvertTo-Json

try {
    $teacherResponse = Invoke-RestMethod -Uri 'http://localhost:8001/api/auth/login' -Method POST -Body $teacherBody -ContentType 'application/json'
    Write-Host "   SUCCESS" -ForegroundColor Green
    Write-Host "   User: $($teacherResponse.user.name)" -ForegroundColor White
    Write-Host "   Email: $($teacherResponse.user.email)" -ForegroundColor White
    Write-Host "   Role: $($teacherResponse.user.role)" -ForegroundColor White
    Write-Host "   Token: $($teacherResponse.token.Substring(0,30))..." -ForegroundColor White
} catch {
    Write-Host "   FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 3: Student Login
Write-Host "3. Testing STUDENT Login..." -ForegroundColor Yellow
$studentBody = @{
    email = "rahul.verma@student.aits.edu"
    password = "student123"
    role = "student"
} | ConvertTo-Json

try {
    $studentResponse = Invoke-RestMethod -Uri 'http://localhost:8001/api/auth/login' -Method POST -Body $studentBody -ContentType 'application/json'
    Write-Host "   SUCCESS" -ForegroundColor Green
    Write-Host "   User: $($studentResponse.user.name)" -ForegroundColor White
    Write-Host "   Email: $($studentResponse.user.email)" -ForegroundColor White
    Write-Host "   Role: $($studentResponse.user.role)" -ForegroundColor White
    Write-Host "   Token: $($studentResponse.token.Substring(0,30))..." -ForegroundColor White
} catch {
    Write-Host "   X FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
