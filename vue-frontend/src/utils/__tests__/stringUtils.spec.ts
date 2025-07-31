import { expect, test } from 'vitest';
import { removePunctuations } from '../stringUtils';

test('removePunctuations removes all punctuations from a string', () => {
    expect(removePunctuations("$+<=>^`|~.!?'Hello World$+<=>^`|~.!?'")).toBe("Hello World");
});