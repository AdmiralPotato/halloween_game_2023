import { GameModes, useGameStore } from '../store';
import React, { type ReactElement } from 'react';
import UiModeGameplay from './UiModeGameplay';
import UiModeMenuMain from './UiModeMenuMain';
import UiModeMenuCredits from './UiModeMenuCredits';
import UiModeMenuOptions from './UiModeMenuOptions';
import UiModeMenuGameOver from './UiModeMenuGameOver';
import UiModeMenuPause from './UiModeMenuPause';

const modeComponentMap: Record<GameModes, () => ReactElement> = {
	GAMEPLAY: UiModeGameplay,
	MENU_MAIN: UiModeMenuMain,
	MENU_OPTIONS: UiModeMenuOptions,
	MENU_PAUSE: UiModeMenuPause,
	MENU_CREDITS: UiModeMenuCredits,
	GAME_OVER: UiModeMenuGameOver,
};
export default function UserInterface() {
	const mode = useGameStore((state) => state.mode);
	let Component = () => <h1>Invalid mode</h1>;
	console.log('last mode:', mode);
	if (mode) {
		Component = modeComponentMap[mode];
	}
	return (
		<div className="UserInterface">
			<Component />
		</div>
	);
}
