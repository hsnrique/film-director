import React from 'react';
import {AbsoluteFill, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {getWaveformPortion, useAudioData} from '@remotion/media-utils';
import {C, SERIF, alpha, type} from '../theme';
import {ease, tween} from '../lib/motion';
import {useFormat} from '../lib/format';

export const FILM_SECONDS = 37;
export const WAVE = {left: 160, right: 1760, y: 540, bars: 200, height: 260};

/** Where a second of the score sits on the waveform, so ticks and the playhead share one axis. */
export const waveX = (t: number) => WAVE.left + (t / FILM_SECONDS) * (WAVE.right - WAVE.left);

/** The motif: the only thing in the film that glows, and it warms the air around it. */
export const Light: React.FC<{x: number; y: number; size?: number; glow?: number}> = ({x, y, size = 14, glow = 1}) => {
	const halo = 340 * Math.min(1.6, glow);
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: x - halo,
					top: y - halo,
					width: halo * 2,
					height: halo * 2,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${alpha(C.accent, 0.2 * Math.min(1, glow))} 0%, ${alpha(C.dawn, 0.16 * Math.min(1, glow))} 40%, transparent 70%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: x - size / 2,
					top: y - size / 2,
					width: size,
					height: size,
					borderRadius: '50%',
					background: C.accent,
					boxShadow: `0 0 ${24 * glow}px ${8 * glow}px ${alpha(C.accent, 0.45)}, 0 0 ${120 * glow}px ${40 * glow}px ${alpha(C.accent, 0.12)}`,
				}}
			/>
		</>
	);
};

/** Dust in the air at three depths: near motes are large and soft, far ones small and sharp. */
export const Atmosphere: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: 72}, (_, i) => {
				const depth = 0.6 + random(`d${i}`) * 2;
				const drift = (frame * (0.35 + random(`v${i}`) * 0.5)) / depth;
				const x = ((random(`x${i}`) * 2100 + drift) % 2100) - 90;
				const y = random(`y${i}`) * 1080 - drift * 0.35;
				const size = 2 + 7 / depth;
				const warm = random(`w${i}`) > 0.7;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: ((y % 1080) + 1080) % 1080,
							width: size,
							height: size,
							borderRadius: '50%',
							background: alpha(warm ? C.accent : C.second, 0.16 + 0.22 / depth),
							filter: `blur(${Math.max(0, 3.2 - depth * 1.6)}px)`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** The score's own envelope, drawn as mirrored bars. `reveal` 0..1 opens it outward from the centre. */
export const Waveform: React.FC<{reveal: number; flatten?: number; tint?: string; y?: number}> = ({
	reveal,
	flatten = 0,
	tint = C.second,
	y = WAVE.y,
}) => {
	const audio = useAudioData(staticFile('audio/music.wav'));
	if (!audio) return null;
	const bars = getWaveformPortion({audioData: audio, startTimeInSeconds: 0, durationInSeconds: FILM_SECONDS, numberOfSamples: WAVE.bars});
	const pitch = (WAVE.right - WAVE.left) / WAVE.bars;
	const centre = WAVE.bars / 2;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
			{bars.map((b, i) => {
				const shown = Math.abs(i - centre) / centre <= reveal;
				const h = Math.max(2, b.amplitude * WAVE.height * (1 - flatten));
				return shown ? <rect key={i} x={WAVE.left + i * pitch} y={y - h / 2} width={2} height={h} fill={alpha(tint, 0.75)} /> : null;
			})}
		</svg>
	);
};

/** One caption at a time, rising out of a mask and leaving faster than it came. */
export const Caption: React.FC<{text: string; from: number; to: number}> = ({text, from, to}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useFormat();
	const inP = tween(frame, from, Math.round(0.7 * fps), 0, 1, ease.enter);
	const outP = tween(frame, to - Math.round(0.45 * fps), Math.round(0.45 * fps), 0, 1, ease.exit);
	if (frame < from || frame > to) return null;
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 168 * u}}>
			<div style={{overflow: 'hidden', paddingBottom: 8}}>
				<div
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontSize: type.caption * u,
						color: C.ink,
						opacity: 1 - outP,
						transform: `translateY(${(1 - inP) * 60}px)`,
						letterSpacing: 0.2,
					}}
				>
					{text}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** 2.39:1 bars for the cinematic acts; `open` 0..1 releases them to the full frame. */
export const Letterbox: React.FC<{open: number}> = ({open}) => {
	const bar = 138 * (1 - open);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: C.void}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: C.void}} />
		</AbsoluteFill>
	);
};

/** A viewfinder: four corner marks instead of a boxed card, so a frame reads as a shot, not UI. */
export const Corners: React.FC<{x: number; y: number; w: number; h: number; color: string; arm?: number}> = ({x, y, w, h, color, arm = 22}) => (
	<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
		{[
			[x, y, 1, 1],
			[x + w, y, -1, 1],
			[x, y + h, 1, -1],
			[x + w, y + h, -1, -1],
		].map(([cx, cy, dx, dy]) => (
			<path key={`${cx}-${cy}`} d={`M${cx + dx * arm},${cy} L${cx},${cy} L${cx},${cy + dy * arm}`} fill="none" stroke={color} strokeWidth={1.5} />
		))}
	</svg>
);
