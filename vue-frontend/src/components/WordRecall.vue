<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import type { Ref } from 'vue'
import WordContainer from './WordContainer.vue'
import { useFetch } from './fetch';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk'
import { getTokenOrRefresh } from './token_util';

const props = defineProps<{
    wordCount: number,
    timeBetweenWords: number,
    audioRepeats: number
}>()

const wordContainerList = ref(Array(props.wordCount).fill("")) // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""))
const wordBank : Ref<string[]> = ref([])
const isGuessesFinished = ref(false)
const displayText = ref('')

const SERVER = new URL('http://127.0.0.1:8000/api/random-words/');
var retries = 0;
var retryTotal = 5;
var wordGuessesCount = 0;
var audioPlays = 0;

onBeforeMount(() => {
    populateWordBank()
})

async function populateWordBank() {
    try {
        const result = await useFetch(SERVER, '4000');
        wordBank.value = result as string[];
        retries = 0;
        (document.getElementById("begin-button") as HTMLElement).style.visibility = "visible";
    } catch (e) {
        console.error((e as Error).message);
        if (retries < retryTotal) {
            retries ++;
            populateWordBank();
        } else {
            console.error("Failed " + retries + " times, quitting");
        }
    }
}

async function textToSpeech(textToSpeak:string) {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        const myPlayer = new speechsdk.SpeakerAudioDestination();
        const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(myPlayer);

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

async function sttFromMic(){
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    await recognizer.recognizeOnceAsync(result => {
        if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            displayText.value = `RECOGNIZED: Text=${result.text}`;
            onWordsInterpretted(result.text);
        } else {
            displayText.value = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
        }
    });
}

function onWordsInterpretted(words:string) {
    var wordsArray = words.toLowerCase().split(" ");
    wordsArray = wordsArray.map((str) => str.replace(/[\p{P}$+<=>^`|~]/gu, '')).reverse();

    var guessesToFill = Math.min(wordsArray.length + wordGuessesCount, props.wordCount)
    for(let i = wordGuessesCount; i < guessesToFill; i++) {
        wordGuesses.value[i] = wordsArray.pop();
        wordGuessesCount++;
    }
    isGuessesFinished.value = wordGuessesCount == props.wordCount;
}

function begin() {
    populateWords();
    var beginButton = document.getElementById("begin-button");
    (beginButton as HTMLElement).style.display="none";
    var gameArea = document.getElementsByClassName("gameArea");
    (gameArea.item(0) as HTMLElement).style.visibility="visible";
    
    generateAudio();
}

function generateAudio() {
    var textToSpeak = wordContainerList.value.join(" ");
    textToSpeech(textToSpeak);
}

function playAgain() {
    audioPlays++;
    console.log(audioPlays)
    console.log(props.audioRepeats)
    if(audioPlays >= props.audioRepeats) {
        console.log("Disabling button");
        document.getElementById("repeat-button")?.setAttribute("disabled", "true");
    }
    generateAudio();
}

function reset() {
    audioPlays = 0;
    document.getElementById("repeat-button")?.removeAttribute("disabled");
    for(let i = 0; i < props.wordCount; i++) {
        wordGuesses.value[i] = "";
    }
    wordGuessesCount = 0;
    isGuessesFinished.value = false;
}

function populateWords() {
    wordContainerList.value = getNewWords().map((str) => str.replace(/[\p{P}$+<=>^`|~]/gu, ''));
    console.log(wordBank.value.length);
    if(wordBank.value.length < props.wordCount * 3) {
        populateWordBank();
    }
}

function getNewWords() {
    const temp = wordBank.value.slice(0, props.wordCount);
    wordBank.value = wordBank.value.splice(props.wordCount);
    return temp;
}

function skip() {
    reset();
    populateWords();
    generateAudio();
}

</script>

<template>
    <div class="buttons">
        <button @click="begin" id="begin-button" visibility="hidden">Begin</button>
    </div>
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
        <div class="buttons">
            <button @click="playAgain" class="buttons" id="repeat-button">Play Again</button>
            <button @click="reset" class="buttons">Reset</button>
            <button @click="skip" class="buttons">Skip</button>
            <button @click="sttFromMic" class="buttons">Say words</button>
        </div>
        
    </div>
</template>

<style>
.wordsContainer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
}

.gameArea {
    visibility: hidden;
    align-items: center;
}
.buttons {
    display: flex;
    justify-content: center;
}

ol {
    display: block;
}
</style>