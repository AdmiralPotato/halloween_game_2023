import * as UI from './UserInterface';
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

type VoidishCallback = () => void;
interface UserInputConfig {
	respawnLevelFromStringSeed: VoidishCallback;
	loadDevToolsCallback: VoidishCallback;
}

const keyButtonMap: Record<string, string | undefined> = {
	a: 'left',
	w: 'up',
	s: 'down',
	d: 'right',
	ArrowLeft: 'left',
	ArrowUp: 'up',
	ArrowDown: 'down',
	ArrowRight: 'right',
	' ': 'action',
	Enter: 'action',
};
const buttonStateMap: Record<string, boolean | undefined> = {
	left: false,
	up: false,
	down: false,
	right: false,
	action: false,
};

const buttonStateOn = (buttonName: string) => {
	if (buttonName) {
		buttonStateMap[buttonName] = true;
	}
};
const buttonStateOff = (buttonName: string) => {
	if (buttonName) {
		buttonStateMap[buttonName] = false;
	}
};

let loadDevToolsCallback: VoidishCallback | undefined;

window.addEventListener('keydown', async (keydownEvent) => {
	// hide/show the Inspector
	// Shift+Ctrl+Alt+I
	if (
		keydownEvent.shiftKey &&
		keydownEvent.ctrlKey &&
		keydownEvent.altKey &&
		keydownEvent.key === 'I' &&
		loadDevToolsCallback
	) {
		loadDevToolsCallback();
	}
	// console.log('keydownEvent', keydownEvent);
	const buttonName = keyButtonMap[keydownEvent.key];
	if (buttonName) {
		buttonStateOn(buttonName);
	}
});
window.addEventListener('keyup', (keydownEvent) => {
	// console.log('keydownEvent', keydownEvent);
	const buttonName = keyButtonMap[keydownEvent.key];
	if (buttonName) {
		buttonStateOff(buttonName);
	}
});

export const setupUserInput = (config: UserInputConfig) => {
	const { seedButton, buttonMap } = UI.init();

	loadDevToolsCallback = config.loadDevToolsCallback;

	seedButton.onPointerUpObservable.add(config.respawnLevelFromStringSeed);

	Object.entries(buttonMap).forEach(([key, button]) => {
		button?.onPointerDownObservable.add(() => buttonStateOn(key));
		button?.onPointerUpObservable.add(() => buttonStateOff(key));
	});

	return { buttonStateMap, joystick };
};
