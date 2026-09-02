#!/bin/sh
##############################################################################
#
# Copyright 2021 the original author or authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
##############################################################################
##############################################################################
# Gradle wrapper script for Gradle 8.11.1
##############################################################################

DEFAULT_JVM_OPTS="-Xmx512m"
DEFAULT_JVM_OPTS="$DEFAULT_JVM_OPTS -Dkotlin.daemon.jvm.options=\"-Xmx4096m\""
APP_NAME="Gradle"
APP_BASE_NAME=`basename "$0"`

# Save first argument as the app args
APP_ARGS="$@"

# Find the project directory
TARGET_DIR=$(dirname "$0")
cd "$TARGET_DIR"
TARGET_DIR=$(pwd)

# Find the gradle-wrapper.jar
JAR_PATH="$TARGET_DIR/gradle/wrapper/gradle-wrapper.jar"

if [ ! -f "$JAR_PATH" ]; then
    echo "Error: gradle-wrapper.jar not found at $JAR_PATH"
    echo "Please run 'gradle wrapper' to generate the wrapper files."
    exit 1
fi

# Execute the gradle wrapper
exec java $DEFAULT_JVM_OPTS -cp "$JAR_PATH" org.gradle.wrapper.GradleWrapperMain "$@"
