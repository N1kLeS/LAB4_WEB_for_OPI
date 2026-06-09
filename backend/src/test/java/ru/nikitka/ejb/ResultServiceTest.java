package ru.nikitka.ejb;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResultServiceTest {

    private final ResultService resultService = new ResultService();

    @Test
    void returnsHitInsideFirstQuadrantCircle() {
        assertTrue(resultService.isHit(1.0, 1.0, 2.0));
    }

    @Test
    void returnsHitOnFirstQuadrantCircleBoundary() {
        assertTrue(resultService.isHit(2.0, 0.0, 2.0));
    }

    @Test
    void returnsMissOutsideFirstQuadrantCircle() {
        assertFalse(resultService.isHit(2.0, 1.0, 2.0));
    }

    @Test
    void returnsHitInsideFourthQuadrantRectangle() {
        assertTrue(resultService.isHit(0.5, -1.5, 2.0));
    }

    @Test
    void returnsMissOutsideFourthQuadrantRectangleWidth() {
        assertFalse(resultService.isHit(1.1, -1.0, 2.0));
    }

    @Test
    void returnsHitInsideThirdQuadrantTriangle() {
        assertTrue(resultService.isHit(-1.0, -0.4, 2.0));
    }

    @Test
    void returnsMissBelowThirdQuadrantTriangleLine() {
        assertFalse(resultService.isHit(-1.0, -1.0, 2.0));
    }

    @Test
    void returnsMissForNonPositiveRadius() {
        assertFalse(resultService.isHit(0.0, 0.0, 0.0));
        assertFalse(resultService.isHit(0.0, 0.0, -1.0));
    }
}
