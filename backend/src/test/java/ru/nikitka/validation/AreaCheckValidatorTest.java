package ru.nikitka.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AreaCheckValidatorTest {

    @Test
    void acceptsValuesInsideRange() {
        assertTrue(AreaCheckValidator.isValidRange(0.0, 0.0, 2.0));
    }

    @Test
    void acceptsBoundaryValues() {
        assertTrue(AreaCheckValidator.isValidRange(-3.0, -3.0, 1.0));
        assertTrue(AreaCheckValidator.isValidRange(5.0, 3.0, 5.0));
    }

    @Test
    void rejectsXBelowMin() {
        assertFalse(AreaCheckValidator.isValidRange(-3.1, 0.0, 2.0));
    }

    @Test
    void rejectsXAboveMax() {
        assertFalse(AreaCheckValidator.isValidRange(5.1, 0.0, 2.0));
    }

    @Test
    void rejectsYBelowMin() {
        assertFalse(AreaCheckValidator.isValidRange(0.0, -3.1, 2.0));
    }

    @Test
    void rejectsYAboveMax() {
        assertFalse(AreaCheckValidator.isValidRange(0.0, 3.1, 2.0));
    }

    @Test
    void rejectsRBelowMin() {
        assertFalse(AreaCheckValidator.isValidRange(0.0, 0.0, 0.9));
    }

    @Test
    void rejectsRAboveMax() {
        assertFalse(AreaCheckValidator.isValidRange(0.0, 0.0, 5.1));
    }
}
