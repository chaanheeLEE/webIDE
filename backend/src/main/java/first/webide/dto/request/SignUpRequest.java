package first.webide.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignUpRequest {
    @NotBlank(message = "로그인 아이디를 입력해주세요.")
    @Size(min = 4, max = 15, message = "로그인 아이디는 4자 이상 15자 이하로 입력해주세요.")
    private String loginId;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Size(min = 8, max = 20, message = "비밀번호는 8자 이상 20자 이하로 입력해주세요.")
    private String password;

    @NotBlank(message = "사용자 이름을 입력해주세요.")
    @Size(min = 2, max = 15, message = "사용자 이름은 2자 이상 15자 이하로 입력해주세요.")
    private String username;
}
