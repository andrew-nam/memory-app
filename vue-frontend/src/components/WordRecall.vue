<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import WordContainer from './WordContainer.vue';
import { WordBank, wordBankErrors } from './wordBank';
import { textToSpeech, sttFromMic } from './speechServices';
import { removePunctuations } from '@/utils/stringUtils';

const props = defineProps<{
    wordCount: number,
    timeBetweenWords: number,
    audioRepeats: number
}>();

const wordContainerList = ref(Array(props.wordCount).fill("")); // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""));
const wordBank = new WordBank();

const showBeginButton = ref(false);
const showGameArea = ref(false);
const disableRepeatButton = ref(false);
const isGuessesFinished = ref(false);
const errorDisplay = wordBankErrors;

var wordGuessesCount = 0;
var audioPlays = 0;

onBeforeMount(async () => {
    showBeginButton.value = await wordBank.populateWordBank();
});

async function onListenForWords() {
    var recognizedWords = await sttFromMic();
    onWordsInterpretted(recognizedWords as string);
}

function onWordsInterpretted(words:string) {
    var wordsArray = words.toLowerCase().split(" ");
    wordsArray = wordsArray.map((str) => removePunctuations(str)).reverse();

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
    var words = await wordBank.requestNewWords(wordContainerList.value.length);
    if (words == null) {
        // TODO: Error messaging when not enough words and populate fails
        // TODO: display a try again button
    } else {
        wordContainerList.value = words;
    }
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
        <p v-show="errorDisplay.length > 0">{{ errorDisplay }}</p>
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
            <button @click="onListenForWords" class="buttons">Say words</button>
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