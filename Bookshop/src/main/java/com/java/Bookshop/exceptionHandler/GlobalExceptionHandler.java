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
}
