<script setup lang="ts">
  const props = defineProps({
    show: Boolean,
    wordCount: Number,
    timeBetweenWords: Number,
    audioRepeats: Number
  })
  var wordCount = props.wordCount;
  var timeBetweenWords = props.timeBetweenWords;
  var audioRepeats = props.audioRepeats;
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-container">
        <div class="modal-header">
          <slot name="header">Settings</slot>
        </div>

        <div class="modal-body">
          <label for="word-count">Number of words:</label>
          <input type="number" id="word-count" min="1" max="10" v-model="wordCount"/>

          <label for="wait-time">Seconds between words:</label>
          <input type="number" id="wait-time" min="1" max="10" v-model="timeBetweenWords"/>

          <label for="audio-repeats">Maximum allowable audio repeats:</label>
          <input type="number" id="audio-repeats" min="0" max="10" v-model="audioRepeats"/>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            <button
              class="modal-default-button"
              @click="$emit('save', wordCount, timeBetweenWords, audioRepeats)"
            >Save Settings</button>
            <button
              class="modal-default-button"
              @click="$emit('close')"
            >Close without saving</button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #ffffff82;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>