import SvgAnimator from './svg-animator/index.svelte';

var app = new SvgAnimator({
  target: document.body,
  props: {
    selector: 'svg',
    svgAttributes: {viewBox: '0 0 1024 267'},
  },
});

export default app;

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    app.$destroy();
  });
}
