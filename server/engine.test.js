import { test, expect, describe } from 'vitest';
import { reconcileEvents } from './engine.js';

describe('Deterministic State Reconciler', () => {

  test('1. Idempotency: Ignores exact duplicate events', () => {
    const events = [
      { source: "figma", componentId: "btn-1", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { color: "blue" } },
      { source: "figma", componentId: "btn-1", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { color: "blue" } } // Duplicate
    ];
    const { auditLog } = reconcileEvents(events);
    // Should only have 1 entry in the audit log because the duplicate is filtered out
    expect(auditLog.length).toBe(1);
  });

  test('2. Layout Merge: Resolves layout conflicts to flex-start', () => {
    const events = [
      { source: "figma", componentId: "btn-2", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { layout: "flex-start" } },
      { source: "kamdhenu", componentId: "btn-2", timestamp: "2026-08-15T10:01:00Z", action: "update", data: { layout: "center" } }
    ];
    const { reconciledState } = reconcileEvents(events);
    // PRD Rule: flex-start + center = flex-start
    expect(reconciledState[0].state.layout).toBe('flex-start');
  });

  test('3. SOLACE Priority: SOLACE animations override all others', () => {
    const events = [
      { source: "solace", componentId: "btn-3", timestamp: "2026-08-15T10:00:00Z", action: "update", data: { animation: "spring" } },
      { source: "kamdhenu", componentId: "btn-3", timestamp: "2026-08-15T10:05:00Z", action: "update", data: { animation: "fade" } }
    ];
    const { reconciledState, auditLog } = reconcileEvents(events);
    // Kamdhenu came later, but SOLACE should still win
    expect(reconciledState[0].state.animation).toBe('spring');
    // Ensure the engine flagged the conflict
    expect(auditLog[1].conflictDetected).toBe(true);
  });

  test('4. Time-travel / Late Arrival: Handles out-of-order timestamps correctly', () => {
    const events = [
      { source: "figma", componentId: "btn-4", timestamp: "2026-08-15T10:05:00Z", action: "update", data: { color: "red" } },
      // This event arrives second, but happened earlier in time!
      { source: "kamdhenu", componentId: "btn-4", timestamp: "2026-08-15T10:00:00Z", action: "create", data: { color: "blue" } }
    ];
    const { reconciledState } = reconcileEvents(events);
    // Because Figma's timestamp is later (10:05), it should be the final color
    expect(reconciledState[0].state.color).toBe('red');
  });

});