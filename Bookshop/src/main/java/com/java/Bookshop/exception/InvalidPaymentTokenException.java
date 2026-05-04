package com.java.Bookshop.exception;

public class InvalidPaymentTokenException extends RuntimeException {
    public InvalidPaymentTokenException(String message) {
        super(message);
    }
}