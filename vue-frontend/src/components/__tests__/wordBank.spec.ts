import { describe, it, expect, vi } from 'vitest';
import { WordBank, wordBankErrors } from '../wordBank';

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');

describe('populateWordBank', () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation((url: URL, param?: string) => ["one", "two", "three", "four"]);
    wordBank._fetchWords = mockFetch;

    it('calls fetch to correct endpoint', async () => {
        await wordBank.populateWordBank();
        expect(mockFetch).toHaveBeenCalledWith(SERVER, '4000');
        expect(mockFetch).toHaveBeenCalledTimes(1);
        mockFetch.mockClear();
    });

    it('returns true on success', async () => {
        expect(await wordBank.populateWordBank()).toBe(true);
        mockFetch.mockClear();
    });

    it('populates wordBank on success', async () => {
        wordBank.wordBank = [];
        await wordBank.populateWordBank();
        expect(wordBank.wordBank.length).toBeGreaterThan(0);
        mockFetch.mockClear();
    });

    it('returns false on fetch failure', async () => {
        mockFetch.mockImplementation((url: URL, param?: string) => new Error("404"));
        expect(await wordBank.populateWordBank()).toBe(false);
        mockFetch.mockClear();
    });

    it('sets wordBankErrors message ', async () => {
        await wordBank.populateWordBank();
        expect(wordBankErrors.value).toBe("Failed after maximum number of attempts, press retry to try again.");
        mockFetch.mockClear();
    });
})

describe('requestNewWords', () => {
    const wordBank = new WordBank();
    const mockPopulateWordBank = vi.fn().mockImplementation((url: URL, param?: string) => {
        wordBank.wordBank = ["one", "two", "three", "four"]; 
        return true;
    });
    wordBank.populateWordBank = mockPopulateWordBank;

    it('attempts to populate wordBank if wordBank falls below minimum length', async () => {
        wordBank.minWordBankSize = 2;
        await wordBank.requestNewWords(2);
        expect(mockPopulateWordBank).toHaveBeenCalledTimes(1);
        mockPopulateWordBank.mockClear();
    });

    it('returns an array of words as long as requested', async () => {
        expect(await wordBank.requestNewWords(2)).toStrictEqual(["three", "four"]);
    });

    it('attempts to populate wordBank after a successful request causes wordBank to fall below minimum length', async () => {
        expect(mockPopulateWordBank).toHaveBeenCalledTimes(1);
        expect(wordBank.wordBank).toStrictEqual(["one", "two", "three", "four"]);
    });

    it('returns null if there are not enough words in the wordBank and population fails', async () => {
        wordBank.wordBank = [];
        mockPopulateWordBank.mockImplementationOnce(() => false);
        expect(await wordBank.requestNewWords(4)).toBe(null);
        mockPopulateWordBank.mockClear();
    });
})