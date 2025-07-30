package first.webide.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "Invalid Input Value"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "C002", "Method Not Allowed"),
    ENTITY_NOT_FOUND(HttpStatus.BAD_REQUEST, "C003", "Entity Not Found"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "C004", "Server Error"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "C005", "Invalid Type Value"),
    HANDLE_ACCESS_DENIED(HttpStatus.FORBIDDEN, "C006", "Access is Denied"),

    // File
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "F001", "File Not Found"),
    FILE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "F002", "File Already Exists"),

    // Member
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "M001", "Member not found"),
    LOGIN_ID_DUPLICATED(HttpStatus.CONFLICT, "M002", "Login Id is duplicated"),
    USERNAME_DUPLICATED(HttpStatus.CONFLICT, "M003", "Username is duplicated"),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "M004", "Password is not valid"),

    // Language
    UNSUPPORTED_LANGUAGE(HttpStatus.BAD_REQUEST, "L001", "Unsupported Language"),
    ;

    private final HttpStatus status; // 상태코드
    private final String code; // 에러 분류 코드
    private final String message; // 예외 설명
}
