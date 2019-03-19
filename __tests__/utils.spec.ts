import { makeId } from '../src/utils';

test('makeId to return non null value', () => {
    expect(makeId(8)).toBeTruthy();
});