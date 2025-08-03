package first.webide.service;

import first.webide.api.PistonApiClient;
import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;
import first.webide.dto.response.PistonResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class) // Mockito 확장 기능을 사용하도록 설정
class CodeExecuteServiceTest {

    @InjectMocks // @Mock으로 생성된 가짜 객체들을 이 클래스의 필드에 주입합니다.
    private CodeExecuteServiceImpl codeExecuteService;

    @Mock // 스프링 컨텍스트와 무관한 순수한 Mockito 가짜 객체를 생성합니다.
    private PistonApiClient pistonApiClient;

    @Test
    @DisplayName("코드 실행 성공 케이스")
    void executeCode_Success() {
        // Given
        // Mock Piston API 클라이언트 설정 (성공 응답)
        String expectedOutput = "Hello, World!";
        PistonResponse.RunResult runResult = new PistonResponse.RunResult(expectedOutput, "", 0, null, expectedOutput);
        PistonResponse pistonResponse = new PistonResponse("python", "3.10.0", runResult);

        when(pistonApiClient.executeCode(any())).thenReturn(pistonResponse);

        // 실행할 코드 요청 생성
        CodeExecuteRequest request = new CodeExecuteRequest("python", "print('Hello, World!')", "3.10.0", null, null, null);

        // When
        CodeExecuteResponse response = codeExecuteService.execute(request);

        // Then
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getOutput()).isEqualTo(expectedOutput);
        assertThat(response.getError()).isNull();
        assertThat(response.getExecutionTime()).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("코드 실행 실패 케이스 (컴파일 에러 등)")
    void executeCode_Failure_WithError() {
        // Given
        // Mock Piston API 클라이언트 설정 (실패 응답)
        String expectedError = "SyntaxError: invalid syntax";
        PistonResponse.RunResult runResult = new PistonResponse.RunResult("", expectedError, 1, null, expectedError);
        PistonResponse pistonResponse = new PistonResponse("python", "3.10.0", runResult);

        when(pistonApiClient.executeCode(any())).thenReturn(pistonResponse);

        // 실행할 코드 요청 생성 (문법 오류가 있는 코드)
        CodeExecuteRequest request = new CodeExecuteRequest("python", "print 'Hello, World!'", "3.10.0", null, null, null);

        // When
        CodeExecuteResponse response = codeExecuteService.execute(request);

        // Then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getOutput()).isNull();
        assertThat(response.getError()).isEqualTo(expectedError);
        assertThat(response.getExecutionTime()).isGreaterThanOrEqualTo(0);
    }

    @Test
    @DisplayName("API 클라이언트 호출 중 예외 발생 케이스")
    void executeCode_Failure_ApiClientException() {
        // Given
        // Mock Piston API 클라이언트 설정 (예외 발생)
        String exceptionMessage = "API server is down";
        when(pistonApiClient.executeCode(any())).thenThrow(new RuntimeException(exceptionMessage));

        // 실행할 코드 요청 생성
        CodeExecuteRequest request = new CodeExecuteRequest("java", "System.out.println(\"test\");", "11.0.0", null, null, null);

        // When
        CodeExecuteResponse response = codeExecuteService.execute(request);

        // Then
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getOutput()).isNull();
        assertThat(response.getError()).contains(exceptionMessage);
        assertThat(response.getExecutionTime()).isGreaterThanOrEqualTo(0);
    }
}
