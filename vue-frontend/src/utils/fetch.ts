export async function useFetch(url: URL, param?: string) : Promise<any | Error> {
    try {
        var response;
        if(param != undefined)
        {
            var params = new URLSearchParams("count=" + param);
            console.log(url+ "?" + params);
            response = await fetch(url + "?" + params);
        } else {
            response = await fetch(url);
        }
        if(!response.ok) {
            throw new Error(`Response status: ` + response.status);
        }
        const data = await response.json();
        return data;
    } catch(error) {
        console.error((error as Error).name);
        console.error((error as Error).message);
        return error as Error;
    }
}