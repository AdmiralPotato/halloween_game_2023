import { useGameStore } from '../store';
import React from 'react';

export default function UiModeMenuCredits() {
	const menuBack = useGameStore((state) => state.menuBack);
	return (
		<div className="UiModeMenuCredits menu">
			<h1>Credits</h1>
			<p>
				All 3D models and animation thanks to
				<br />
				<a
					href="https://github.com/corfidbizna"
					target="_blank"
					rel="noreferrer"
				>
					Corfid Bizna
				</a>
			</p>
			<p>
				Procedural level generation thanks to
				<br />
				<a
					href="https://github.com/alamedyang"
					target="_blank"
					rel="noreferrer"
				>
					Alamedyang
				</a>
			</p>
			<p>
				State management, glue code, and graphics programming by
				<br />
				<a
					href="https://github.com/AdmiralPotato"
					target="_blank"
					rel="noreferrer"
				>
					Admiral Potato
				</a>
			</p>
			<p>
				Music by
				<br />
				<a
					href="https://github.com/TazHinkle"
					target="_blank"
					rel="noreferrer"
				>
					Taz Hinkle
				</a>
			</p>
			<button
				className="full-width"
				onClick={menuBack}
			>
				Back
			</button>
		</div>
	);
}
