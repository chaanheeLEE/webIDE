package first.webide.service.executor;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;
import lombok.extern.slf4j.Slf4j;
import org.graalvm.polyglot.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.concurrent.*;

@Service
@Slf4j
public class GraalVMExecuteService {

    private final ExecutorService executorService = Executors.newCachedThreadPool();

    public CodeExecuteResponse execute(CodeExecuteRequest request) {
        String langId = mapLanguage(request.getLanguage());
        long start = System.currentTimeMillis();

        // Future를 사용한 시간 제한 구현
        Future<CodeExecuteResponse> future = executorService.submit(() -> executeCode(langId, request.getCode()));

        try {
            // 15초 타임아웃 설정
            return future.get(15, TimeUnit.SECONDS);

        } catch (TimeoutException e) {
            future.cancel(true);
            long elapsed = System.currentTimeMillis() - start;
            return CodeExecuteResponse.failure("실행 시간 초과 (15초)", elapsed);

        } catch (ExecutionException e) {
            long elapsed = System.currentTimeMillis() - start;
            Throwable cause = e.getCause();
            return CodeExecuteResponse.failure(cause.getMessage(), elapsed);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            long elapsed = System.currentTimeMillis() - start;
            return CodeExecuteResponse.failure("실행이 중단되었습니다", elapsed);
        }
    }

    private CodeExecuteResponse executeCode(String langId, String code) {
        long start = System.currentTimeMillis();

        ByteArrayOutputStream stdout = new ByteArrayOutputStream();
        ByteArrayOutputStream stderr = new ByteArrayOutputStream();

        try (Context context = createContext(langId, stdout, stderr)) {
            Value result = context.eval(langId, code);
            return buildResponse(start, stdout, stderr, result, langId);

        } catch (PolyglotException pe) {
            log.error("코드 실행 중 예외", pe);
            return CodeExecuteResponse.failure(pe.getMessage(), System.currentTimeMillis() - start);
        } catch (Exception e) {
            log.error("알 수 없는 에러", e);
            return CodeExecuteResponse.failure(e.getMessage(), System.currentTimeMillis() - start);
        }
    }

    private Context createContext(String langId, ByteArrayOutputStream stdout, ByteArrayOutputStream stderr) {
        Context.Builder builder = Context.newBuilder(langId)
                .allowAllAccess(false)
                .out(new PrintStream(stdout))
                .err(new PrintStream(stderr))
                .option("engine.WarnInterpreterOnly", "false");

        // Python 전용 설정
        if ("python".equals(langId)) {
            builder.option("python.ForceImportSite", "false");  // 불필요한 site 모듈 import 방지
        }

        // JavaScript 전용 설정
        if ("js".equals(langId)) {
            builder.option("js.console", "true");
        }


        try {
            builder.resourceLimits(ResourceLimits.newBuilder()
                    .statementLimit(50_000, null)  // 5만개 구문으로 제한
                    .build());
        } catch (Exception e) {
            // ResourceLimits가 지원되지 않는 경우 무시
            log.warn("ResourceLimits 설정을 건너뜁니다: {}", e.getMessage());
        }

        return builder.build();
    }

    private CodeExecuteResponse buildResponse(long start, ByteArrayOutputStream stdout,
                                              ByteArrayOutputStream stderr, Value result, String langId) {
        long elapsed = System.currentTimeMillis() - start;
        String stdoutStr = stdout.toString();
        String stderrStr = stderr.toString();

        if (!stderrStr.isEmpty()) {
            return CodeExecuteResponse.failure(stderrStr, elapsed);
        }

        String output = buildOutput(stdoutStr, result);
        String finalOutput = output.isEmpty() ? getLanguageNullValue(langId) : output;

        return CodeExecuteResponse.success(finalOutput, elapsed);
    }

    private String buildOutput(String stdout, Value result) {
        StringBuilder output = new StringBuilder();

        if (!stdout.isEmpty()) {
            output.append(stdout);
        }

        if (isValidResult(result)) {
            if (output.length() > 0) {
                output.append(System.lineSeparator());
            }
            output.append(result.toString());
        }

        return output.toString();
    }

    private boolean isValidResult(Value result) {
        if (result == null || result.isNull()) {
            return false;
        }

        String resultStr = result.toString().trim();

        // 언어별 무의미한 출력 필터링
        return !resultStr.equals("undefined")          // JavaScript
                && !resultStr.equals("None")           // Python None
                && !resultStr.matches("<module.*>")    // Python 모듈 객체
                && !resultStr.matches("<.*object.*>")  // 기타 객체 표현
                && !resultStr.isEmpty();
    }

    private String mapLanguage(String language) {
        return switch (language.toLowerCase()) {
            case "javascript", "js" -> "js";
            case "python" -> "python";
            default -> throw new UnsupportedLanguageException("지원하지 않는 언어: " + language);
        };
    }

    private String getLanguageNullValue(String langId) {
        return switch (langId) {
            case "js" -> "undefined";
            case "python" -> "None";
            default -> "";
        };
    }

    public static class UnsupportedLanguageException extends RuntimeException {
        public UnsupportedLanguageException(String msg) {
            super(msg);
        }
    }
}
