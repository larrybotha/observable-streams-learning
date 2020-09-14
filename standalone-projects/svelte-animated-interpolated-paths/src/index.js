import App from './app.svelte';

var app = new App({
  target: document.body,
  props: {
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
