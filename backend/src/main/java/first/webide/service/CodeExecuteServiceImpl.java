package first.webide.service;

import first.webide.api.PistonApiClient;
import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.request.PistonRequest;
import first.webide.dto.response.CodeExecuteResponse;
import first.webide.dto.response.PistonResponse;
import first.webide.exception.BusinessException;
import first.webide.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static first.webide.dto.request.PistonRequest.*;


@Service
@RequiredArgsConstructor
public class CodeExecuteServiceImpl implements CodeExecuteService {

    private final PistonApiClient pistonApiClient;
    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("java", "python", "javascript", "c", "cpp");


    public CodeExecuteResponse execute(CodeExecuteRequest request) {
        if (!SUPPORTED_LANGUAGES.contains(request.getLanguage().toLowerCase())) {
            throw new BusinessException(ErrorCode.UNSUPPORTED_LANGUAGE);
        }
        long startTime = System.currentTimeMillis();

        try {
            // 파일 이름 지정
            List<FileEntry> files = getFiles(request);

            PistonRequest pistonRequest = PistonRequest.builder()
                    .language(request.getLanguage())
                    .files(files)
                    .args(request.getArgs())
                    .stdin(request.getInput())
                    .version(request.getVersion())
                    .build();

            PistonResponse response = pistonApiClient.executeCode(pistonRequest);

            // response 변환
            PistonResponse.RunResult run = response.getRun();
            long executionTime = System.currentTimeMillis() - startTime;

            if (run.getCode() != 0){
                String errMsg = run.getStderr() != null && !run.getStderr().isEmpty()
                        ? run.getStderr()
                        : "Unknown error (exit code " + run.getCode() + ")";
                return CodeExecuteResponse.failure(errMsg,  executionTime);
            }

            return CodeExecuteResponse.success(run.getStdout(),  executionTime);

        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            return CodeExecuteResponse.failure("ERROR = " + e.getMessage(),  executionTime);
        }


    }

    private List<FileEntry> getFiles(CodeExecuteRequest request) {
        String filename = request.getFilename();
        if (filename == null || filename.isBlank()) {
            filename = getDefaultFileName(request.getLanguage());
        }// (filename, request.getCode())
        FileEntry fileEntry = FileEntry.builder()
                .name(filename)
                .content(request.getCode()).build();
        List<FileEntry> files = Collections.singletonList(fileEntry);
        return files;
    }


    // 스트링보단 이넘타입으로 관리
    private String getDefaultFileName(String language) {
        return switch (language.toLowerCase()) {
            case "java" -> "Main.java";
            case "python" -> "main.py";
            case "c" -> "main.c";
            case "cpp" -> "main.cpp";
            case "javascript" -> "main.js";
            // 필요 시 추가 확장자 매핑
            default -> "Main.txt";
        };
    }
}



