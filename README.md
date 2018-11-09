# WSDOT route-select element

A custom element for selecting WSDOT routes.

[![npm](https://img.shields.io/npm/v/@wsdot/route-selector.svg?style=flat-square)](https://www.npmjs.org/package/@wsdot/route-selector)
[![npm](https://img.shields.io/npm/l/@wsdot/route-selector.svg?style=flat-square)](https://www.npmjs.org/package/@wsdot/route-selector)

## Usage

### Install

```sh
npm install @wsdot/route-selector
```

### Reference module from HTML.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>test</title>
    <!-- Import the javascript module -->
    <script src="node_modules/@wsdot/route-selector/index.mjs" type="module"></script>
  </head>
  <body>
    <route-selector id="routeSelector"></route-selector>
    <script>
      // Define routes.
      const routes = [
        "002COBROWNEi",
        "002CODIVISNi",
        "002CONEWPRTd",
        "002CONEWPRTi",
        "002d",
        "002FD00186i",
        "002FD00504d",
        "002FD00504i",
        "002FD01361d"
        // ... truncated list
      ];
      // Add value to 'routes' attribute as comma-separated list string.
      document
        .querySelector("route-selector")
        .setAttribute("routes", routes.join(","));
    </script>
  </body>
</html>
```
