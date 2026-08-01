# JDK 17 Installation Guide

## Option 1: Download and Install Manually (Recommended)

### Step 1: Download JDK 17
1. Go to: https://adoptium.net/
2. Click "Download" for JDK 17 LTS
3. Download the Windows x64 installer (.msi)

### Step 2: Install JDK 17
1. Run the downloaded .msi file
2. Follow the installation wizard
3. Note the installation path (usually: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot\`)

### Step 3: Set Environment Variables
1. Press `Windows Key + R` and type `sysdm.cpl`
2. Go to "Advanced" tab → "Environment Variables"
3. Under "System variables":
   - Click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot\` (adjust to your installation path)
4. Find "Path" variable → "Edit"
5. Click "New" → Add: `%JAVA_HOME%\bin`
6. Move it to the top using "Move Up"

### Step 4: Verify Installation
1. Open new Command Prompt
2. Run: `java -version`
3. Run: `javac -version`

## Option 2: Using Package Manager

### Using winget (Windows Package Manager)
```powershell
# Install OpenJDK 17
winget install EclipseAdoptium.Temurin.17.JDK

# Verify installation
java -version
```

### Using Chocolatey (if installed)
```powershell
# Install OpenJDK 17
choco install openjdk --version=17

# Verify installation
java -version
```

## Option 3: For VS Code / IDE Integration

### VS Code Extension Pack
1. Install "Extension Pack for Java" by Microsoft
2. Install "Java Code Generators" by Sato Saito
3. Restart VS Code
4. VS Code will detect JDK automatically

### Configure VS Code Settings
Press `Ctrl+Shift+P` → Type "Java: Configure Java Runtime" → Select JDK 17

## Option 4: Quick Setup Script

### PowerShell Script (Run as Administrator)
```powershell
# Download and install JDK 17
Write-Host "Downloading JDK 17..."
$webClient = New-Object System.Net.WebClient
$webClient.DownloadFile("https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.12_7.msi", "C:\temp\jdk17.msi")

Write-Host "Installing JDK 17..."
Start-Process -FilePath "C:\temp\jdk17.msi" -ArgumentList "/quiet" -Wait

# Set environment variables
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.12+7-hotspot"
[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "Machine")
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$javaPath\bin", "Machine")

Write-Host "JDK 17 installed successfully!"
Write-Host "Please restart your terminal/IDE to use the new Java version."
```

## Verification Commands

After installation, run these commands to verify:

```bash
# Check Java version
java -version

# Check Java compiler
javac -version

# Check JAVA_HOME
echo %JAVA_HOME%

# Check if Java is in PATH
where java
```

## Troubleshooting

### If "java command not found":
1. Verify JAVA_HOME is set correctly
2. Verify %JAVA_HOME%\bin is in PATH
3. Restart terminal/IDE completely
4. Run as Administrator if needed

### If IDE still shows error:
1. Restart IDE completely
2. Clear IDE cache
3. Reconfigure IDE Java settings
4. Check IDE-specific Java configuration

## Recommended Installation Path
```
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
PATH includes: %JAVA_HOME%\bin
```

This should resolve the JDK 17 requirement for your development environment.
