import { useGameStore } from '../store';
import React, { useEffect } from 'react';
// @ts-ignore
import JoystickController from 'joystick-controller';

type JoystickOnMove = {
	x: number;
	y: number;
	leveledX: number;
	leveledY: number;
	angle: number;
	distance: number;
};

export default function Joystick() {
	const joystick = useGameStore((state) => state.joystick);
	useEffect(() => {
		const joystickController = new JoystickController(
			{
				leftToRight: true,
				bottomToUp: true,
				radius: 48,
				maxRange: 48,
				x: '64px',
				y: '64px',
				distortion: true,
			},
			(event: JoystickOnMove) => {
				const result = { x: 0, y: 0 };
				if (event.distance > 0) {
					result.x = -event.x / joystickController.options.maxRange;
					result.y = -event.y / joystickController.options.maxRange;
				}
				joystick.x = result.x;
				joystick.y = result.y;
			},
		);
		console.log('joystickController created', joystickController);
		return () => {
			console.log('joystickController destroyed');
			joystickController.destroy();
		};
	});
	return <div className="Joystick"></div>;
}
