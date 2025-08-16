import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WordContainer from '../WordContainer.vue';

describe('WordContainer.vue', async () => {
    it('Does not show correct results if not complete', async () => {
        const wrapper = await mount(WordContainer, {
            props: { 
                isComplete: false,
                word: "correct",
                wordGuess: "correct"
            }
        });
        expect(wrapper.find('[data-test="result-div"]').exists()).toBe(false);
    })

    it('Does not show incorrect results if not complete', async () => {
        const wrapper = await mount(WordContainer, {
            props: { 
                isComplete: false,
                word: "correct",
                wordGuess: "incorrect"
            }
        });
        expect(wrapper.find('[data-test="result-div"]').exists()).toBe(false);
    })

    it('Shows correct results if complete', async () => {
        const wrapper = await mount(WordContainer, {
            props: { 
                isComplete: true,
                word: "correct",
                wordGuess: "correct"
            }
        });
        
        expect(wrapper.find('[data-test="result-div"]').exists()).toBe(true);
        expect(wrapper.get('[data-test="result-div"]').classes().find((value) => value == "correct")).toBe("correct");
    })

    it('Shows incorrect results if complete', async () => {
        const wrapper = await mount(WordContainer, {
            props: { 
                isComplete: true,
                word: "correct",
                wordGuess: "incorrect"
            }
        });
        
        expect(wrapper.find('[data-test="result-div"]').exists()).toBe(true);
        expect(wrapper.get('[data-test="result-div"]').classes().find((value) => value == "incorrect")).toBe("incorrect");
    })
})
