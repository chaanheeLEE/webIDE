# 멀티 스테이지 빌드 사용
# 1단계: 빌드 스테이지
FROM gradle:8-jdk17-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# Gradle 래퍼와 빌드 파일들 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 소스 코드 복사
COPY src src

# 실행 권한 부여 및 빌드 실행
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 실행 스테이지
FROM eclipse-temurin:17-jre-alpine

# 헬스체크를 위한 curl 설치
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 생성된 JAR 파일 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 포트 노출 (Spring Boot 기본 포트)
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]