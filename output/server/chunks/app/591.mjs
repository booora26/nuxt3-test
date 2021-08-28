var _591$1 = {};

var id = _591$1.id = 591;
var ids = _591$1.ids = [591];
var modules = _591$1.modules = {

/***/ 646:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(199);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to SSR context
var add = __webpack_require__(703)/* .default */ .Z;
module.exports.__inject__ = function (context) {
  add("0573eae8", content, true, context);
};

/***/ }),

/***/ 591:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ layouts_default)
});

// EXTERNAL MODULE: external "vue"
var external_vue_ = __webpack_require__(103);
// EXTERNAL MODULE: external "@vue/server-renderer"
var server_renderer_ = __webpack_require__(745);




function ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${(0, server_renderer_.ssrRenderAttrs)((0, external_vue_.mergeProps)({ class: "container" }, _attrs))} data-v-5deab6a4>`);
  (0, server_renderer_.ssrRenderSlot)(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}


/* harmony default export */ const defaultvue_type_script_lang_js = ({});

 
// EXTERNAL MODULE: ./node_modules/@nuxt/webpack-builder/dist/nuxt-setup-loader.js!./node_modules/unplugin/dist/webpack/loaders/transform.cjs??ruleSet[1].rules[29].use[0]!./node_modules/unplugin/dist/webpack/loaders/transform.cjs??ruleSet[1].rules[30].use[0]!./node_modules/vue-style-loader/index.js??clonedRuleSet-38.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-38.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/vue-loader/dist/index.js??ruleSet[0]!./layouts/default.vue?vue&type=style&index=0&id=5deab6a4&lang=css&scoped=true
__webpack_require__(646);
defaultvue_type_script_lang_js.ssrRender = ssrRender;
defaultvue_type_script_lang_js.__scopeId = "data-v-5deab6a4";

/* harmony default export */ const layouts_default = (defaultvue_type_script_lang_js);

/***/ }),

/***/ 199:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "\n.container[data-v-5deab6a4] {\n    background-color: lightcoral;\n}\n\n", ""]);
// Exports
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ 645:
/***/ ((module) => {


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 703:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ addStylesServer)
});
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = [];
  var newStyles = {};
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = item[0];
    var css = item[1];
    var media = item[2];
    var sourceMap = item[3];
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    };
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] });
    } else {
      newStyles[id].parts.push(part);
    }
  }
  return styles
}


function addStylesServer (parentId, list, isProduction, context) {
  if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
    context = __VUE_SSR_CONTEXT__;
  }
  if (context) {
    if (!context.hasOwnProperty('styles')) {
      Object.defineProperty(context, 'styles', {
        enumerable: true,
        get: function() {
          return renderStyles(context._styles)
        }
      });
      // expose renderStyles for vue-server-renderer (vuejs/#6353)
      context._renderStyles = renderStyles;
    }

    var styles = context._styles || (context._styles = {});
    list = listToStyles(parentId, list);
    if (isProduction) {
      addStyleProd(styles, list);
    } else {
      addStyleDev(styles, list);
    }
  }
}

// In production, render as few style tags as possible.
// (mostly because IE9 has a limit on number of style tags)
function addStyleProd (styles, list) {
  for (var i = 0; i < list.length; i++) {
    var parts = list[i].parts;
    for (var j = 0; j < parts.length; j++) {
      var part = parts[j];
      // group style tags by media types.
      var id = part.media || 'default';
      var style = styles[id];
      if (style) {
        if (style.ids.indexOf(part.id) < 0) {
          style.ids.push(part.id);
          style.css += '\n' + part.css;
        }
      } else {
        styles[id] = {
          ids: [part.id],
          css: part.css,
          media: part.media
        };
      }
    }
  }
}

// In dev we use individual style tag for each module for hot-reload
// and source maps.
function addStyleDev (styles, list) {
  for (var i = 0; i < list.length; i++) {
    var parts = list[i].parts;
    for (var j = 0; j < parts.length; j++) {
      var part = parts[j];
      styles[part.id] = {
        ids: [part.id],
        css: part.css,
        media: part.media
      };
    }
  }
}

function renderStyles (styles) {
  var css = '';
  for (var key in styles) {
    var style = styles[key];
    css += '<style data-vue-ssr-id="' + style.ids.join(' ') + '"' +
        (style.media ? ( ' media="' + style.media + '"' ) : '') + '>' +
        style.css + '</style>';
  }
  return css
}


/***/ })

};

const _591 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), _591$1, {
  'default': _591$1,
  id: id,
  ids: ids,
  modules: modules
}));

export { _591 as _ };
