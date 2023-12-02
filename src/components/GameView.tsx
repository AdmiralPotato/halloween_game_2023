import { useGameStore } from '../store';
import React, { useEffect, useRef } from 'react';
import { attachGameView } from '../modules/createBabylonScene';

export default function GameView() {
	const canvasHolderRef = useRef(null);
	const addCandy = useGameStore((state) => state.addCandy);
	const pauseGame = useGameStore((state) => state.pauseGame);
	const buttonStateMap = useGameStore((state) => state.buttonStateMap);
	const joystick = useGameStore((state) => state.joystick);

	// set up basic engine and scene
	useEffect(() => {
		const canvasHolder: HTMLDivElement | null = canvasHolderRef.current;
		if (!canvasHolder) {
			return;
		} else if (!canvasHolder['ownerDocument']) {
			console.log('canvasHolder?.ownerDocument was missing!');
			return;
		}
		attachGameView({
			canvasHolder,
			addCandy,
			pauseGame,
			joystick,
			buttonStateMap,
		});
		console.log('GameView spawned');
	}, [canvasHolderRef, addCandy, buttonStateMap, joystick]);

	return (
		<div
			className="GameView"
			ref={canvasHolderRef}
		></div>
	);
}
