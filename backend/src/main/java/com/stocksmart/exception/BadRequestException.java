package com.stocksmart.exception;
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) { super(message); }
}
