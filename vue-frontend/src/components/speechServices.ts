import { TokenUtil } from '../utils/tokenUtils';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

var tokenUtil = new TokenUtil();

export async function textToSpeech(textToSpeak : string) {
    const tokenObj = await tokenUtil.getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(myPlayer);

    let synthesizer: speechsdk.SpeechSynthesizer | undefined = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);

    console.log(`speaking text: ${textToSpeak}...`);
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
            console.log(text as string);
        },
        function (err) {
            console.log(`Error: ${err}.\n`);

            (synthesizer as speechsdk.SpeechSynthesizer).close();
            synthesizer = undefined;
        });
}

export async function sttFromMic(callback: Function) {
    const tokenObj = await tokenUtil.getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    speechConfig.requestWordLevelTimestamps();
    
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = function (s, e) {
        console.log("RECOGNIZING: " + e.result.text);
        console.log("Offset in Ticks: " + e.result.offset);
        console.log("Duration in Ticks: " + e.result.duration);
        // TODO: determine timing of words using offset and duration
    }

    recognizer.recognizeOnceAsync(result => {
        if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
            console.log(`RECOGNIZED: Text=${result.text}`);
            callback(result.text);
            // TODO recognized words needs to emit signal to event for onWordsInterpretted
            //emit('display-text-updated', `RECOGNIZED: Text=${result.text}`);
        } else {
            console.log('ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
            //emit('display-text-updated', 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.');
        }
    });
}