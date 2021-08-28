import { s as serverRenderer } from '../index.mjs';

var vue3$1 = {};

Object.defineProperty(vue3$1, "__esModule", {
  value: true
});
var renderToString_1 = vue3$1.renderToString = void 0;

var _serverRenderer = serverRenderer.exports;

const renderToString = (...args) => {
  return (0, _serverRenderer.renderToString)(...args).then(result => `<div id="__nuxt">${result}</div>`);
};

renderToString_1 = vue3$1.renderToString = renderToString;

const vue3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), vue3$1, {
  get renderToString () { return renderToString_1; },
  'default': vue3$1
}));

export { vue3 as v };
