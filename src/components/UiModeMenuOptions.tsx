import { useGameStore } from '../store';
import React from 'react';

export default function UiModeMenuOptions() {
	const menuBack = useGameStore((state) => state.menuBack);
	const setResolution = useGameStore((state) => state.setResolution);
	return (
		<div className="menu">
			<h1>WIP Options</h1>
			<h2>Resolution scale (performance)</h2>
			<div>
				<button
					className="option"
					onClick={() => setResolution(1)}
				>
					Full
				</button>
				<button
					className="option"
					onClick={() => setResolution(0.5)}
				>
					Half
				</button>
				<button
					className="option"
					onClick={() => setResolution(0.25)}
				>
					Quarter
				</button>
			</div>
			<button
				className="full-width"
				onClick={menuBack}
			>
				Back
			</button>
		</div>
	);
}
