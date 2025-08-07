# 멀티 스테이지 빌드 사용
# 1단계: 빌드 스테이지
FROM node:20-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 빌드에 필요한 패키지 설치
RUN apk add --no-cache python3 make g++

# package.json과 package-lock.json 복사 (의존성 캐싱을 위해)
COPY package*.json ./

# 의존성 설치 (빌드에 필요한 dev dependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드 최적화)
ENV NODE_ENV=production

# 디버깅을 위한 정보 출력
RUN node --version && npm --version && ls -la

# 프로덕션 빌드
RUN npm run build

# 빌드 결과 확인
RUN ls -la dist/

# 2단계: 실행 스테이지 (Nginx 사용)
FROM nginx:alpine

# 빌드된 파일들을 Nginx 웹 서버로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]