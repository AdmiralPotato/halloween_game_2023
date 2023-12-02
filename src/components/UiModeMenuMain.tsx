import { useGameStore } from '../store';
import React from 'react';

export default function UiModeMenuMain() {
	const startGame = useGameStore((state) => state.startGame);
	const openOptions = useGameStore((state) => state.showOptions);
	const showCredits = useGameStore((state) => state.showCredits);

	const buttonConfigs = [
		{ name: 'Play Random', action: () => startGame(Math.random().toString()) },
		{ name: 'Play Seed', action: () => startGame(window.prompt('GIVE SEED') || '') },
		{ name: 'Options', action: openOptions },
		{ name: 'Credits', action: showCredits },
	];
	return (
		<div className="UiModeMenuMain menu">
			<h1>
				<img
					src="./public/assets/logo_outline.svg"
					alt="BLACK MAGE || TRICK OR TREAT || HIDE AND SEEK"
					style={{
						width: '100%',
					}}
				/>
			</h1>
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
