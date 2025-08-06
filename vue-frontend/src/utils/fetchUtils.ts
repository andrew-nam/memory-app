const RETRY_LIMIT = 5;

export class UseFetch {
    _fetch = window.fetch.bind(window);
    retries = 0;

    fetchWords = async (url: URL, param?: string) : Promise<any | Error> => {
        if (param != undefined) 
        {
            url = new URL(url.toString() + "?count=" + param);
        }
        return await this.useFetch(url);
    }

    fetchToken = async (url: URL) : Promise<any | Error> => {
        return await this.useFetch(url);
    }

    private useFetch = async (url: URL) : Promise<any | Error> =>{
        try {
            var response = await this._fetch(url);

            console.log(`response is ${ response.json }`);
            if(!response.ok) {
                if (this.retries < RETRY_LIMIT) {
                    this.retries++;
                    return await this.useFetch(url);
                } else {
                    throw new Error(`Response status: ` + response.status);
                }
            }
            const data = await response.json();
            console.log(`data is ${ data }`);
            this.retries = 0;
            return data;
        } catch(error) {
            console.error((error as Error).message);
            this.retries = 0;
            return error as Error;
        }
    }
}
