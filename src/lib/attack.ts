/**
 * The same rules as QuestKeeper's attack_roll database function, for the Behind the Build demo:
 * a natural 1 always misses, a natural 20 is a critical hit, otherwise compare the total to the AC.
 * (The real function also answers "awaiting" when the DM hasn't set an AC; the demo goblin always has one.)
 */
export type AttackResult = 'hit' | 'miss' | 'crit';

export function resolveAttack(natural: number, bonus: number, armorClass: number): AttackResult {
  if (natural === 1) return 'miss';
  if (natural === 20) return 'crit';
  return natural + bonus >= armorClass ? 'hit' : 'miss';
}

export function rollD20(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * 20);
}
