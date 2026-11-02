import { act, fireEvent, render, screen } from '@testing-library/react';
import { cheatCodeTracker } from '../lib/eggs';
import { CheatCode } from '../components/CheatCode';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

describe('cheat code', () => {
  it('fires on the full sequence, even after stray keys', () => {
    const track = cheatCodeTracker();
    ['x', 'ArrowUp'].forEach((k) => expect(track(k)).toBe(false));
    const results = CODE.map((k) => track(k));
    expect(results.slice(0, -1).every((r) => r === false)).toBe(true);
    expect(results.at(-1)).toBe(true);
    expect(track('B')).toBe(false);
  });

  it('shows the message, but not while typing in a field', () => {
    render(
      <>
        <input aria-label="field" />
        <CheatCode />
      </>,
    );
    const field = screen.getByLabelText('field');
    CODE.forEach((key) => fireEvent.keyDown(field, { key }));
    expect(screen.queryByText(/extra life granted/)).toBeNull();
    act(() => CODE.forEach((key) => fireEvent.keyDown(window, { key })));
    expect(screen.getByText(/extra life granted/)).toBeInTheDocument();
  });
});
