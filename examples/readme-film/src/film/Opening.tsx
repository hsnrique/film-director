import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {C, MONO, alpha} from '../theme';
import {ease, keys, tween} from '../lib/motion';
import {useScene} from '../lib/score';
import {Caption, Light, Waveform, WAVE} from './parts';

const PROMPT = 'make it cinematic';
const TEXT_X = 260;
const TEXT_Y = 760;
const CHAR_W = 31.2;

/** A person types: uneven key times, seeded so every render types the same way. */
const keyTimes = (start: number, fps: number) => {
	const times: number[] = [];
	let t = start;
	for (let i = 0; i < PROMPT.length; i++) {
		t += Math.round((0.06 + random(`key-${i}`) * 0.11 + (PROMPT[i] === ' ' ? 0.08 : 0)) * fps);
		times.push(t);
	}
	return times;
};

export const Open: React.FC = () => {
	const {frame, fps, at} = useScene('open');
	const typed = keyTimes(at('type'), fps).filter((t) => frame >= t).length;
	const fold = tween(frame, at('fold'), Math.round(0.5 * fps), 0, 1, ease.move);
	const glide = tween(frame, at('fold') + 6, Math.round(0.85 * fps), 0, 1, ease.move);
	const caretX = TEXT_X + typed * CHAR_W + 6;
	const blinking = typed === 0 || typed === PROMPT.length;
	const on = !blinking || Math.floor(frame / 16) % 2 === 0 || fold > 0;
	const textOut = tween(frame, at('fold'), Math.round(0.4 * fps), 0, 1, ease.exit);
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: TEXT_X,
					top: TEXT_Y - 34,
					fontFamily: MONO,
					fontSize: 52,
					color: C.ink,
					opacity: 1 - textOut,
					transform: `translateX(${-textOut * 40}px)`,
					whiteSpace: 'pre',
				}}
			>
				{PROMPT.slice(0, typed)}
			</div>
			{fold < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: caretX,
						top: TEXT_Y - 30 + 27 * fold,
						width: 3 + 7 * fold,
						height: 60 - 50 * fold,
						borderRadius: 6 * fold,
						background: on ? C.accent : 'transparent',
						boxShadow: `0 0 ${18 * fold}px ${alpha(C.accent, 0.5)}`,
					}}
				/>
			) : (
				<Light x={caretX + (960 - caretX) * glide} y={TEXT_Y + (WAVE.y - TEXT_Y) * glide} size={10 + 4 * glide} glow={0.4 + 0.6 * glide} />
			)}
		</AbsoluteFill>
	);
};

export const Sound: React.FC = () => {
	const {frame, fps, at, len} = useScene('sound');
	const reveal = keys(frame, [at('draw'), at('draw') + Math.round(5.8 * fps)], [0, 1], [ease.settle]);
	const breath = 1 + 0.12 * Math.sin((frame / fps) * 1.6);
	return (
		<AbsoluteFill>
			<Waveform reveal={reveal} />
			<Light x={960} y={WAVE.y} size={14 * breath} glow={1} />
			<Caption text="It starts with the sound." from={at('capSound')} to={len - Math.round(0.9 * fps)} />
		</AbsoluteFill>
	);
};
