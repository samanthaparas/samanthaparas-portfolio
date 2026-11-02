import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { resolveAttack } from '../lib/attack';
import { AttackDemo } from '../components/AttackDemo';

describe('attack rules (same as QuestKeeper attack_roll)', () => {
  it('natural 1 misses, natural 20 crits, otherwise total vs AC', () => {
    expect(resolveAttack(1, 50, 10)).toBe('miss');
    expect(resolveAttack(20, -10, 30)).toBe('crit');
    expect(resolveAttack(10, 5, 15)).toBe('hit');
    expect(resolveAttack(9, 5, 15)).toBe('miss');
  });
});

describe('AttackDemo', () => {
  // A random() that lands the d20 on a chosen face.
  const face = (n: number) => () => (n - 1) / 20 + 0.001;
  beforeEach(() => {
    window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia;
  });

  it('shows the roll, the request and the one-word reply, never the AC', async () => {
    render(<AttackDemo random={face(14)} />);
    await userEvent.click(screen.getByRole('button', { name: /Roll d20/ }));
    expect(screen.getByText('You rolled 14 + 5 = 19.')).toBeInTheDocument();
    expect(screen.getByText('Hit!')).toBeInTheDocument();
    expect(screen.getByText('rpc("attack_roll", { p_natural: 14, p_bonus: 5, … })')).toBeInTheDocument();
    expect(screen.getByText('"hit"')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/AC:? ?15/);
  });

  it('uses the natural 1 line', async () => {
    render(<AttackDemo random={face(1)} />);
    await userEvent.click(screen.getByRole('button', { name: /Roll d20/ }));
    expect(screen.getByText('Natural 1. Always a miss. Happens to the best of us.')).toBeInTheDocument();
    expect(screen.getByText('"miss"')).toBeInTheDocument();
  });
});
