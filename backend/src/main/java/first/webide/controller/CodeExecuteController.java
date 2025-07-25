package first.webide.controller;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;
import first.webide.service.CodeExecuteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Code Execution", description = "코드 실행 API")
public class CodeExecuteController {
    private final CodeExecuteService codeExecuteService;

    @PostMapping
    @Operation(summary = "코드 실행", description = "지원하는 언어의 코드를 실행하고 결과를 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "코드 실행 완료"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    public ResponseEntity<CodeExecuteResponse> execute(
            @Valid @RequestBody CodeExecuteRequest request){
        CodeExecuteResponse response = codeExecuteService.execute(request);
        return ResponseEntity.ok(response);
    }

}
