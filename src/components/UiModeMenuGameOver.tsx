import { useGameStore } from '../store';
import React from 'react';

export default function UiModeMenuGameOver() {
	const showMainMenu = useGameStore((state) => state.showMainMenu);
	return (
		<div className="menu">
			<h1>WIP Game Over</h1>
			<button
				className="full-width"
				onClick={showMainMenu}
			>
				Back
			</button>
		</div>
	);
}
