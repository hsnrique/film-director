import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from '../../public/timeline.json';
import {C, alpha} from '../theme';
import {ease, keys, tween, wiggle} from '../lib/motion';
import {Scene, cue} from '../lib/score';
import {Camera, Layer} from '../components/Camera';
import {Grain} from '../components/Fx';
import {Probe} from '../components/Probe';
import {Open, Sound} from './Opening';
import {Cut, Match} from './Frames';
import {Dawn} from './Dawn';
import {Atmosphere, Letterbox} from './parts';

/** The camera breathes (seeded noise) and always drifts a little forward; it never shakes and never stops. */
const Breath: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const drift = 1.02 + 0.03 * Math.sin(frame / 95);
	return (
		<Camera x={wiggle('cam-x', frame, 0.012, 22)} y={wiggle('cam-y', frame, 0.01, 12)} zoom={drift} rotate={wiggle('cam-r', frame, 0.008, 0.25)}>
			<Layer depth={1}>{children}</Layer>
		</Camera>
	);
};

export const Film: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const dawnAt = Math.round(cue('title') * fps) - Math.round(1.2 * fps);
	const bars = tween(frame, dawnAt, Math.round(1.4 * fps), 0, 1, ease.settle);
	const fromBlack = tween(frame, 0, Math.round(1.2 * fps), 1, 0, ease.settle);
	const toBlack = tween(frame, Math.round(cue('out') * fps), durationInFrames - Math.round(cue('out') * fps), 0, 1, ease.move);
	const night = keys(frame, [0, dawnAt], [0, 1], [ease.settle]);
	// The ground is lit where the light is, so the space follows the motif from scene to scene.
	const pool = [cue('type'), cue('draw'), cue('rise'), cue('pass'), cue('title')].map((t) => Math.round(t * fps));
	const poolX = keys(frame, pool, [24, 50, 50, 66, 50], [ease.move, ease.move, ease.move, ease.move]);
	const poolY = keys(frame, pool, [72, 50, 34, 46, 92], [ease.move, ease.move, ease.move, ease.move]);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill
				style={{background: `radial-gradient(ellipse 62% 58% at ${poolX}% ${poolY}%, ${alpha(C.ground, night)} 0%, ${alpha(C.ground, 0.25 * night)} 45%, transparent 85%)`}}
			/>
			<Breath>
				<Atmosphere />
				<Scene id="open"><Open /></Scene>
				<Scene id="sound"><Sound /></Scene>
				<Scene id="cut"><Cut /></Scene>
				<Scene id="match"><Match /></Scene>
				<Scene id="dawn"><Dawn /></Scene>
			</Breath>
			<Letterbox open={bars} />
			<AbsoluteFill style={{background: C.void, opacity: Math.max(fromBlack, toBlack), pointerEvents: 'none'}} />
			<Grain opacity={0.05} vignette={0.38} />
			{timeline.audio ? <Audio src={staticFile(timeline.audio)} /> : null}
			<Probe />
		</AbsoluteFill>
	);
};
