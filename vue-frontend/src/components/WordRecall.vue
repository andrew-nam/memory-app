<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import WordContainer from './WordContainer.vue'

const props = defineProps<{
    wordCount: number
}>()

const wordContainerList = ref(Array(props.wordCount).fill("")) // css display list in horizontal
const wordGuesses = ref(Array(props.wordCount).fill(""))
const currentWords: Ref<string[]> = ref([])
const isGuessesFinished = ref(currentWords.value.length == props.wordCount)

onMounted(() => {
    populateWords()
    console.log(wordGuesses)
})

function getNewWords() {
    // async operation to get new words from server
    // populate wordcontainerlist with words
    console.log(props.wordCount)
    const temp = []
    for (let step = 0; step < props.wordCount; step++) {
        temp.push("" + Math.floor(Math.random() * 11))
    }
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