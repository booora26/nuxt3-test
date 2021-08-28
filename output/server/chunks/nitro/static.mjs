import { createError } from 'h3';
import { withLeadingSlash, withoutTrailingSlash, parseURL } from 'ufo';
import { promises } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const assets = {
  "/_nuxt/1697426.js": {
    "type": "application/javascript",
    "etag": "\"a95-CObF+p5qy9QHYOwAAfK15Ly5euk\"",
    "mtime": "2021-08-28T13:29:03.637Z",
    "path": "../public/_nuxt/1697426.js"
  },
  "/_nuxt/37fadc2.js": {
    "type": "application/javascript",
    "etag": "\"138-ZueSzUcZpd1/nUbLM19OPadEkAY\"",
    "mtime": "2021-08-28T13:29:03.636Z",
    "path": "../public/_nuxt/37fadc2.js"
  },
  "/_nuxt/7e07278.js": {
    "type": "application/javascript",
    "etag": "\"10e-80Iemd34aNvuRcjdIawNfKZJB9c\"",
    "mtime": "2021-08-28T13:29:03.633Z",
    "path": "../public/_nuxt/7e07278.js"
  },
  "/_nuxt/ac11872.js": {
    "type": "application/javascript",
    "etag": "\"130-CSXgtbRt6YmVUVfXFxBHHyCTIgI\"",
    "mtime": "2021-08-28T13:29:03.623Z",
    "path": "../public/_nuxt/ac11872.js"
  },
  "/_nuxt/bcaf292.js": {
    "type": "application/javascript",
    "etag": "\"e9a-AsnOOqUz67wQWzWgt9CXWiGB6qE\"",
    "mtime": "2021-08-28T13:29:03.622Z",
    "path": "../public/_nuxt/bcaf292.js"
  },
  "/_nuxt/dc3566c.js": {
    "type": "application/javascript",
    "etag": "\"f1-VH/zvM132OyvyJ31Ju1LlYciqu4\"",
    "mtime": "2021-08-28T13:29:03.617Z",
    "path": "../public/_nuxt/dc3566c.js"
  },
  "/_nuxt/dc9eafc.js": {
    "type": "application/javascript",
    "etag": "\"2e323-4KZIo9EEuJXKerslx9oarOnYyD0\"",
    "mtime": "2021-08-28T13:29:03.613Z",
    "path": "../public/_nuxt/dc9eafc.js"
  },
  "/_nuxt/ef4ae65.js": {
    "type": "application/javascript",
    "etag": "\"5b2-g6CJx0olHv95IHHbO4pVQIUfPuo\"",
    "mtime": "2021-08-28T13:29:03.605Z",
    "path": "../public/_nuxt/ef4ae65.js"
  },
  "/_nuxt/f84eae4.js": {
    "type": "application/javascript",
    "etag": "\"e78-oBFlr8NEIUmwg4ppJPoWoQ+aM60\"",
    "mtime": "2021-08-28T13:29:03.600Z",
    "path": "../public/_nuxt/f84eae4.js"
  }
};

const mainDir = dirname(fileURLToPath(globalThis.entryURL));

function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path))
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const PUBLIC_PATH = "/_nuxt/";
const TWO_DAYS = 2 * 60 * 60 * 24;
async function serveStatic(req, res) {
  if (!METHODS.includes(req.method)) {
    return;
  }
  let id = withLeadingSlash(withoutTrailingSlash(parseURL(req.url).pathname));
  let asset = getAsset(id);
  if (!asset) {
    const _id = id + "/index.html";
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
    }
  }
  if (!asset) {
    if (id.startsWith(PUBLIC_PATH)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    res.statusCode = 304;
    return res.end("Not Modified (etag)");
  }
  const ifModifiedSinceH = req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      res.statusCode = 304;
      return res.end("Not Modified (mtime)");
    }
  }
  if (asset.type) {
    res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    res.setHeader("Last-Modified", asset.mtime);
  }
  if (id.startsWith(PUBLIC_PATH)) {
    res.setHeader("Cache-Control", `max-age=${TWO_DAYS}, immutable`);
  }
  const contents = await readAsset(id);
  return res.end(contents);
}

export { serveStatic as default };
