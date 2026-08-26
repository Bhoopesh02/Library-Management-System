# Library Management System - Backend

This is the Spring Boot backend for the Library Management System.

## Requirements

- **JDK 17** is strictly required to build and run this project.
- **Maven** (included via wrapper `mvnw`)

### Setting up JDK 17 with Maven Toolchains

This project is configured to use **Maven Toolchains** to enforce JDK 17 for compilation and running, without requiring you to change your global `JAVA_HOME` if you use a newer JDK (e.g., JDK 25) for other projects.

1. **Install JDK 17**: Ensure you have JDK 17 installed (e.g., Oracle JDK 17 or Eclipse Temurin).
2. **Configure Toolchains**: Create or edit the `~/.m2/toolchains.xml` file (in your user home directory) to point to your JDK 17 installation.

Example `~/.m2/toolchains.xml` for Windows:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<toolchains>
    <toolchain>
        <type>jdk</type>
        <provides>
            <version>17</version>
            <vendor>oracle</vendor>
        </provides>
        <configuration>
            <jdkHome>C:\Program Files\Java\jdk-17</jdkHome>
        </configuration>
    </toolchain>
</toolchains>
```

## Running the Application

You can start the backend application using the provided script:

```bash
run.bat
```

Or using the Maven wrapper directly:

```bash
.\mvnw spring-boot:run
```
