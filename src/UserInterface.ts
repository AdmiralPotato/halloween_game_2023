import { NullEngineOptions } from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui';

export function init() {
	const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
	const seedButton = Button.CreateSimpleButton('seedButton', 'Enter Seed');
	seedButton.width = '128px';
	seedButton.height = '48px';
	seedButton.verticalAlignment = 0;
	seedButton.horizontalAlignment = 0;
	seedButton.color = 'white';
	seedButton.cornerRadius = 4;
	seedButton.background = '#666';
	seedButton.paddingTop = 8;
	seedButton.paddingBottom = 8;
	seedButton.paddingLeft = 8;
	seedButton.paddingRight = 8;
	advancedTexture.addControl(seedButton);

	const buttonConfigs = [
		/*
		{ symbol: '↑', key: 'w', x: -64, y: -64, name: 'up' },
		{ symbol: '→', key: 'd', x: 0, y: 0, name: 'right' },
		{ symbol: '↓', key: 's', x: -64, y: 0, name: 'down' },
		{ symbol: '←', key: 'a', x: -128, y: 0, name: 'left' },
		*/
		{ symbol: '↲', key: 'Space', x: -24, y: -24, name: 'action', alignX: 1, alignY: 1 },
	];
	const buttonMap: Record<string, Button | null> = {
		up: <Button | null>null,
		right: <Button | null>null,
		down: <Button | null>null,
		left: <Button | null>null,
		action: <Button | null>null,
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
		seedButton,
		buttonMap,
	};
}
