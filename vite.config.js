import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	build: {
		sourcemap: true,
	},
	plugins: [
		react(),
		visualizer({
			open: true,
			template: 'sunburst',
		}),
	],
});
