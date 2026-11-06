import {loadFont as loadDisplay} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadBody} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import brand from '../public/brand.json';

// The video's brand. Colours come from public/brand.json (scripts/brand.py extracts them from a site or repository).
// No scene writes a loose hex: use C.*. The lint flags any colour outside this file.
// To change the font, swap the two imports above for the brand's family in @remotion/google-fonts
// (or load a local file with @remotion/fonts) and keep brand.json under the same name.
const display = loadDisplay('normal', {weights: ['400'], subsets: ['latin']});
const displayItalic = loadDisplay('italic', {weights: ['400'], subsets: ['latin']});
const body = loadBody('normal', {weights: ['400', '500'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']});

export const C = brand.colors;
export const BRAND = brand;
export const SERIF = `${display.fontFamily}, ${displayItalic.fontFamily}, Georgia, serif`;
export const FONT = `${body.fontFamily}, "Helvetica Neue", Arial, sans-serif`;
export const MONO = `${mono.fontFamily}, Menlo, monospace`;

/** Type scale in px for a shorter side of 1080; multiply by `u` from useFormat(). */
export const type = {hero: 168, title: 96, lead: 64, caption: 56, body: 40, label: 38};

/** A brand colour at an opacity, so scenes never write a loose colour. */
export const alpha = (hex: string, a: number) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
