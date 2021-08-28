var _193$1 = {};

var id = _193$1.id = 193;
var ids = _193$1.ids = [193];
var modules = _193$1.modules = {

/***/ 193:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ _id_)
});

// EXTERNAL MODULE: external "@vue/server-renderer"
var server_renderer_ = __webpack_require__(745);



function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${(0, server_renderer_.ssrRenderAttrs)(_attrs)}>${(0, server_renderer_.ssrInterpolate)(_ctx.$route.params.client)} ${(0, server_renderer_.ssrInterpolate)(_ctx.$route.params.id)}</div>`);
}


/* harmony default export */ const _id_vue_type_script_lang_js = ({
  layout: "custom"
});




_id_vue_type_script_lang_js.ssrRender = ssrRender;

/* harmony default export */ const _id_ = (_id_vue_type_script_lang_js);

/***/ })

};

const _193 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), _193$1, {
  'default': _193$1,
  id: id,
  ids: ids,
  modules: modules
}));

export { _193 as _ };
