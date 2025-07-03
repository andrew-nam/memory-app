<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
import type { Ref } from 'vue'
import WordContainer from './WordContainer.vue'
import { useFetch } from './fetch';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk'
import { getTokenOrRefresh } from './token_util';

const props = defineProps<{
    wordCount: number
}>()

const wordContainerList = ref(Array(props.wordCount).fill("")) // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""))
const currentWords: Ref<string[]> = ref([])
const wordBank : Ref<string[]> = ref([])
const isGuessesFinished = ref(currentWords.value.length == props.wordCount)
const SERVER = new URL('http://127.0.0.1:8000/api/random-words/')
var retries = 0
const retryTotal = 5
const synth = window.speechSynthesis
const displayText = ref('')
const player = ref()

onBeforeMount(() => {
    populateWordBank()
})

onMounted(() => {
})

async function sttFromMic(): Promise<string | Error> {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    var text = ''
    recognizer.recognizeOnceAsync(result => {
        if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            text = result.text
            displayText.value = `RECOGNIZED: Text=${result.text}`;
        } else {
            displayText.value = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            return Error(displayText.value)
        }
    });
    return text
}

async function textToSpeech(textToSpeak:string) {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        const myPlayer = new speechsdk.SpeakerAudioDestination();
        player.value = myPlayer;
        const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.value);

        let synthesizer: speechsdk.SpeechSynthesizer | undefined = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

        displayText.value = `speaking text: ${textToSpeak}...`;
        synthesizer.speakTextAsync(
        textToSpeak,
        result => {
            let text;
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                text = `synthesis finished for "${textToSpeak}".\n`
            } else if (result.reason === speechsdk.ResultReason.Canceled) {
                text = `synthesis failed. Error detail: ${result.errorDetails}.\n`
            }
            (synthesizer as speechsdk.SpeechSynthesizer).close();
            synthesizer = undefined;
            displayText.value = text as string;
        },
        function (err) {
            displayText.value = `Error: ${err}.\n`;

            (synthesizer as speechsdk.SpeechSynthesizer).close();
            synthesizer = undefined;
        });
    }

async function populateWordBank() {
    try {
        const result = await useFetch(SERVER, '4000')
        wordBank.value = result as string[]
        console.log(wordBank.value)
        console.log(wordBank.value.length)
        retries = 0;
        (document.getElementById("begin-button") as HTMLElement).style.visibility = "visible";
    } catch (e) {
        console.error((e as Error).message)
        if (retries < retryTotal) {
            retries += 1
            populateWordBank()
        } else {
            console.error("Failed " + retries + " times, quitting")
        }
    }
}

function getNewWords() {
    // async operation to get new words from server
    // populate wordcontainerlist with words
    console.log(props.wordCount)
    // wordContainerList = slice of wordBank, wordBank size reduces
    const temp = wordBank.value.slice(0, props.wordCount)
    wordBank.value = wordBank.value.splice(props.wordCount)
    return temp
}

function playAgain() {
    generateAudio()
}

function reset() {
    wordGuesses.value = Array(props.wordCount).fill("")
}

function populateWords() {
    wordContainerList.value = getNewWords()
    console.log(wordBank.value.length)
    if(wordBank.value.length < props.wordCount * 3) {
        populateWordBank()
    }

}

function onWordInterpretted(words:string[]) {
    for (let i = 0; currentWords.value.length < props.wordCount && i < words.length; i++) {
        currentWords.value.push(words[i])
    }
    for(let i = 0; i < currentWords.value.length; i++) {
        wordGuesses.value[i] = currentWords.value[i]
    }
}

async function sayWord() {
    // call an event? Since speech to text will need to be some async outside call, will
    // need an event for when the answer is returned
    var words: string | Error = await sttFromMic();
    if (words instanceof Error) {
        console.log(words.message);
    } else {
        var wordsArray = words.split(" ");
        wordsArray = wordsArray.splice(props.wordCount);
        onWordInterpretted(wordsArray);
    }
    console.log(currentWords.value.length)
    console.log(props.wordCount)
    console.log(currentWords.value.length == props.wordCount)
}

function skip() {
    reset()
    populateWords()
    generateAudio()
}

function begin() {
    populateWords();
    var beginButton = document.getElementById("begin-button");
    (beginButton as HTMLElement).style.display="none";
    var gameArea = document.getElementsByClassName("gameArea");
    (gameArea.item(0) as HTMLElement).style.visibility="visible";
    
    generateAudio()
}

function generateAudio() {
    console.log("Generating audio")
    var textToSpeak = wordContainerList.value.join(" ")
    console.log(textToSpeak)
    textToSpeech(textToSpeak)
}

</script>

<template>
    <button @click="begin" id="begin-button" visibility="hidden">Begin</button>
    <div class="gameArea">
        {{displayText}}
        <div class="wordsContainer">
            <WordContainer 
                v-for="(word, index) in wordContainerList"
                :isComplete="isGuessesFinished"
                :word="word"
                :wordGuess="wordGuesses[index]"
                :key="index"
            ></WordContainer>
        </div>
        <button @click="playAgain" class="buttons">Play Again</button>
        <button @click="reset" class="buttons">Reset</button>
        <button @click="skip" class="buttons">Skip</button>
        <button @click="sayWord" class="buttons">Say words</button>
    </div>
</template>

<style>
.wordsContainer {
    display: flex;
}

.gameArea {
    visibility: hidden;
}

ol {
    display: block;
}
</style>