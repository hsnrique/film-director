import React from 'react';
import {Composition} from 'remotion';
import timeline from '../public/timeline.json';
import {FORMATS, FormatName} from './lib/format';
import {Film} from './film/Film';

type Props = {format: FormatName | null; probe: boolean};
const defaults: Props = {format: null, probe: false};
const sized = ({props}: {props: Record<string, unknown>}) => {
	const f = props.format as FormatName | null;
	return f ? FORMATS[f] : {};
};

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="Film"
			component={Film}
			durationInFrames={Math.round(timeline.duration * timeline.fps)}
			fps={timeline.fps}
			width={timeline.width}
			height={timeline.height}
			defaultProps={defaults}
			calculateMetadata={sized}
		/>
	</>
);
