package com.java.Bookshop.exception;

public class NotEnoughProductQuantityException extends RuntimeException {
    public NotEnoughProductQuantityException(String message) {
        super(message);
    }
}
