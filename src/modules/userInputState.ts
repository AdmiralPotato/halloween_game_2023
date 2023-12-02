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
	escape: 'pause',
	shift: 'shift',
};

export const setupUserInput = (buttonStateMap: Record<string, boolean | undefined>) => {
	const setButtonState = (buttonName: string, state: boolean) => {
		if (buttonStateMap[buttonName] !== undefined) {
			buttonStateMap[buttonName] = state;
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
			setButtonState(buttonName, true);
		}
	});
	window.addEventListener('keyup', (keydownEvent) => {
		// console.log('keydownEvent', keydownEvent);
		const buttonName = keyButtonMap[keydownEvent.key.toLocaleLowerCase()];
		if (buttonName) {
			setButtonState(buttonName, false);
		}
	});
	return setButtonState;
};
