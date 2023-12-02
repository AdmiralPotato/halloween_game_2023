import { useGameStore } from '../store';
import React from 'react';

export default function UiModeMenuPause() {
	const showMainMenu = useGameStore((state) => state.showMainMenu);
	const showOptions = useGameStore((state) => state.showOptions);
	const resumeGame = useGameStore((state) => state.resumeGame);
	const buttonConfigs = [
		{ name: 'End Game', action: showMainMenu },
		{ name: 'Options', action: showOptions },
		{ name: 'Resume', action: resumeGame },
	];
	return (
		<div className="UiModeMenuMain menu">
			<h1>WIP Pause</h1>
			{buttonConfigs.map((config) => (
				<button
					key={config.name}
					className="full-width"
					onClick={config.action}
				>
					{config.name}
				</button>
			))}
		</div>
	);
}
