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
	return {
		seedButton,
	};
}
