import attrLockExtension from './attrLockExt';

it('keeps copied attribute locks isolated per extension', () => {
  const locks = attrLockExtension();
  const otherLocks = attrLockExtension();
  const value = { nested: [1] };

  locks.set('all', 'smp', 'location', 1);
  locks.set(104, 'occ', 'comment', value);
  value.nested.push(2);

  expect(locks.getAll(104)).toEqual({
    smp: { location: 1 },
    occ: { comment: { nested: [1] } },
  });
  expect(locks.get(104, 'occ', 'comment')).toEqual({ nested: [1] });
  expect(locks.isLocked(104, 'occ', 'comment', { nested: [1] })).toBe(true);
  expect(otherLocks.get(104, 'occ', 'comment')).toBeUndefined();

  locks.unset(104, 'occ', 'comment');

  expect(locks.isLocked(104, 'occ', 'comment')).toBe(false);
});
