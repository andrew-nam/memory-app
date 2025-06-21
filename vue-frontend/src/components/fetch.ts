export async function useFetch(url: URL, param: string) : Promise<string[] | Error> {
    var params = new URLSearchParams("count=" + param)

    try {
        console.log(url+ "?" + params)
        const response = await fetch(url + "?" + params)
        if(!response.ok) {
            throw new Error(`Response status: ` + response.status)
        }
        const data = await response.json()
        return data
    } catch(error) {
        console.error((error as Error).name)
        console.error((error as Error).message)
        return error as Error
    }
}