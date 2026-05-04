package com.java.Bookshop.exceptionHandler;

import com.java.Bookshop.DTO.ApiErrorResponse;
import com.java.Bookshop.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //Handling user exists
    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(value = UserAlreadyExistsException.class)
    public ApiErrorResponse handleUserAlreadyExistsException(UserAlreadyExistsException exception) {
        ApiErrorResponse response = new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now());

        return response;
    }

    //Handling validation
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ApiErrorResponse handleValidationException(MethodArgumentNotValidException exception) {
        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Error in validation");

        ApiErrorResponse response = new ApiErrorResponse(errorMessage, HttpStatus.BAD_REQUEST.value(), LocalDateTime.now());
        return response;
    }

    //Handling Product exists
    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(value = ProductAlreadyExistsException.class)
    public ApiErrorResponse handleProductAlreadyExistsException(
            ProductAlreadyExistsException exception) {
        ApiErrorResponse response = new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now());

        return response;
    }

    //Handling Not enough product quantity
    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(value = NotEnoughProductQuantityException.class)
    public ApiErrorResponse handleNotEnoughProductQuantityException(
            NotEnoughProductQuantityException exception) {
        ApiErrorResponse response = new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );
                return response;
    }

    //Handling Order not found
    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(value = OrderNotFoundException.class)
    public ApiErrorResponse handleOrderNotFoundException(OrderNotFoundException exception) {
        ApiErrorResponse response = new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );
        return response;
    }

    @ResponseStatus(value = HttpStatus.CONFLICT)
    @ExceptionHandler(value = ProductNotFoundException.class)
    public ApiErrorResponse handleProductNotFoundException(ProductNotFoundException exception) {
        ApiErrorResponse response = new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.CONFLICT.value(),
                LocalDateTime.now()
        );
        return response;
    }

    //Handling Category not found
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    @ExceptionHandler(value = CategoryNotFoundException.class)
    public ApiErrorResponse handleCategoryNotFoundException(CategoryNotFoundException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                LocalDateTime.now()
        );
    }

    //Handling Empty File
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = EmptyFileException.class)
    public ApiErrorResponse handleEmptyFileException(EmptyFileException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );
    }

    //Handling File Upload Error
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(value = FileUploadException.class)
    public ApiErrorResponse handleFileUploadException(FileUploadException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                LocalDateTime.now()
        );
    }

    //Handling User Not Found
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    @ExceptionHandler(value = UserNotFoundException.class)
    public ApiErrorResponse handleUserNotFoundException(UserNotFoundException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                LocalDateTime.now()
        );
    }

    //Handling Invalid Payment Token
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = InvalidPaymentTokenException.class)
    public ApiErrorResponse handleInvalidPaymentTokenException(InvalidPaymentTokenException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );
    }

    //Handling Invalid Order Status (e.g. already paid or shipped)
    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ExceptionHandler(value = InvalidOrderStatusException.class)
    public ApiErrorResponse handleInvalidOrderStatusException(InvalidOrderStatusException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                LocalDateTime.now()
        );
    }

    //Handling Unauthorized access to an order
    @ResponseStatus(value = HttpStatus.FORBIDDEN)
    @ExceptionHandler(value = UnauthorizedOrderAccessException.class)
    public ApiErrorResponse handleUnauthorizedOrderAccessException(UnauthorizedOrderAccessException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.FORBIDDEN.value(),
                LocalDateTime.now()
        );
    }

    //Handling Review Not Found
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    @ExceptionHandler(value = ReviewNotFoundException.class)
    public ApiErrorResponse handleReviewNotFoundException(ReviewNotFoundException exception) {
        return new ApiErrorResponse(
                exception.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                LocalDateTime.now()
        );
    }
}
