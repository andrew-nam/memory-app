import { useFetch } from "./fetch";

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');
const MIN_WORDBANK_SIZE = 30;

var retries = 0;
var retryTotal = 5;

export class WordBank {
    wordBank : string[] = [];
    
    async init() : Promise<boolean> {
        return this.populateWordBank();
    }

    private async populateWordBank() : Promise<boolean>{
        try {
            const result = await useFetch(SERVER, '4000');
            this.wordBank = result as string[];
            retries = 0;
            return true;
        } catch (e) {
            console.error((e as Error).message);
            if (retries < retryTotal) {
                retries++;
                return this.populateWordBank();
            } else {
                console.error("Failed " + retries + " times, quitting");
                return false;
            }
        }
    }

    async getNewWords(wordCount : number) {
        console.log(this.wordBank.length);
        if(this.wordBank.length < wordCount) {
            await this.populateWordBank();
        }
        const temp = this.wordBank.slice(0, wordCount);
        this.wordBank = this.wordBank.splice(wordCount);
        temp.map((str) => str.replace(/[\p{P}$+<=>^`|~]/gu, ''));
        console.log(temp);

        if(this.wordBank.length < MIN_WORDBANK_SIZE) {
            this.populateWordBank();
        }
        return temp;
    }
}
