<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue'
import type { Ref } from 'vue'
import WordContainer from './WordContainer.vue'
import { useFetch } from './fetch';

const props = defineProps<{
    wordCount: number
}>()

const wordContainerList = ref(Array(props.wordCount).fill("")) // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""))
const currentWords: Ref<string[]> = ref([])
const wordBank : Ref<string[]> = ref([])
const isGuessesFinished = ref(currentWords.value.length == props.wordCount)
const SERVER = new URL('http://127.0.0.1:8000/random-words/')
var retries = 0
const retryTotal = 5

onBeforeMount(() => {
    populateWordBank()
})

onMounted(() => {
    getNewWords()
    console.log(wordGuesses)
})

async function populateWordBank() {
    try {
        const result = await useFetch(SERVER, '4000')
        wordBank.value = result as string[]
        console.log(wordBank.value)
        console.log(wordBank.value.length)
        retries = 0
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
    console.log("play again")
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

function testWord() {
    // call an event? Since speech to text will need to be some async outside call, will
    // need an event for when the answer is returned
    onWordInterpretted(["test"])
    console.log(currentWords.value.length)
    console.log(props.wordCount)
    console.log(currentWords.value.length == props.wordCount)
}

function skip() {
    reset()
    populateWords()
}

</script>

<template>
    <div class="wordsContainer">
        <WordContainer 
            v-for="(word, index) in wordContainerList"
            :isComplete="isGuessesFinished"
            :word="word"
            :wordGuess="wordGuesses[index]"
            :key="index"
        ></WordContainer>
    </div>
    <button @click="playAgain">Play Again</button>
    <button @click="reset">Reset</button>
    <button @click="skip">Skip</button>
    <button @click="testWord">Test</button>

</template>

<style>
.wordsContainer {
    display: flex;
}

ol {
    display: block;
}
</style>