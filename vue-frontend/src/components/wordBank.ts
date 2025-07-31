import { ref } from 'vue';
import { useFetch } from "../utils/fetch";
import { removePunctuations } from "../utils/stringUtils";

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');
const MIN_WORDBANK_SIZE = 10;

export const wordBankErrors = ref("");

export class WordBank {

    _useFetch = useFetch;
    server = SERVER;
    minWordBankSize = MIN_WORDBANK_SIZE;
    wordBank : string[] = [];
    
    async populateWordBank() : Promise<boolean> {
        const result = await this._useFetch(this.server, '4000');
        if(result instanceof Error) {
            console.error("Failed after maximum number of retry attempts, quitting");
            wordBankErrors.value = `Failed after maximum number of attempts, press retry to try again.`;
            return false;
        } else {
            this.wordBank = result as string[];
            return true;
        }
    }

    async requestNewWords(wordCount : number) {
        console.log(`length is ${this.wordBank.length}, wordcount is ${wordCount}`);
        var temp = await this.populateWordBank();
        console.log(`result is ${temp}`);
        if(this.wordBank.length < wordCount && !(await this.populateWordBank())) {
            console.log("Returning null");
            return null;
        }
        var result = this.getNewWords(wordCount);
        if(this.wordBank.length < this.minWordBankSize) {
            this.populateWordBank();
        }
        return result;
    }

    private async getNewWords(wordCount : number) {
        const selectedWords = this.wordBank.slice(0, wordCount);
        this.wordBank = this.wordBank.splice(wordCount);
        selectedWords.map((str) => removePunctuations(str));

        return selectedWords;
    }
}
