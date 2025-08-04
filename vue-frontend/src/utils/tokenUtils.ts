import { UseFetch } from "./fetchUtils";

const TOKEN_API = new URL('http://127.0.0.1:8000/api/speech-token/')

export class TokenUtil {
    _fetchToken= new UseFetch().fetchToken;

    async getTokenOrRefresh() {
        const cookie = document.cookie;
        const speechToken = cookie
            .split("; ")
            .find((row) => row.startsWith("speech-token="))
            ?.split("=")[1];

        if (speechToken === undefined) {
            try {
                const res = await this._fetchToken(TOKEN_API);
                const token = res.token;
                const region = res.region;
                document.cookie = `speech-token=${region}:${token}; max-age=540; path=/`

                return { authToken: token, region: region };
            } catch (err) {
                console.error((err as Error).message);
                return { authToken: null, error: (err as Error).message };
            }
        } else {
            const idx = speechToken.indexOf(':');
            return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
        }
    }
}

