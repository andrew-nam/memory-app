export function removePunctuations(str : string) : string {
    return str.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
}