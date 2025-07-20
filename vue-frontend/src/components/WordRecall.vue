<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import WordContainer from './WordContainer.vue';
import { WordBank } from './wordBank';
import { getTokenOrRefresh } from './token_util';

const props = defineProps<{
    wordCount: number,
    timeBetweenWords: number,
    audioRepeats: number
}>();

const wordContainerList = ref(Array(props.wordCount).fill("")); // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""));
const wordBank = new WordBank();
const isGuessesFinished = ref(false);
const displayText = ref('');

const showBeginButton = ref(false);
const showGameArea = ref(false);
const disableRepeatButton = ref(false);

var wordGuessesCount = 0;
var audioPlays = 0;

onBeforeMount(async () => {
    showBeginButton.value = await wordBank.init();
});

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
                text = `synthesis finished for "${textToSpeak}".\n`;
            } else if (result.reason === speechsdk.ResultReason.Canceled) {
                text = `synthesis failed. Error detail: ${result.errorDetails}.\n`;
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

    var guessesToFill = Math.min(wordsArray.length + wordGuessesCount, props.wordCount);
    for(let i = wordGuessesCount; i < guessesToFill; i++) {
        wordGuesses.value[i] = wordsArray.pop();
        wordGuessesCount++;
    }
    isGuessesFinished.value = wordGuessesCount == props.wordCount;
}

async function begin() {
    await populateWordContainers();
    showBeginButton.value = false;
    showGameArea.value = true;
    
    generateAudio();
}

function generateAudio() {
    var textToSpeak = wordContainerList.value.join(" ");
    textToSpeech(textToSpeak);
}

function playAgain() {
    audioPlays++;
    if(audioPlays >= props.audioRepeats) {
        disableRepeatButton.value = true;
    }
    generateAudio();
}

function reset() {
    audioPlays = 0;
    if(props.audioRepeats > 0) {
        disableRepeatButton.value = false;
    }
    for(let i = 0; i < props.wordCount; i++) {
        wordGuesses.value[i] = "";
    }
    wordGuessesCount = 0;
    isGuessesFinished.value = false;
}

async function populateWordContainers() {
    var words = await wordBank.getNewWords(wordContainerList.value.length);
    wordContainerList.value = words;
}

function skip() {
    reset();
    populateWordContainers();
    generateAudio();
}

</script>

<template>
    <div class="buttons">
        <button @click="begin" v-show="showBeginButton">Begin</button>
    </div>
    <div class="gameArea" v-show="showGameArea">
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
            <button @click="playAgain" class="buttons" :disabled="disableRepeatButton">Play Again</button>
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