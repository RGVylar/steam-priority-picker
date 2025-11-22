# PowerShell script to increment version
# Run this before git commit to auto-increment version

$mainFile = "backend/app/main.py"
$content = Get-Content $mainFile -Raw

# Extract current version
if ($content -match 'APP_VERSION = "([^"]+)"') {
    $currentVersion = $matches[1]
    Write-Host "Current version: $currentVersion"
    
    # Extract counter (last part after 'v')
    if ($currentVersion -match 'v(\d+)$') {
        $counter = [int]$matches[1]
        $newCounter = $counter + 1
    } else {
        $newCounter = 1
    }
} else {
    $newCounter = 1
}

# Generate new version with date and counter
$date = (Get-Date).ToString('yyyy-MM-dd')
$newVersion = "$date-v$newCounter"

# Replace version
$newContent = $content -replace 'APP_VERSION = "[^"]+"', "APP_VERSION = ""$newVersion"""

# Write back
Set-Content -Path $mainFile -Value $newContent -NoNewline

Write-Host "✅ Version updated to: $newVersion"
