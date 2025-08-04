import { it, describe, expect, vi } from 'vitest';
import { TokenUtil } from '../tokenUtils';

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');

describe('TokenUtil.getTokenOrRefresh', () => {
    var tokenUtil = new TokenUtil();
    const mockToken = {token: "mockToken", region: "mockRegion"};
    const mockFetch = vi.fn().mockImplementationOnce((url: URL) => mockToken)
                                .mockImplementationOnce(vi.fn().mockRejectedValueOnce(new Error("Response status: 404")));

    tokenUtil._fetchToken = mockFetch;

    it('attempts to refresh token if it not available in the cookie', async () => {
      expect(await tokenUtil.getTokenOrRefresh()).toStrictEqual({authToken: "mockToken", region: "mockRegion"});
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    
    it('returns token from cookie if it is available', async () => {
      expect(await tokenUtil.getTokenOrRefresh()).toStrictEqual({authToken: "mockToken", region: "mockRegion"});
      expect(mockFetch).toHaveBeenCalledTimes(1); // mocked fetch API still only called once from previous call
    });

    it('stores the refreshed token in the cookie', async () => {
        var cookie = document.cookie;
        const speechToken = cookie
            .split("; ")
            .find((row) => row.startsWith("speech-token="))
            ?.split("=")[1];
        
        expect(speechToken).toStrictEqual("mockRegion:mockToken");
    });

    const spy = vi.spyOn(console, 'error');
    it('returns a null authToken and an error if an error is caught', async () => {
        // Clear the cookie from the previous test
        document.cookie.split(';').forEach(function(c) {
            document.cookie = c.trim().split('=')[0] + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        });
        expect(await tokenUtil.getTokenOrRefresh()).toStrictEqual({authToken: null, error: "Response status: 404"});
    });

    it('logs the error if an error is caught', async () => {
       expect(spy).toHaveBeenLastCalledWith("Response status: 404");
    });
})

vi.clearAllMocks();