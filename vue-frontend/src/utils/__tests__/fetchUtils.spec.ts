import { it, describe, expect, vi } from 'vitest';
import { UseFetch } from '../fetchUtils';

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');

describe('UseFetch.fetchWords', () => {
    var useFetch = new UseFetch();
    const mockResponse = {
      ok: true,
      statusText: "OK",
      json: async () => ["one", "two", "three", "four", "five"],
    } as Response;
    
    const mockFetch = vi.fn().mockImplementation((url: URL) => mockResponse);
    useFetch._fetch = mockFetch;

    it('returns array of count parameter strings, if parameter included', async () => {
      expect(await useFetch.fetchWords(SERVER, "5") as string[]).toStrictEqual(["one", "two", "three", "four", "five"]);
    });

    it('returns array of default count if parameter is not included', async () => {
      expect(await useFetch.fetchWords(SERVER) as string[]).toStrictEqual(["one", "two", "three", "four", "five"]);
    });

    it('retries if the response is not ok and returns an error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      } as Response;
      const mockFetch = vi.fn().mockImplementation((url: URL) => mockResponse);
      useFetch._fetch = mockFetch;

      expect(await useFetch.fetchWords(SERVER)).toStrictEqual(Error("Response status: 404"));
      expect(mockFetch).toHaveBeenCalledTimes(6);
    });

    const spy = vi.spyOn(console, 'error');
    it('logs the error if an error is thrown', () => {
      expect(spy).toHaveBeenLastCalledWith("Response status: 404");
    });
})

describe('UseFetch.fetchToken', () => {
    const mockResponse = {
      ok: true,
      statusText: "OK",
      json: async () => "mockToken",
    } as Response;
    const mockFetch = vi.fn().mockImplementation((url: URL) => mockResponse);
    var useFetch = new UseFetch();
    useFetch._fetch = mockFetch;
    
    it('returns a token ', async () => {
      expect(await useFetch.fetchToken(SERVER) as string).toStrictEqual("mockToken");
    });
})