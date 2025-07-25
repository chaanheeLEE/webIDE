package first.webide.service;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;
import first.webide.service.executor.GraalVMExecuteService;
import first.webide.service.executor.JavaExecuteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CodeExecuteServiceImpl implements CodeExecuteService {

    private final GraalVMExecuteService graalVMService;
    private final JavaExecuteService javaService;

    public CodeExecuteResponse execute(CodeExecuteRequest request) {
        String language = request.getLanguage().toLowerCase();

        return switch (language) {
            case "java" -> javaService.execute(request);
            case "javascript", "python", "ruby", "r" ->
                    graalVMService.execute(request);                    // GraalVM
            default -> CodeExecuteResponse.failure("지원하지 않는 언어", 0);
        };
    }

}
