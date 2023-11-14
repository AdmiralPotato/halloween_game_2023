import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	build: {
		sourcemap: true,
	},
	// Vite was optimizing the Havoc WASM out of the project!
	// Congratulations! This is how to stop it. :facepalm:
	optimizeDeps: {
		exclude: ['@babylonjs/havok'],
	},
	plugins: [
		react(),
		visualizer({
			open: true,
			template: 'sunburst',
		}),
	],
});
