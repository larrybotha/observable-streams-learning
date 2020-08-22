<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [pelte-index](#pelte-index)
      - [Usage: Javascript (assumes es module)](#usage-javascript-assumes-es-module)
      - [Usage: Legacy Javascript](#usage-legacy-javascript)
      - [Usage: Web Component (aka. Custom Element)](#usage-web-component-aka-custom-element)
      - [Svelte Component](#svelte-component)
      - [Pelte](#pelte)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# pelte-index
pelte-index is a vanilla javascript component which will work in any frontend framework. You can install from npm like this:

```text
npm install --save pelte-index
```

#### Usage: Javascript (assumes es module) 
```javascript
import index from 'pelte-index'

let index = new index({target:document.body, props: { selector: 'Init Value' });
index.selector = 'Updated Value'; 
// Other props: svgAttributes, tweenConfig, maxDelay
```

The "target" is where the component is created. Here it is added to the html body with "document.body", but it could also be document.getElementById('id-of-html-element'). 

You initialize properties with "props" and you can change the prop values by just assigning the props to new values - this will be updated in the UI. 

#### Usage: Legacy Javascript
Below you can see how to use the component with vanilla js.
```html
...
<head>
  ...
  <script src="https://unpkg.com/pelte-index@0.0.1/index.js"></script>
</head>
<body>
  <script>
    let index = new index({target:document.body})
  </script>
</body>
```

#### Usage: Web Component (aka. Custom Element)
You can use it as a web component.
```html
<head>
  <script src="https://unpkg.com/pelte-index@0.0.1/index.js"></script>
</head>
<body>
  <name-of-ce selector="Init Value" />    
</body>
```
WARNING: The author of the component needs to add <svelte:options tag="name-of-ce"/>.
#### Svelte Component
```html
<script>
  import index from 'pelte-index';
</script>
<index/>
```

#### Pelte
This component was created by [pelte](https://www.npmjs.com/package/publish-svelte) (aka publish-svelte)