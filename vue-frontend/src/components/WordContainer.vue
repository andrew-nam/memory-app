<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
     isComplete: Boolean,
     word: String,
     wordGuess: String
}>()

</script>

<template>
    {{ word }}
    {{ wordGuess }}
    <div v-if="isComplete" :class="[props.wordGuess == props.word ? 'correct' : 'incorrect']"> " "</div>
    <div class="pending" ></div>

</template>

<style>
.incorrect {
    background: red
}

.pending {
    border: 16px solid #f3f3f3;
    border-top: 16px solid #3498db;
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg);}
}
</style>
