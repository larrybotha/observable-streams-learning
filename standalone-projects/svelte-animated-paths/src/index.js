import SvgAnimator from './svg-wave-animator/index.svelte';

var app = new SvgAnimator({
  target: document.body,
  props: {
    selector: '.js-svgs',
    svgAttributes: {viewBox: '0 0 1920 650'},
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
