import React from 'react';
import {AbsoluteFill} from 'remotion';
import landmarks from '../../public/audio/music.landmarks.json';
import {C, alpha} from '../theme';
import {ease, keys, stagger, tween} from '../lib/motion';
import {useScene} from '../lib/score';
import {Camera, Layer} from '../components/Camera';
import {Caption, Corners, Light, Waveform, WAVE, waveX} from './parts';

const CHORDS = landmarks.chords.map((c) => c.at);
// Four of the cuts become shots; each hangs at its own depth so the dolly reads as space.
// Lifts alternate high and low so neighbours never overlap, whatever the parallax does.
const HUNG = [1, 4, 7, 10].map((i, k) => ({t: CHORDS[i], depth: [1.3, 1.12, 1.35, 1.1][k], lift: [250, 160, 250, 160][k]}));

const StoryFrame: React.FC<{x: number; y: number; light: number; rise: number}> = ({x, y, light, rise}) => {
	const top = y - 62 + (1 - rise) * 90;
	return (
		<>
			<div style={{position: 'absolute', left: x - 110, top, width: 220, height: 124, background: alpha(C.ground, 0.35 * rise)}}>
				<div style={{position: 'absolute', left: 14, right: 14, top: 88, height: 1, background: alpha(C.ink, 0.25 * rise)}} />
				<Light x={30 + light * 160} y={88 - light * 54} size={6} glow={0.35 * rise} />
			</div>
			<Corners x={x - 110} y={top} w={220} h={124} color={alpha(C.second, 0.85 * rise)} arm={16} />
		</>
	);
};

export const Cut: React.FC = () => {
	const {frame, fps, at, len} = useScene('cut');
	const dolly = keys(frame, [0, len], [-140, 140], [ease.move]);
	const push = keys(frame, [0, at('enter'), len], [1, 1.12, 2.6], [ease.settle, ease.move]);
	return (
		<AbsoluteFill>
			<Camera x={dolly * (1 - (push - 1.12) / 1.48)} zoom={push}>
				<Layer depth={1}>
					<Waveform reveal={1} tint={C.muted} />
					{CHORDS.map((t, i) => {
						const grow = tween(frame, at('rise') + stagger(i, CHORDS.length, Math.round(0.5 * fps)), 12, 0, 1, ease.enter);
						return <div key={t} style={{position: 'absolute', left: waveX(t), top: WAVE.y - 170 * grow, width: 1.5, height: 340 * grow, background: alpha(C.accent, 0.28)}} />;
					})}
				</Layer>
				{HUNG.map((h, i) => (
					<Layer key={h.t} depth={h.depth}>
						<StoryFrame
							x={waveX(h.t)}
							y={WAVE.y - h.lift}
							light={i / (HUNG.length - 1)}
							rise={tween(frame, at('rise') + 10 + stagger(i, HUNG.length, Math.round(0.45 * fps)), 18, 0, 1, ease.enter)}
						/>
					</Layer>
				))}
				<Layer depth={1}>
					<Light x={960} y={WAVE.y} size={14} />
				</Layer>
			</Camera>
			<Caption text="Every cut lands on the score." from={at('capCut')} to={at('enter') - 4} />
		</AbsoluteFill>
	);
};

const ARC = {x0: 800, x1: 1620, y: 660, h: 330};
const onArc = (p: number) => ({x: ARC.x0 + (ARC.x1 - ARC.x0) * p, y: ARC.y - Math.sin(Math.PI * p) * ARC.h});
const arcPath = Array.from({length: 41}, (_, i) => onArc(i / 40)).map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
// Each pass the clone starts later than the reference and eases worse; by the third they are one.
const PASSES = [
	{lag: 0.3, easing: ease.sharp},
	{lag: 0.12, easing: ease.enter},
	{lag: 0, easing: ease.move},
];

export const Match: React.FC = () => {
	const {frame, fps, at, len} = useScene('match');
	const passLen = Math.round(1.55 * fps);
	const i = Math.min(2, Math.max(0, Math.floor((frame - at('pass')) / (passLen + 6))));
	const start = at('pass') + i * (passLen + 6);
	const ref = onArc(tween(frame, start, passLen, 0, 1, ease.move));
	const clone = onArc(tween(frame, start + Math.round(PASSES[i].lag * fps), passLen, 0, 1, PASSES[i].easing));
	const settle = tween(frame, 0, Math.round(0.9 * fps), 0, 1, ease.settle);
	const hush = tween(frame, at('hush'), Math.round(0.8 * fps), 0, 1, ease.exit);
	const home = keys(frame, [at('hush'), len], [0, 1], [ease.move]);
	const dot = {x: clone.x + (960 - clone.x) * home, y: clone.y + (742 - clone.y) * home};
	return (
		<AbsoluteFill style={{opacity: 1}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${0.9 + 0.1 * settle})`, transformOrigin: '1210px 480px'}}>
				<Corners x={660} y={180} w={1100} h={600} color={alpha(C.ink, 0.55 * (1 - hush) * settle)} arm={34} />
			</div>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 1 - hush}}>
				<path d={arcPath} fill="none" stroke={alpha(C.second, 0.5)} strokeWidth={1.5} strokeDasharray="6 10" />
				<line x1={ref.x} y1={ref.y} x2={clone.x} y2={clone.y} stroke={alpha(C.second, 0.8)} strokeWidth={2} />
				<circle cx={ref.x} cy={ref.y} r={13} fill="none" stroke={i === 2 ? C.accent : C.second} strokeWidth={2} />
			</svg>
			<Light x={dot.x} y={dot.y} size={12} />
			<Caption text="Every move is checked against its reference." from={at('capMatch')} to={at('hush')} />
		</AbsoluteFill>
	);
};
