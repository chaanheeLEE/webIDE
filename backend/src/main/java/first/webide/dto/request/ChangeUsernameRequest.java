package first.webide.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChangeUsernameRequest {

    @NotBlank(message = "입력 값은 필수입니다.")
    @Size(min = 3, max = 15, message = "3 - 15자 이내여야 합니다. ")
    private String newUsername;
}