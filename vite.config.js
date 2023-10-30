import visualizer from 'rollup-plugin-visualizer';

export default {
	build: {
		sourcemap: true,
	},
	plugins: [
		visualizer({
			open: true,
			template: 'sunburst',
		}),
	],
};
