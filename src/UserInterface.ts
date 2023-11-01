import { AdvancedDynamicTexture, Button } from '@babylonjs/gui';
// @ts-ignore
import JoystickController from 'joystick-controller';

const joystick = new JoystickController({
	leftToRight: true,
	bottomToUp: true,
	radius: 48,
	maxRange: 48,
	x: '64px',
	y: '64px',
	distortion: true,
});

export function init() {
	const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
	const buttonConfigs = [
		{ symbol: '🍬', x: -24, y: -24, name: 'action', alignX: 1, alignY: 1 },
		{ symbol: '🎥', x: 8, y: 8, name: 'camera', alignX: 0, alignY: 0 },
		{ symbol: '🌱', x: -8, y: 8, name: 'seed', alignX: 1, alignY: 0 },
	];
	const buttonMap: Record<string, Button | null> = {
		action: <Button | null>null,
		camera: <Button | null>null,
		seed: <Button | null>null,
	};
	buttonConfigs.forEach((config) => {
		const button = Button.CreateSimpleButton(config.name, config.symbol);
		button.width = '64px';
		button.height = '64px';
		button.top = config.y;
		button.left = config.x;
		button.verticalAlignment = config.alignY !== undefined ? config.alignY : 1;
		button.horizontalAlignment = config.alignX !== undefined ? config.alignX : 1;
		button.color = 'white';
		button.cornerRadius = 8;
		button.background = '#406';
		button.paddingTop = 4;
		button.paddingBottom = 4;
		button.paddingLeft = 4;
		button.paddingRight = 4;
		buttonMap[config.name] = button;
		advancedTexture.addControl(button);
	});

	return {
		buttonMap,
		joystick,
	};
}
