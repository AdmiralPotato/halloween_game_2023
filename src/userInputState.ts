import * as UI from './UserInterface';

const keyButtonMap: Record<string, string | undefined> = {
	a: 'left',
	w: 'up',
	s: 'down',
	d: 'right',
	arrowleft: 'left',
	arrowup: 'up',
	arrowdown: 'down',
	arrowright: 'right',
	' ': 'action',
	enter: 'action',
	'`': 'camera',
	'~': 'camera',
	escape: 'seed',
	shift: 'shift',
};
const buttonStateMap: Record<string, boolean | undefined> = {
	left: false,
	up: false,
	down: false,
	right: false,
	shift: false,
	action: false,
	camera: false,
	seed: false,
	devtools: false,
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

window.addEventListener('keydown', async (keydownEvent) => {
	let buttonName = keyButtonMap[keydownEvent.key.toLocaleLowerCase()];
	// hide/show the Inspector
	// Shift+Ctrl+Alt+I
	if (
		keydownEvent.shiftKey &&
		keydownEvent.ctrlKey &&
		keydownEvent.altKey &&
		keydownEvent.key === 'I'
	) {
		buttonName = 'devTools';
	}
	// console.log('keydownEvent', keydownEvent);
	if (buttonName) {
		buttonStateOn(buttonName);
	}
});
window.addEventListener('keyup', (keydownEvent) => {
	// console.log('keydownEvent', keydownEvent);
	const buttonName = keyButtonMap[keydownEvent.key.toLocaleLowerCase()];
	if (buttonName) {
		buttonStateOff(buttonName);
	}
});

export const setupUserInput = () => {
	const { buttonMap, joystick } = UI.init();

	Object.entries(buttonMap).forEach(([key, button]) => {
		button?.onPointerDownObservable.add(() => buttonStateOn(key));
		button?.onPointerUpObservable.add(() => buttonStateOff(key));
	});

	return { buttonStateMap, joystick };
};
