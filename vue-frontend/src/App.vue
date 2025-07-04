<script setup lang="ts">
import { ref } from 'vue'
import OptionsModal from './components/OptionsModal.vue';
import WordRecall from './components/WordRecall.vue'

const showOptionsModal = ref(false);
const setWordCount = ref(4);
const timeBetweenWords = ref(1);

function updateSettings(newWordCount:number, newTimeBetweenWords:number) {
  setWordCount.value = newWordCount;
  timeBetweenWords.value = newTimeBetweenWords;
  showOptionsModal.value = false;

}
</script>

<template>
  <header>
    <div>
      <button id="options" @click="showOptionsModal = true">Options</button>
      <Teleport to="body">
        <OptionsModal :show="showOptionsModal" 
          :wordCount="setWordCount" 
          :timeBetweenWords="timeBetweenWords" 
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
  
  <body>
    <div><WordRecall :wordCount="setWordCount"></WordRecall></div>
  </body>
  
 
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: right;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
