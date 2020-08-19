//import SvgAnimator from './svg-animator/index.svelte';
import SvgAnimatorAlt from './svg-animator-alternate/index.svelte';

//var app = new SvgAnimator({
//target: document.body,
//props: {
//selector: 'svg',
//svgAttributes: {viewBox: '0 0 1024 267'},
//},
//});

var app = new SvgAnimatorAlt({
  target: document.body,
  props: {
    selector: '.js-svgs',
    svgAttributes: {viewBox: '0 0 1500 1500'},
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
