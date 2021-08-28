import destr from 'destr';
import defu from 'defu';

const runtimeConfig = {"public":{"app":{"basePath":"/","assetsPath":"/_nuxt/","cdnURL":null}},"private":{}};
for (const type of ["private", "public"]) {
  for (const key in runtimeConfig[type]) {
    runtimeConfig[type][key] = destr(process.env[key] || runtimeConfig[type][key]);
  }
}
defu(runtimeConfig.private, runtimeConfig.public);

function createMapper(clientManifest) {
  const map = createMap(clientManifest);
  return function mapper(moduleIds) {
    const res = new Set();
    for (let i = 0; i < moduleIds.length; i++) {
      const mapped = map.get(moduleIds[i]);
      if (mapped) {
        for (let j = 0; j < mapped.length; j++) {
          res.add(mapped[j]);
        }
      }
    }
    return Array.from(res);
  };
}
function createMap(clientManifest) {
  const map = new Map();
  Object.keys(clientManifest.modules).forEach((id) => {
    map.set(id, mapIdToFile(id, clientManifest));
  });
  return map;
}
function mapIdToFile(id, clientManifest) {
  const files = [];
  const fileIndices = clientManifest.modules[id];
  if (fileIndices) {
    fileIndices.forEach((index) => {
      const file = clientManifest.all[index];
      if (clientManifest.async.includes(file) || !/\.(js|cjs|mjs|css)($|\?)/.test(file)) {
        files.push(file);
      }
    });
  }
  return files;
}

const IS_JS_RE = /\.[cm]?js(\?[^.]+)?$/;
const IS_MODULE_RE = /\.mjs(\?[^.]+)?$/;
const HAS_EXT_RE = /[^./]+\.[^./]+$/;
const IS_CSS_RE = /\.css(\?[^.]+)?$/;
function isJS(file) {
  return IS_JS_RE.test(file) || !HAS_EXT_RE.test(file);
}
function isModule(file) {
  return IS_MODULE_RE.test(file) || !HAS_EXT_RE.test(file);
}
function isCSS(file) {
  return IS_CSS_RE.test(file);
}
function normalizeFile(file) {
  const withoutQuery = file.replace(/\?.*/, "");
  const extension = withoutQuery.split(".").pop() || "";
  return {
    file,
    extension,
    fileWithoutQuery: withoutQuery,
    asType: getPreloadType(extension)
  };
}
function ensureTrailingSlash(path) {
  if (path === "") {
    return path;
  }
  return path.replace(/([^/])$/, "$1/");
}
function getPreloadType(ext) {
  if (ext === "js" || ext === "cjs" || ext === "mjs") {
    return "script";
  } else if (ext === "css") {
    return "style";
  } else if (/jpe?g|png|svg|gif|webp|ico/.test(ext)) {
    return "image";
  } else if (/woff2?|ttf|otf|eot/.test(ext)) {
    return "font";
  } else {
    return "";
  }
}

function createRenderContext({ clientManifest, publicPath, basedir }) {
  const renderContext = {
    clientManifest,
    publicPath,
    basedir
  };
  if (renderContext.clientManifest) {
    renderContext.publicPath = renderContext.publicPath || renderContext.clientManifest.publicPath;
    renderContext.preloadFiles = (renderContext.clientManifest.initial || []).map(normalizeFile);
    renderContext.prefetchFiles = (renderContext.clientManifest.async || []).map(normalizeFile);
    renderContext.mapFiles = createMapper(renderContext.clientManifest);
  }
  renderContext.publicPath = ensureTrailingSlash(renderContext.publicPath || "/");
  return renderContext;
}
function renderStyles(ssrContext, renderContext) {
  const initial = renderContext.preloadFiles || [];
  const async = getUsedAsyncFiles(ssrContext, renderContext) || [];
  const cssFiles = initial.concat(async).filter(({ file }) => isCSS(file));
  return cssFiles.map(({ file }) => {
    return `<link rel="stylesheet" href="${renderContext.publicPath}${file}">`;
  }).join("");
}
function renderResourceHints(ssrContext, renderContext) {
  return renderPreloadLinks(ssrContext, renderContext) + renderPrefetchLinks(ssrContext, renderContext);
}
function renderPreloadLinks(ssrContext, renderContext) {
  const files = getPreloadFiles(ssrContext, renderContext);
  const shouldPreload = renderContext.shouldPreload;
  if (files.length) {
    return files.map(({ file, extension, fileWithoutQuery, asType }) => {
      let extra = "";
      if (!shouldPreload && asType !== "script" && asType !== "style") {
        return "";
      }
      if (shouldPreload && !shouldPreload(fileWithoutQuery, asType)) {
        return "";
      }
      if (asType === "font") {
        extra = ` type="font/${extension}" crossorigin`;
      }
      return `<link rel="${isModule(file) ? "modulepreload" : "preload"}" href="${renderContext.publicPath}${file}"${asType !== "" ? ` as="${asType}"` : ""}${extra}>`;
    }).join("");
  } else {
    return "";
  }
}
function renderPrefetchLinks(ssrContext, renderContext) {
  const shouldPrefetch = renderContext.shouldPrefetch;
  if (renderContext.prefetchFiles) {
    const usedAsyncFiles = getUsedAsyncFiles(ssrContext, renderContext);
    const alreadyRendered = (file) => {
      return usedAsyncFiles && usedAsyncFiles.some((f) => f.file === file);
    };
    return renderContext.prefetchFiles.map(({ file, fileWithoutQuery, asType }) => {
      if (shouldPrefetch && !shouldPrefetch(fileWithoutQuery, asType)) {
        return "";
      }
      if (alreadyRendered(file)) {
        return "";
      }
      return `<link ${isModule(file) ? 'type="module" ' : ""}rel="prefetch" href="${renderContext.publicPath}${file}">`;
    }).join("");
  } else {
    return "";
  }
}
function renderScripts(ssrContext, renderContext) {
  if (renderContext.clientManifest && renderContext.preloadFiles) {
    const initial = renderContext.preloadFiles.filter(({ file }) => isJS(file));
    if (!initial.length) {
      return "";
    }
    const async = (getUsedAsyncFiles(ssrContext, renderContext) || []).filter(({ file }) => isJS(file));
    const needed = [initial[0]].concat(async, initial.slice(1));
    return needed.map(({ file }) => {
      return `<script${isModule(file) ? ' type="module"' : ""} src="${renderContext.publicPath}${file}" defer><\/script>`;
    }).join("");
  } else {
    return "";
  }
}
function getPreloadFiles(ssrContext, renderContext) {
  const usedAsyncFiles = getUsedAsyncFiles(ssrContext, renderContext);
  if (renderContext.preloadFiles || usedAsyncFiles) {
    return (renderContext.preloadFiles || []).concat(usedAsyncFiles || []);
  } else {
    return [];
  }
}
function getUsedAsyncFiles(ssrContext, renderContext) {
  if (!ssrContext._mappedFiles && ssrContext._registeredComponents && renderContext.mapFiles) {
    const registered = Array.from(ssrContext._registeredComponents);
    ssrContext._mappedFiles = renderContext.mapFiles(registered).map(normalizeFile);
  }
  return ssrContext._mappedFiles || [];
}
function createRenderer(createApp, renderOptions) {
  const renderContext = createRenderContext(renderOptions);
  return {
    async renderToString(ssrContext) {
      ssrContext._registeredComponents = ssrContext._registeredComponents || new Set();
      const _createApp = await Promise.resolve(createApp).then((r) => r.default || r);
      const app = await _createApp(ssrContext);
      const html = await renderOptions.renderToString(app, ssrContext);
      const wrap = (fn) => () => fn(ssrContext, renderContext);
      return {
        html,
        renderResourceHints: wrap(renderResourceHints),
        renderStyles: wrap(renderStyles),
        renderScripts: wrap(renderScripts)
      };
    }
  };
}

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
const unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
const reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
const escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  const counts = new Map();
  let logNum = 0;
  function log(message) {
    if (logNum < 100) {
      console.warn(message);
      logNum += 1;
    }
  }
  function walk(thing) {
    if (typeof thing === "function") {
      log(`Cannot stringify a function ${thing.name}`);
      return;
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          const proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            if (typeof thing.toJSON !== "function") {
              log(`Cannot stringify arbitrary non-POJOs ${thing.constructor.name}`);
            }
          } else if (Object.getOwnPropertySymbols(thing).length > 0) {
            log(`Cannot stringify POJOs with symbolic keys ${Object.getOwnPropertySymbols(thing).map((symbol) => symbol.toString())}`);
          } else {
            Object.keys(thing).forEach((key) => walk(thing[key]));
          }
      }
    }
  }
  walk(value);
  const names = new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b) => b[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    const type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify(thing.valueOf())})`;
      case "RegExp":
        return thing.toString();
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = thing.map((v, i) => i in thing ? stringify(v) : "");
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify).join(",")}])`;
      default:
        if (thing.toJSON) {
          let json = thing.toJSON();
          if (getType(json) === "String") {
            try {
              json = JSON.parse(json);
            } catch (e) {
            }
          }
          return stringify(json);
        }
        if (Object.getPrototypeOf(thing) === null) {
          if (Object.keys(thing).length === 0) {
            return "Object.create(null)";
          }
          return `Object.create(null,{${Object.keys(thing).map((key) => `${safeKey(key)}:{writable:true,enumerable:true,value:${stringify(thing[key])}}`).join(",")}})`;
        }
        return `{${Object.keys(thing).map((key) => `${safeKey(key)}:${stringify(thing[key])}`).join(",")}}`;
    }
  }
  const str = stringify(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (isPrimitive(thing)) {
        values.push(stringifyPrimitive(thing));
        return;
      }
      const type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify(v)}`);
          });
          break;
        case "Set":
          values.push("new Set");
          statements.push(`${name}.${Array.from(thing).map((v) => `add(${stringify(v)})`).join(".")}`);
          break;
        case "Map":
          values.push("new Map");
          statements.push(`${name}.${Array.from(thing).map(([k, v]) => `set(${stringify(k)}, ${stringify(v)})`).join(".")}`);
          break;
        default:
          values.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach((key) => {
            statements.push(`${name}${safeProp(key)}=${stringify(thing[key])}`);
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(";")}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function getName(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string") {
    return stringifyString(thing);
  }
  if (thing === void 0) {
    return "void 0";
  }
  if (thing === 0 && 1 / thing < 0) {
    return "-0";
  }
  const str = String(thing);
  if (typeof thing === "number") {
    return str.replace(/^(-)?0\./, "$1.");
  }
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? `.${key}` : `[${escapeUnsafeChars(JSON.stringify(key))}]`;
}
function stringifyString(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}

const htmlTemplate = (params) => `<!DOCTYPE html>
<html ${params.HTML_ATTRS}>

<head ${params.HEAD_ATTRS}>
  ${params.HEAD}
</head>

<body ${params.BODY_ATTRS}>
  ${params.APP}
</body>

</html>
`;

const STATIC_ASSETS_BASE = "/Users/boris/Desktop/vue/nuxt3-proba/dist" + "/" + "1630157337";
const PAYLOAD_JS = "/payload.js";
const getClientManifest = cachedImport(() => import('./client.manifest.mjs'));
const getSSRApp = cachedImport(() => import('./server.mjs'));
const getSSRRenderer = cachedResult(async () => {
  const clientManifest = await getClientManifest();
  if (!clientManifest) {
    throw new Error("client.manifest is missing");
  }
  const createSSRApp = await getSSRApp();
  if (!createSSRApp) {
    throw new Error("Server bundle is missing");
  }
  const { renderToString: renderToString2 } = await import('./vue3.mjs').then(function (n) { return n.v; });
  return createRenderer(createSSRApp, { clientManifest, renderToString: renderToString2 }).renderToString;
});
const getSPARenderer = cachedResult(async () => {
  const clientManifest = await getClientManifest();
  return (ssrContext) => {
    ssrContext.nuxt = {};
    return {
      html: '<div id="__nuxt"></div>',
      renderResourceHints: () => "",
      renderStyles: () => "",
      renderScripts: () => clientManifest.initial.map((s) => {
        const isMJS = !s.endsWith(".js");
        return `<script ${isMJS ? 'type="module"' : ""} src="${clientManifest.publicPath}${s}"><\/script>`;
      }).join("")
    };
  };
});
function renderToString(ssrContext) {
  const getRenderer = ssrContext.noSSR ? getSPARenderer : getSSRRenderer;
  return getRenderer().then((renderToString2) => renderToString2(ssrContext)).catch((err) => {
    console.warn("Server Side Rendering Error:", err);
    return getSPARenderer().then((renderToString2) => renderToString2(ssrContext));
  });
}
async function renderMiddleware(req, res) {
  let url = req.url;
  let isPayloadReq = false;
  if (url.startsWith(STATIC_ASSETS_BASE) && url.endsWith(PAYLOAD_JS)) {
    isPayloadReq = true;
    url = url.substr(STATIC_ASSETS_BASE.length, url.length - STATIC_ASSETS_BASE.length - PAYLOAD_JS.length);
  }
  const ssrContext = {
    url,
    req,
    res,
    runtimeConfig,
    noSSR: req.spa || req.headers["x-nuxt-no-ssr"],
    ...req.context || {}
  };
  const rendered = await renderToString(ssrContext);
  if (ssrContext.error) {
    throw ssrContext.error;
  }
  if (ssrContext.redirected || res.writableEnded) {
    return;
  }
  if (ssrContext.nuxt.hooks) {
    await ssrContext.nuxt.hooks.callHook("app:rendered");
  }
  const payload = ssrContext.payload || ssrContext.nuxt;
  let data;
  if (isPayloadReq) {
    data = renderPayload(payload, url);
    res.setHeader("Content-Type", "text/javascript;charset=UTF-8");
  } else {
    data = await renderHTML(payload, rendered, ssrContext);
    res.setHeader("Content-Type", "text/html;charset=UTF-8");
  }
  const error = ssrContext.nuxt && ssrContext.nuxt.error;
  res.statusCode = error ? error.statusCode : 200;
  res.end(data, "utf-8");
}
async function renderHTML(payload, rendered, ssrContext) {
  const state = `<script>window.__NUXT__=${devalue(payload)}<\/script>`;
  const html = rendered.html;
  if ("renderMeta" in ssrContext) {
    rendered.meta = await ssrContext.renderMeta?.();
  }
  const {
    htmlAttrs = "",
    bodyAttrs = "",
    headAttrs = "",
    headTags = "",
    bodyScriptsPrepend = "",
    bodyScripts = ""
  } = rendered.meta || {};
  return htmlTemplate({
    HTML_ATTRS: htmlAttrs,
    HEAD_ATTRS: headAttrs,
    HEAD: headTags + rendered.renderResourceHints() + rendered.renderStyles() + (ssrContext.styles || ""),
    BODY_ATTRS: bodyAttrs,
    APP: bodyScriptsPrepend + html + state + rendered.renderScripts() + bodyScripts
  });
}
function renderPayload(payload, url) {
  return `__NUXT_JSONP__("${url}", ${devalue(payload)})`;
}
function _interopDefault(e) {
  return e && typeof e === "object" && "default" in e ? e.default : e;
}
function cachedImport(importer) {
  return cachedResult(() => importer().then(_interopDefault).catch((err) => {
    if (err.code === "ERR_MODULE_NOT_FOUND") {
      return null;
    }
    throw err;
  }));
}
function cachedResult(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}

export { renderMiddleware };
