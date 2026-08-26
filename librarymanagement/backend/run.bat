@echo off
echo.
echo ====================================================================
echo Starting Library Management System...
echo Note: This project requires JDK 17.
echo Maven Toolchains will automatically use JDK 17 for the build
echo if you have configured your ~/.m2/toolchains.xml correctly.
echo ====================================================================
echo.

.\mvnw spring-boot:run
