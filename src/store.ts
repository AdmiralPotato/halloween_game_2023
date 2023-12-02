import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GameModes =
	| 'GAMEPLAY'
	| 'MENU_MAIN'
	| 'MENU_OPTIONS'
	| 'MENU_PAUSE'
	| 'MENU_CREDITS'
	| 'GAME_OVER';

export interface Point {
	x: number;
	y: number;
}

interface GameState {
	candies: number;
	timeRemaining: number;
	resolutionScale: number;
	buttonStateMap: Record<string, boolean | undefined>;
	joystick: Point;
	lastMode: GameModes | null;
	mode: GameModes | null;
	seed: string;
	tickGame: () => void;
	startGame: (seed: string) => void;
	pauseGame: () => void;
	resumeGame: () => void;
	menuBack: () => void;
	showOptions: () => void;
	showMainMenu: () => void;
	showCredits: () => void;
	gameOver: () => void;
	reset: () => void;
	addCandy: (value: number) => void;
	setResolution: (value: number) => void;
}

let timerInterval: number = 0;
export const useGameStore = create<GameState>()(
	subscribeWithSelector((set, get) => ({
		candies: 0,
		timeRemaining: 0,
		resolutionScale: 1,
		mode: 'MENU_MAIN',
		seed: 'bob',
		lastMode: null,
		buttonStateMap: {
			left: false,
			up: false,
			down: false,
			right: false,
			shift: false,
			action: false,
			camera: false,
			pause: false,
			devTools: false,
		},
		joystick: { x: 0, y: 0 },
		reset: () =>
			set(() => {
				clearInterval(timerInterval);
				return {
					candies: 0,
					timeRemaining: 0,
					mode: 'MENU_MAIN',
				};
			}),
		startGame: (seed: string) =>
			set(() => {
				clearInterval(timerInterval);
				timerInterval = setInterval(get().tickGame, 1000) as unknown as number; // thanks typescript
				return { seed, candies: 0, mode: 'GAMEPLAY', timeRemaining: 60 };
			}),
		showMainMenu: () =>
			set(() => {
				clearInterval(timerInterval);
				return { mode: 'MENU_MAIN' };
			}),
		pauseGame: () =>
			set(() => {
				clearInterval(timerInterval);
				return { mode: 'MENU_PAUSE' };
			}),
		resumeGame: () =>
			set(() => {
				clearInterval(timerInterval);
				timerInterval = setInterval(get().tickGame, 1000) as unknown as number; // thanks typescript
				return { mode: 'GAMEPLAY' };
			}),
		menuBack: () =>
			set(() => {
				return {
					lastMode: null,
					mode: get().lastMode,
				};
			}),
		showOptions: () =>
			set(() => {
				return {
					lastMode: get().mode,
					mode: 'MENU_OPTIONS',
				};
			}),
		showCredits: () =>
			set(() => {
				return {
					lastMode: get().mode,
					mode: 'MENU_CREDITS',
				};
			}),
		tickGame: () =>
			set((state) => {
				const timeRemaining = state.timeRemaining - 1;
				if (timeRemaining <= 0) {
					get().gameOver();
				}
				return {
					timeRemaining,
				};
			}),
		gameOver: () =>
			set(() => {
				clearInterval(timerInterval);
				return { mode: 'GAME_OVER' };
			}),
		addCandy: (value) => set((state) => ({ candies: state.candies + value })),
		setResolution: (value) => set(() => ({ resolutionScale: value })),
	})),
);
