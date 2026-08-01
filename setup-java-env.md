# Java Environment Variables Setup

## JDK 17 Installation Status: COMPLETED

JDK 17 has been successfully installed at:
```
C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot
```

## Environment Variables Setup (Manual Steps Required)

### Method 1: Using System Properties (Recommended)

1. **Press Windows Key + R**
2. **Type: `sysdm.cpl`** and press Enter
3. **Go to "Advanced" tab**
4. **Click "Environment Variables..."**
5. **Under "System variables":**
   - Click "New..."
   - **Variable name:** `JAVA_HOME`
   - **Variable value:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot`
   - Click "OK"

6. **Find "Path" variable** in System variables
   - Click "Edit..."
   - Click "New"
   - **Add:** `%JAVA_HOME%\bin`
   - Click "Move Up" to move it to the top
   - Click "OK" on all windows

### Method 2: Using PowerShell (Run as Administrator)

```powershell
# Run PowerShell as Administrator
# Set JAVA_HOME
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot", "Machine")

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = $currentPath + ";C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot\bin"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
```

### Method 3: Using Command Prompt (Run as Administrator)

```cmd
# Run Command Prompt as Administrator
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot" /M
setx PATH "%PATH%;%JAVA_HOME%\bin" /M
```

## Verification Steps

After setting up environment variables:

1. **Open a NEW Command Prompt or PowerShell window**
2. **Run these commands:**

```cmd
java -version
javac -version
echo %JAVA_HOME%
```

3. **Expected output for java -version:**
```
openjdk version "17.0.18" 2023-01-17
OpenJDK Runtime Environment Temurin-17.0.18+8 (build 17.0.18+8)
OpenJDK 64-Bit Server VM Temurin-17.0.18+8 (build 17.0.18+8, mixed mode, sharing)
```

## For IDE Integration

### VS Code Setup:
1. **Install Java Extension Pack** by Microsoft
2. **Press Ctrl+Shift+P**
3. **Type: "Java: Configure Java Runtime"**
4. **Select JDK 17 from the list**

### Alternative: Direct Java Path Test
If environment variables don't work immediately, you can test Java directly:

```cmd
"C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot\bin\java.exe" -version
```

## Troubleshooting

### If "java command not found":
1. **Restart your terminal/IDE completely**
2. **Verify JAVA_HOME is set:** `echo %JAVA_HOME%`
3. **Verify PATH includes Java:** `echo %PATH%`
4. **Check if directory exists:** `dir "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot\bin"`

### If IDE still shows error:
1. **Restart IDE completely**
2. **Clear IDE cache**
3. **Reconfigure IDE Java settings**
4. **Use direct path in IDE settings**

## Quick Summary

- **JDK 17 installed:** Yes
- **Installation path:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot`
- **Next step:** Set JAVA_HOME and PATH environment variables
- **Verification:** `java -version` should show OpenJDK 17

After completing these steps, your development environment will be ready!
