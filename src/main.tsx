import React from 'react';
import ReactDOM from 'react-dom/client';
import GameView from './components/GameView';
import Joystick from './components/Joystick';
import './styles.css';
import UserInterface from './components/UserInterface';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<div>
		<GameView />
		<UserInterface />
		<Joystick />
	</div>,
);
