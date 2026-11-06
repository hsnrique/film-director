import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, MONO, SERIF, alpha, type} from '../theme';
import {ease, tween} from '../lib/motion';
import {useScene} from '../lib/score';
import {Light, Waveform} from './parts';

const HORIZON = 742;

/** Text that rises out of its own baseline instead of fading in. */
const Rise: React.FC<{from: number; children: React.ReactNode; top: number; style: React.CSSProperties}> = ({from, children, top, style}) => {
	const {frame, fps} = useScene('dawn');
	const p = tween(frame, from, Math.round(1.1 * fps), 0, 1, ease.enter);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', overflow: 'hidden'}}>
			<div style={{...style, transform: `translateY(${(1 - p) * 110}%)`}}>{children}</div>
		</div>
	);
};

export const Dawn: React.FC = () => {
	const {frame, fps, at} = useScene('dawn');
	const sunrise = tween(frame, 0, Math.round(2.6 * fps), 0, 1, ease.settle);
	const warm = tween(frame, 0, Math.round(3.2 * fps), 0, 1, ease.settle);
	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: warm,
					background: `radial-gradient(ellipse 90% 46% at 50% 100%, ${alpha(C.accent, 0.16)} 0%, ${alpha(C.dawn, 0.3)} 45%, transparent 100%)`,
				}}
			/>
			<Waveform reveal={1} flatten={0.86} tint={C.accent} y={HORIZON} />
			<div style={{position: 'absolute', left: 160, right: 160, top: HORIZON, height: 1, background: alpha(C.accent, 0.5 * warm)}} />
			<Light x={960} y={HORIZON - 470 * sunrise} size={14 + 10 * sunrise} glow={1 + 1.4 * sunrise} />
			<Rise from={at('title')} top={392} style={{fontFamily: SERIF, fontSize: type.hero, color: C.ink, lineHeight: 1.1}}>
				Film Director
			</Rise>
			<Rise from={at('line')} top={590} style={{fontFamily: FONT, fontSize: type.body, color: alpha(C.ink, 0.78)}}>
				Cinematic films, made as code.
			</Rise>
			<Rise from={at('url')} top={846} style={{fontFamily: MONO, fontSize: type.label, color: alpha(C.ink, 0.9)}}>
				github.com/hsnrique/film-director
				<span style={{display: 'inline-block', width: 4, height: 44, marginLeft: 10, verticalAlign: 'middle', background: Math.floor(frame / 16) % 2 === 0 && frame > at('url') + fps ? C.accent : 'transparent'}} />
			</Rise>
		</AbsoluteFill>
	);
};
