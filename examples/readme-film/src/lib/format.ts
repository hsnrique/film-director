import {useVideoConfig} from 'remotion';

// Delivery formats. The same project renders in all three:`render.py --formats reels,square,youtube`.
export const FORMATS = {
	youtube: {width: 1920, height: 1080},
	reels: {width: 1080, height: 1920},
	square: {width: 1080, height: 1080},
} as const;
export type FormatName = keyof typeof FORMATS;

type Box = {x: number; y: number; w: number; h: number};

/**
 * Format of the current composition. `u` is the scale unit (1 at 1080 px on the shorter side): write sizes as
 * `96 * u`. `text` and `action` are the safe areas in px. `pick` chooses a value per format.
 */
export const useFormat = () => {
	const {width, height} = useVideoConfig();
	const ratio = width / height;
	const name: FormatName = ratio < 0.8 ? 'reels' : ratio < 1.25 ? 'square' : 'youtube';
	const u = Math.min(width, height) / 1080;
	// At 9:16 the app UI covers the top and the bottom: keep text between y 360 and 1420 of 1920.
	const text: Box =
		name === 'reels'
			? {x: width * 0.1, y: height * (360 / 1920), w: width * 0.8, h: height * ((1420 - 360) / 1920)}
			: {x: width * 0.1, y: height * 0.1, w: width * 0.8, h: height * 0.8};
	const action: Box = {x: width * 0.05, y: height * 0.05, w: width * 0.9, h: height * 0.9};
	const pick = <T,>(by: {youtube: T; reels?: T; square?: T}): T => by[name] ?? by.youtube;
	return {width, height, name, vertical: name === 'reels', square: name === 'square', u, text, action, pick};
};
