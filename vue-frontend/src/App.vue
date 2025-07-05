<script setup lang="ts">
import { ref } from 'vue'
import OptionsModal from './components/OptionsModal.vue';
import WordRecall from './components/WordRecall.vue'

const showOptionsModal = ref(false);
const setWordCount = ref(4);
const setTimeBetweenWords = ref(1);
const setAudioRepeats = ref(2);

function updateSettings(newWordCount:number, newTimeBetweenWords:number, newAudioRepeats:number) {
  setWordCount.value = newWordCount;
  setTimeBetweenWords.value = newTimeBetweenWords;
  setAudioRepeats.value = newAudioRepeats;
  showOptionsModal.value = false;

}
</script>

<template>
  <body>
    <header>
      <div class="options">
        <button id="options" @click="showOptionsModal = true">Options</button>
        <Teleport to="body">
          <OptionsModal :show="showOptionsModal" 
            :wordCount="setWordCount" 
            :timeBetweenWords="setTimeBetweenWords" 
            :audioRepeats="setAudioRepeats"
            @save="updateSettings"
            @close="showOptionsModal = false"
            >
            <template #header>
              <h3>Options</h3>
            </template>
          </OptionsModal>
        </Teleport>
      </div>
    </header>
    <div class="game">
      <WordRecall :wordCount="setWordCount"
        :timeBetweenWords="setTimeBetweenWords"
        :audioRepeats="setAudioRepeats"></WordRecall>
    </div>
  </body>
  
 
</template>

<style scoped>
  .options{
    display: flex;
    justify-content: flex-end;
  }

  body .game{
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-around;
  }
</style>
