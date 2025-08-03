package first.webide.exception;

import lombok.*;
import org.springframework.validation.BindingResult;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ErrorResponse {

    private int status;
    private String code;
    private String message;
    @Builder.Default
    private List<FieldError> errors = new ArrayList<>();

    public static ErrorResponse of(final ErrorCode code, final BindingResult bindingResult) {
        return ErrorResponse.builder()
                .status(code.getStatus().value())
                .code(code.getCode())
                .message(code.getMessage())
                .errors(FieldError.of(bindingResult))
                .build();
    }

    public static ErrorResponse of(final ErrorCode code) {
        return ErrorResponse.builder()
                .status(code.getStatus().value())
                .code(code.getCode())
                .message(code.getMessage())
                .build();
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class FieldError {
        private String field;
        private String value;
        private String reason;

        @Builder
        private FieldError(String field, String value, String reason) {
            this.field = field;
            this.value = value;
            this.reason = reason;
        }

        private static List<FieldError> of(final BindingResult bindingResult) {
            final List<org.springframework.validation.FieldError> fieldErrors = bindingResult.getFieldErrors();
            return fieldErrors.stream()
                    .map(error -> new FieldError(
                            error.getField(),
                            error.getRejectedValue() == null ? "" : error.getRejectedValue().toString(),
                            error.getDefaultMessage()))
                    .collect(Collectors.toList());
        }
    }
}
