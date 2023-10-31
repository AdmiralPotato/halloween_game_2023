import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	build: {
		sourcemap: true,
	},
	plugins: [
		visualizer({
			open: true,
			template: 'sunburst',
		}),
	],
});
