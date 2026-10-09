import { d20Message, filterJump, isRollCommand, jumpItems } from '../lib/jumpIndex';

describe('Jump to index', () => {
  it('lists only pages and sections that render (no Lab, no omitted QuestKeeper sections)', () => {
    const labels = jumpItems().map((i) => i.label);
    expect(labels).not.toContain('Lab');
    expect(labels.some((l) => l.includes('What I learned'))).toBe(false);
    expect(labels).toContain('About › Experience');
  });

  it('filters by text', () => {
    expect(filterJump(jumpItems(), 'nugget').map((i) => i.href)).toEqual(['/work/nugget-hackathon']);
  });

  it('recognizes roll d20 and uses the approved lines', () => {
    expect(isRollCommand('roll d20')).toBe(true);
    expect(isRollCommand('roll')).toBe(false);
    expect(d20Message(20)).toBe('Natural 20. Okay, show-off.');
    expect(d20Message(1)).toBe('Natural 1. Happens to the best of us. Mostly me.');
    expect(d20Message(7)).toBe('You rolled a 7.');
  });
});
