package first.webide.api;

import first.webide.dto.request.CodeExecuteRequest;
import first.webide.dto.request.PistonRequest;
import first.webide.dto.response.PistonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PistonApiClient {

    private final RestTemplate restTemplate;
    private static final String API_URL = "https://emkc.org/api/v2/piston/execute";

    public PistonResponse executeCode(PistonRequest request) {
        return restTemplate.postForObject(
                API_URL, request, PistonResponse.class);
    }
}
