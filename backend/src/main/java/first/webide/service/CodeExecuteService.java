package first.webide.service;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.response.CodeExecuteResponse;

public interface CodeExecuteService {
    CodeExecuteResponse execute(CodeExecuteRequest request);
}
