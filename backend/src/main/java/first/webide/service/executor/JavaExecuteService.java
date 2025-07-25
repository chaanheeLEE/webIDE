package first.webide.service.executor;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;
import org.springframework.stereotype.Service;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Service
public class JavaExecuteService {

    private static final long EXECUTION_TIMEOUT = 10;
    private static final String TEMP_DIR = "temp";

    public CodeExecuteResponse execute(CodeExecuteRequest request) {
        String code = request.getCode();
        long startTime = System.currentTimeMillis();

        try {
            // 코드 전처리 및 클래스명 추출
            String processedCode = preprocessCode(code);
            String className = extractClassName(processedCode);

            // 임시 디렉토리 생성
            Path tempDir = Paths.get(TEMP_DIR);
            if (!Files.exists(tempDir)) {
                Files.createDirectories(tempDir);
            }

            File javaFile = tempDir.resolve(className + ".java").toFile();
            File classFile = tempDir.resolve(className + ".class").toFile();

            try {
                // 1. Java 파일 저장
                try (FileWriter writer = new FileWriter(javaFile)) {
                    writer.write(processedCode);
                }

                // 2. 컴파일 (중요: 출력 디렉토리 명시)
                JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
                if (compiler == null) {
                    long executionTime = System.currentTimeMillis() - startTime;
                    return CodeExecuteResponse.failure("Java 컴파일러를 찾을 수 없습니다", executionTime);
                }

                ByteArrayOutputStream compileErrorStream = new ByteArrayOutputStream();
                // -d 옵션으로 출력 디렉토리 명시
                int compileResult = compiler.run(null, null, compileErrorStream,
                        "-d", tempDir.toString(),
                        "-cp", tempDir.toString(),
                        javaFile.getPath());

                if (compileResult != 0) {
                    long executionTime = System.currentTimeMillis() - startTime;
                    String compileError = compileErrorStream.toString();
                    return CodeExecuteResponse.failure("컴파일 실패:\n" + compileError, executionTime);
                }

                // 3. 컴파일 성공 확인
                if (!classFile.exists()) {
                    long executionTime = System.currentTimeMillis() - startTime;
                    return CodeExecuteResponse.failure("클래스 파일이 생성되지 않았습니다: " + className + ".class", executionTime);
                }

                // 4. 실행 (절대 경로 사용)
                ProcessBuilder processBuilder = new ProcessBuilder(
                        "java",
                        "-cp", tempDir.toAbsolutePath().toString(),
                        className
                );
                processBuilder.directory(tempDir.toFile());

                // 환경 변수 설정
                processBuilder.environment().put("CLASSPATH", tempDir.toAbsolutePath().toString());

                Process process = processBuilder.start();

                return executeProcess(process, startTime);

            } finally {
                // 정리
                deleteFileQuietly(javaFile);
                deleteFileQuietly(classFile);
            }

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            return CodeExecuteResponse.failure("예상치 못한 오류: " + e.getMessage(), executionTime);
        }
    }

    private String preprocessCode(String code) {
        // 패키지 선언 제거
        String processedCode = code.replaceAll("package\\s+[\\w.]+\\s*;", "").trim();

        // 빈 줄 정리
        processedCode = processedCode.replaceAll("\n\n+", "\n\n");

        // Main 클래스가 없고 main 메서드만 있는 경우
        if (!processedCode.contains("class") && processedCode.contains("public static void main")) {
            processedCode = "public class Main {\n" + processedCode + "\n}";
        }

        return processedCode;
    }

    private String extractClassName(String code) {
        // public class 이름 추출 (우선순위)
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("public\\s+class\\s+(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(code);

        if (matcher.find()) {
            return matcher.group(1);
        }

        // 일반 class 이름 추출
        pattern = java.util.regex.Pattern.compile("class\\s+(\\w+)");
        matcher = pattern.matcher(code);

        if (matcher.find()) {
            return matcher.group(1);
        }

        // 기본값
        return "Main";
    }

    private CodeExecuteResponse executeProcess(Process process, long startTime) throws InterruptedException {
        StringBuilder output = new StringBuilder();
        StringBuilder errorOutput = new StringBuilder();

        // 출력 읽기 스레드
        Thread outputReader = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            } catch (IOException e) {
                errorOutput.append("출력 읽기 오류: ").append(e.getMessage()).append("\n");
            }
        });

        // 에러 읽기 스레드
        Thread errorReader = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
            } catch (IOException e) {
                errorOutput.append("에러 읽기 오류: ").append(e.getMessage()).append("\n");
            }
        });

        outputReader.start();
        errorReader.start();

        // 타임아웃과 함께 프로세스 대기
        boolean finished = process.waitFor(EXECUTION_TIMEOUT, TimeUnit.SECONDS);

        if (!finished) {
            process.destroyForcibly();
            long executionTime = System.currentTimeMillis() - startTime;
            return CodeExecuteResponse.failure("실행 시간 초과 (10초)", executionTime);
        }

        // 스레드 종료 대기
        outputReader.join(1000);
        errorReader.join(1000);

        long executionTime = System.currentTimeMillis() - startTime;
        int exitCode = process.exitValue();

        if (exitCode == 0) {
            String result = output.toString().trim();
            return CodeExecuteResponse.success(result.isEmpty() ? "실행 완료 (출력 없음)" : result, executionTime);
        } else {
            String error = errorOutput.toString().trim();
            return CodeExecuteResponse.failure("런타임 에러 (종료 코드: " + exitCode + "):\n" + error, executionTime);
        }
    }

    private void deleteFileQuietly(File file) {
        try {
            if (file.exists()) {
                Files.delete(file.toPath());
            }
        } catch (IOException e) {
            System.err.println("파일 삭제 실패: " + file.getPath() + " - " + e.getMessage());
        }
    }
}
