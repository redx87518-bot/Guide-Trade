@echo off
setlocal

set APP_BASE_NAME=%~n0
set TARGET_DIR=%~dp0
cd /d "%TARGET_DIR%"

set JAR_PATH=gradle/wrapper/gradle-wrapper.jar

if not exist "%JAR_PATH%" (
    echo Error: gradle-wrapper.jar not found at %JAR_PATH%
    echo Please run 'gradle wrapper' to generate the wrapper files.
    exit /b 1
)

java -Xmx512m -Dkotlin.daemon.jvm.options="-Xmx4096m" -cp "%JAR_PATH%" org.gradle.wrapper.GradleWrapperMain %*
