package ru.nikitka.validation;

public final class AreaCheckValidator {

    private AreaCheckValidator() {
    }

    public static boolean isValidRange(double x, double y, double r) {
        return x >= -3 && x <= 5 && y >= -3 && y <= 3 && r >= 1 && r <= 5;
    }
}
