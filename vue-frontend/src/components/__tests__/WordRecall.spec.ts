import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WordRecall from '../WordRecall.vue';
import WordContainer from '../WordContainer.vue';
import { WordBank, wordBankErrors } from '../wordBank';
import { sttFromMic, textToSpeech } from '../speechServices';
import { VueWrapper } from '@vue/test-utils';

vi.mock("../wordBank");
vi.mock('../speechServices');

describe('WordRecall.vue on start', async () => {
    let wrapperFail : VueWrapper;
    let wrapperSuccess : VueWrapper;

    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(false);
        vi.mocked(wordBankErrors).value = 'Mock error';
        wrapperFail = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });

        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(wordBankErrors).value = '';
        wrapperSuccess = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });
    })
    
    it('Does not show a begin button if the component does not have words', () => {
        expect(wrapperFail.get('[data-test="begin-button"]').isVisible()).toBe(false);
    })

    it('Shows an error message if the component fails to get words', () => {
        expect(wrapperFail.get('[data-test="error-display"]').text()).toBe("Mock error");
    })

    it('Shows a begin button if the component has words', () => {
        expect(wrapperSuccess.get('[data-test="begin-button"]').isVisible()).toBe(true);
    })

    it('Does not show an error message if the component succeeds to get words', () => {
        expect(wrapperSuccess.get('[data-test="error-display"]').isVisible()).toBe(false);
    })

    it('Does not show the game area, or relevant buttons', () => {
        expect(wrapperSuccess.get('[data-test="game-area"]').isVisible()).toBe(false);
        expect(wrapperSuccess.get('[data-test="say-words"]').isVisible()).toBe(false);
        expect(wrapperSuccess.get('[data-test="reset"]').isVisible()).toBe(false);
        expect(wrapperSuccess.get('[data-test="skip"]').isVisible()).toBe(false);
        expect(wrapperSuccess.get('[data-test="play-again"]').isVisible()).toBe(false);
    })
})

describe('WordRecall.vue on begin', async () => {
    let wrapper : VueWrapper;

    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(WordBank.prototype.requestNewWords).mockResolvedValueOnce(["one", "two", "three", "four"]);
        vi.mocked(wordBankErrors).value = '';
        wrapper = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });
        await wrapper.get('[data-test="begin-button"]').trigger('click');
    })
    

    it('Shows as many wordContainers as the options requires', () => {
        expect(wrapper.findAllComponents(WordContainer).length).toBe(4);
    })

    it('Shows the game area and relevant game buttons', () => {
        expect(wrapper.get('[data-test="game-area"]').isVisible()).toBe(true);
        expect(wrapper.get('[data-test="say-words"]').isVisible()).toBe(true);
        expect(wrapper.get('[data-test="reset"]').isVisible()).toBe(true);
        expect(wrapper.get('[data-test="skip"]').isVisible()).toBe(true);
        expect(wrapper.get('[data-test="play-again"]').isVisible()).toBe(true);
    })

    it('Generates the audio for the rounds words', () => {
        expect(vi.mocked(textToSpeech)).toHaveBeenCalledWith("one two three four");
    })
})

describe('WordRecall.vue play again button', async () => {
    let wrapper : VueWrapper;
    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(WordBank.prototype.requestNewWords).mockResolvedValueOnce(["one", "two", "three", "four"]).mockResolvedValueOnce(["1", "2", "3", "4"]);
        vi.mocked(wordBankErrors).value = '';
        wrapper = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });
        await wrapper.get('[data-test="begin-button"]').trigger('click');
    })
    

    it('Is enabled if it has not been played the maximum number of times', () => {
        expect(wrapper.get('[data-test="play-again"]').attributes("disabled")).toBeUndefined();
    })

    it('Plays the audio of the rounds words', async () => {
        await wrapper.get('[data-test="play-again"]').trigger('click');
        expect(vi.mocked(textToSpeech)).toHaveBeenCalledTimes(2);
    })

    it('Is disabled after being pressed the maximum number of times', async () => {
        await wrapper.get('[data-test="play-again"]').trigger('click');
        expect(vi.mocked(textToSpeech)).toHaveBeenCalledTimes(2);
        expect(wrapper.get('[data-test="play-again"]').attributes("disabled")).toBeDefined();
    })

    it('Is enabled and able to be pressed up to the maximum number of times after next', async () => {
        await wrapper.get('[data-test="skip"]').trigger('click');
        expect(wrapper.get('[data-test="play-again"]').attributes("disabled")).toBeUndefined();
        await wrapper.get('[data-test="play-again"]').trigger('click');
        await wrapper.get('[data-test="play-again"]').trigger('click');
        expect(wrapper.get('[data-test="play-again"]').attributes("disabled")).toBeDefined();
    })
})

describe('WordRecall.vue play reset button', () => {
    let wrapper : VueWrapper;
    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(WordBank.prototype.requestNewWords).mockResolvedValueOnce(["one", "two", "three", "four"]);
        vi.mocked(wordBankErrors).value = '';
        wrapper = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });
        await wrapper.get('[data-test="begin-button"]').trigger('click');
    });

    it('clears currently recorded answers', async () => {
        vi.mocked(sttFromMic).mockImplementation((callback : Function) => callback("one two three four"));
        await wrapper.get('[data-test="say-words"]').trigger('click');

        var wordContainers = wrapper.findAllComponents(WordContainer);
        var result = true;
        wordContainers.forEach((item) => {result = result && item.props().wordGuess != ""});
        expect(result).toBe(true);

        await wrapper.get('[data-test="reset"]').trigger('click');
        wordContainers.forEach((item) => {result = result && item.props().wordGuess == ""});
        expect(result).toBe(true);
    })

    it('does not clear the start time', () => {

    })
})

// TODO: Decide if skip is also submit button based on completeness
describe('WordRecall.vue skip button', async () => {
    let wrapper : VueWrapper;

    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(WordBank.prototype.requestNewWords).mockResolvedValueOnce(["one", "two", "three", "four"]).mockResolvedValueOnce(["five", "six", "seven", "eight"]);
        vi.mocked(wordBankErrors).value = '';
        wrapper = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });
        await wrapper.get('[data-test="begin-button"]').trigger('click');
    });
    
    it('Creates as many wordContainers as specified by options', async () => {
        expect(WordBank.prototype.requestNewWords).toHaveBeenCalledTimes(1);
        await wrapper.get('[data-test="skip"]').trigger('click');
        expect(wrapper.findAllComponents(WordContainer).length).toBe(4);
    })

    it('Gets new words', async () => {
        expect(vi.mocked(textToSpeech)).toHaveBeenCalledWith("one two three four");
        await wrapper.get('[data-test="skip"]').trigger('click');
        expect(WordBank.prototype.requestNewWords).toHaveBeenCalledTimes(2);
        expect(vi.mocked(textToSpeech)).toHaveBeenCalledWith("five six seven eight");
    })

    it('Does not record results', () => {

    })
})

describe('WordRecall.vue say words button', () => {
    let wrapper : VueWrapper;

    afterEach(async () => {
        vi.resetAllMocks();
    });
    beforeEach(async () => {
        vi.mocked(WordBank.prototype.populateWordBank).mockResolvedValueOnce(true);
        vi.mocked(WordBank.prototype.requestNewWords).mockResolvedValueOnce(["one", "two", "three", "four"]).mockResolvedValueOnce(["five", "six", "seven", "eight"]);
        vi.mocked(wordBankErrors).value = '';
        wrapper = await mount(WordRecall, {
            props: {
                wordCount: 4,
                timeBetweenWords: 4,
                audioRepeats: 1
            }
        });

        await wrapper.get('[data-test="begin-button"]').trigger('click');
    });

    it('passes recognized words to WordContainer props', async () => {
        vi.mocked(sttFromMic).mockImplementation((callback : Function) => callback("one two three four"));
        await wrapper.get('[data-test="say-words"]').trigger('click');

        var wordContainers = wrapper.findAllComponents(WordContainer);
        var result = true;
        wordContainers.forEach((item) => {result = result && item.props().wordGuess != ""});
        expect(result).toBe(true);
        wordContainers.forEach((item) => {result = result && item.props().isComplete == true});
        expect(result).toBe(true);
    })

    it('accumulates recognized words into wordContainer', async () => {
        vi.mocked(sttFromMic).mockImplementation((callback : Function) => callback("one two"));
        await wrapper.get('[data-test="say-words"]').trigger('click');

        vi.mocked(sttFromMic).mockImplementation((callback : Function) => callback("three four"));
        await wrapper.get('[data-test="say-words"]').trigger('click');

        var wordContainers = wrapper.findAllComponents(WordContainer);
        var result = true;
        wordContainers.forEach((item) => {result = result && item.props().wordGuess != ""});
        expect(result).toBe(true);

        wordContainers.forEach((item) => {result = result && item.props().isComplete == true});
        expect(result).toBe(true);
    })

    it('records initial start time', () => {

    })
})

// TODO: button to validate answers upon completion before submission