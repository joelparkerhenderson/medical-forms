"use strict";

exports.__esModule = true;
exports.default = void 0;
var _Printer = _interopRequireDefault(require("./Printer"));
var _virtualFs = _interopRequireDefault(require("./virtual-fs"));
var _tools = require("./helpers/tools");
var _variableType = require("./helpers/variableType");
var _URLResolver = _interopRequireDefault(require("./URLResolver"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class pdfmake {
  constructor() {
    this.virtualfs = _virtualFs.default;
    this.urlAccessPolicy = undefined;
  }

  /**
   * @param {object} docDefinition
   * @param {?object} options
   * @returns {object}
   */
  createPdf(docDefinition, options = {}) {
    if (!(0, _variableType.isObject)(docDefinition)) {
      throw new Error("Parameter 'docDefinition' has an invalid type. Object expected.");
    }
    if (!(0, _variableType.isObject)(options)) {
      throw new Error("Parameter 'options' has an invalid type. Object expected.");
    }
    options.progressCallback = this.progressCallback;
    options.tableLayouts = this.tableLayouts;
    const isServer = typeof process !== 'undefined' && process?.versions?.node;
    if (typeof this.urlAccessPolicy === 'undefined' && isServer) {
      console.warn('No URL access policy defined. Consider using setUrlAccessPolicy() to restrict external resource downloads.');
    }
    let urlResolver = new _URLResolver.default(this.virtualfs);
    urlResolver.setUrlAccessPolicy(this.urlAccessPolicy);
    let printer = new _Printer.default(this.fonts, this.virtualfs, urlResolver);
    const pdfDocumentPromise = printer.createPdfKitDocument(docDefinition, options);
    return this._transformToDocument(pdfDocumentPromise);
  }

  /**
   * @param {(url: string) => boolean} callback
   */
  setUrlAccessPolicy(callback) {
    if (callback !== undefined && typeof callback !== 'function') {
      throw new Error("Parameter 'callback' has an invalid type. Function or undefined expected.");
    }
    this.urlAccessPolicy = callback;
  }
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }
  addTableLayouts(tableLayouts) {
    this.tableLayouts = (0, _tools.pack)(this.tableLayouts, tableLayouts);
  }
  setTableLayouts(tableLayouts) {
    this.tableLayouts = tableLayouts;
  }
  clearTableLayouts() {
    this.tableLayouts = {};
  }
  addFonts(fonts) {
    this.fonts = (0, _tools.pack)(this.fonts, fonts);
  }
  setFonts(fonts) {
    this.fonts = fonts;
  }
  clearFonts() {
    this.fonts = {};
  }
  _transformToDocument(doc) {
    return doc;
  }
}
var _default = exports.default = pdfmake;