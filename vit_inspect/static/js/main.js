/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"render\": () => (/* binding */ render)\n/* harmony export */ });\n//import App from './App';\n//import React from 'react';\n//import ReactDOM from 'react-dom/client';\n//import ReactDOM from \"@types/react-dom/client\";\n//import React from \"@types/react\";\n\n\n/*\nexport async function render() {\nconst root_element = Document.createElement(\"div\");\nroot_element.setAttribute(\"id\", \"root\")\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n    <React.StrictMode>\n        <App />\n    </React.StrictMode>\n);\nconst p2 = 1337;\nconst data = Promise.all([p2]).then((values) => {\n  console.log(values); // [3, 1337, \"foo\"]\n});\n}\n*/\n// Copyright 2019 The TensorFlow Authors. All Rights Reserved.\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//     http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\n// ==============================================================================\n\nasync function render() {\n  const msg = createElement('p', 'Fetching data…');\n  document.body.appendChild(msg);\n\n  const runToTags = await fetch('./tags').then((response) => response.json());\n  const data = await Promise.all(\n    Object.entries(runToTags).flatMap(([run, tagToDescription]) =>\n      Object.keys(tagToDescription).map((tag) =>\n        fetch('./greetings?' + new URLSearchParams({run, tag}))\n          .then((response) => response.json())\n          .then((greetings) => ({\n            run,\n            tag,\n            greetings,\n            description: tagToDescription[tag].description,\n          }))\n      )\n    )\n  );\n\n  const style = createElement(\n    'style',\n    `\n      thead {\n        border-bottom: 1px black solid;\n        border-top: 2px black solid;\n      }\n      tbody {\n        border-bottom: 2px black solid;\n      }\n      table {\n        border-collapse: collapse;\n      }\n      td,\n      th {\n        padding: 2pt 8pt;\n      }\n    `\n  );\n  style.innerText = style.textContent;\n  document.head.appendChild(style);\n\n  const table = createElement('table', [\n    createElement(\n      'thead',\n      createElement('tr', [\n        createElement('th', 'Run'),\n        createElement('th', 'Tag'),\n        createElement('th', 'Greetings'),\n        createElement('th', 'Description'),\n      ])\n    ),\n    createElement(\n      'tbody',\n      data.flatMap(({run, tag, greetings, description}) =>\n        greetings.map((guest, i) =>\n          createElement('tr', [\n            createElement('td', i === 0 ? run : null),\n            createElement('td', i === 0 ? tag : null),\n            createElement('td', guest),\n            createElement('td', description),\n          ])\n        )\n      )\n    ),\n  ]);\n  msg.textContent = 'Data loaded.!!!';\n  document.body.appendChild(table);\n}\n\nfunction createElement(tag, children) {\n  const result = document.createElement(tag);\n  if (children != null) {\n    if (typeof children === 'string') {\n      result.textContent = children;\n    } else if (Array.isArray(children)) {\n      for (const child of children) {\n        result.appendChild(child);\n      }\n    } else {\n      result.appendChild(children);\n    }\n  }\n  return result;\n}\n\n\n\n\n\n//# sourceURL=webpack://vit_inspect/./src/index.js?");

/***/ })

/******/ });
/************************************************************************/
/******/ // The require scope
/******/ var __webpack_require__ = {};
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = {};
/******/ __webpack_modules__["./src/index.js"](0, __webpack_exports__, __webpack_require__);
/******/ var __webpack_exports__render = __webpack_exports__.render;
/******/ export { __webpack_exports__render as render };
/******/ 
