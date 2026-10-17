import { START_OVER_AFTER_MS, shouldStartOver } from './session';

describe('shouldStartOver', () => {
  const leftAt = 1_000_000;

  it('keeps the payment in progress after a short break', () => {
    expect(shouldStartOver(leftAt, leftAt + 30_000)).toBe(false);
    expect(shouldStartOver(leftAt, leftAt + START_OVER_AFTER_MS - 1)).toBe(false);
  });

  it('starts over after ten minutes or more away', () => {
    expect(shouldStartOver(leftAt, leftAt + START_OVER_AFTER_MS)).toBe(true);
    expect(shouldStartOver(leftAt, leftAt + 3 * START_OVER_AFTER_MS)).toBe(true);
  });
});
