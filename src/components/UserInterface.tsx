import { useGameStore } from '../store';
import { setupUserInput } from '../modules/userInputState';
import React from 'react';

export default function UserInterface() {
	const candies = useGameStore((state) => state.candies);
	const timeRemaining = useGameStore((state) => state.timeRemaining);
	const buttonStateMap = useGameStore((state) => state.buttonStateMap);
	const setButtonState = setupUserInput(buttonStateMap);

	const buttonConfigs = [
		{ symbol: '🍬', name: 'action', style: { right: 24, bottom: 24 } },
		{ symbol: '🎥', name: 'camera', style: { top: 8, left: 8 } },
		{ symbol: '🌱', name: 'seed', style: { top: 8, right: 8 } },
	];

	return (
		<div className="UserInterface">
			<div>Candies: {candies}</div>
			<div>Time Remaining: {timeRemaining}</div>
			{buttonConfigs.map((config) => (
				<button
					key={config.symbol}
					style={config.style}
					onPointerDown={() => setButtonState(config.name, true)}
					onPointerUp={() => setButtonState(config.name, false)}
				>
					{config.symbol}
				</button>
			))}
		</div>
	);
}
