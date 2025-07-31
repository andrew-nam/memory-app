import { expect, test, vi } from 'vitest';
import { WordBank, wordBankErrors } from '../wordBank';
import { useFetch } from '../../utils/fetch';

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');

test('populateWordBank calls fetch to correct endpoint', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => ["one", "two", "three", "four"]);
    wordBank._useFetch = mockFetch;
    await wordBank.populateWordBank();
    expect(mockFetch.mock.lastCall?.at(0) as URL == SERVER);
    expect(mockFetch.mock.lastCall?.at(1) as string == '4000');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(wordBank.wordBank.length).toBeGreaterThan(0);
    mockFetch.mockClear();
});

test('populateWordBank returns true on success', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => ["one", "two", "three", "four"]);
    wordBank._useFetch = mockFetch;
    expect(await wordBank.populateWordBank()).toBe(true);
    mockFetch.mockClear();
});

test('populateWordBank populates wordBank on success', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => ["one", "two", "three", "four"]);
    wordBank._useFetch = mockFetch;
    await wordBank.populateWordBank();
    expect(wordBank.wordBank.length).toBeGreaterThan(0);
    mockFetch.mockClear();
});

test('populateWordBank returns false on fetch failure', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => new Error("404"));
    wordBank._useFetch = mockFetch;
    expect(await wordBank.populateWordBank()).toBe(false);
    mockFetch.mockClear();
});

test('populateWordBank sets wordBankErrors message ', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => new Error("404"));
    wordBank._useFetch = mockFetch;
    await wordBank.populateWordBank();
    expect(wordBankErrors.value).toBe("Failed after maximum number of attempts, press retry to try again.");
    mockFetch.mockClear();
});


test('requestNewWords attempts to populate wordBank if wordBank falls below minimum length', async () => {
    const wordBank = new WordBank();
    const mockPopulateWordBank = vi.fn().mockImplementation(wordBank.populateWordBank);
    wordBank.minWordBankSize = 2;

    mockPopulateWordBank.mockImplementationOnce((url: URL, param?: string) => {
        wordBank.wordBank = ["one", "two", "three", "four"]; 
        return true;
    });

    wordBank.populateWordBank = mockPopulateWordBank;
    await wordBank.requestNewWords(2);
    expect(mockPopulateWordBank).toHaveBeenCalledTimes(1);
    mockPopulateWordBank.mockClear();
});

test('requestNewWords returns null if there are not enough words in the wordBank and population fails', async () => {
    const wordBank = new WordBank();
    const mockPopulateWordBank = vi.fn().mockImplementation(wordBank.populateWordBank);
    mockPopulateWordBank.mockImplementationOnce(() => false);

    wordBank.populateWordBank = mockPopulateWordBank;
    
    expect(await wordBank.requestNewWords(4)).toBe(null);
    mockPopulateWordBank.mockClear();
});

test('requestNewWords returns an array of words as long as requested', async () => {
    const wordBank = new WordBank();
    const mockFetch = vi.fn().mockImplementation(useFetch);

    mockFetch.mockImplementationOnce((url: URL, param?: string) => ["one", "two", "three", "four"]);

    wordBank._useFetch = mockFetch;
    expect(await wordBank.requestNewWords(4)).toStrictEqual(["one", "two", "three", "four"]);
    mockFetch.mockClear();
});