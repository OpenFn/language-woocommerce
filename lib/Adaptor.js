'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetch = fetch;
exports.oldFetch = oldFetch;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _Client = require('./Client');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

var _woocommerceApi = require('woocommerce-api');

var _woocommerceApi2 = _interopRequireDefault(_woocommerceApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

/**
 * Make a GET request from WooCommerce and POST it somewhere else
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function fetch(params) {

  return function (state) {

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _state$configuration = state.configuration,
        consumerKey = _state$configuration.consumerKey,
        url = _state$configuration.url,
        consumerSecret = _state$configuration.consumerSecret,
        wpAPI = _state$configuration.wpAPI,
        version = _state$configuration.version;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        endpoint = _expandReferences.endpoint,
        postUrl = _expandReferences.postUrl;

    var WooCommerce = new _woocommerceApi2.default({
      url: url,
      consumerKey: consumerKey,
      consumerSecret: consumerSecret,
      wpAPI: wpAPI,
      version: version
    });

    console.log(WooCommerce);

    WooCommerce.get(endpoint, function (error, response, body) {

      console.log(body);
      console.log(postUrl);
      _request2.default.post({
        url: postUrl,
        json: response
      }, function (error, response, postResponseBody) {
        error = assembleError({ error: error, response: response });
        if (error) {
          console.error("POST failed.");
          throw error;
        } else {
          console.log("POST succeeded.");
          return body;
        }
      });
    });
  };
};

/**
 * Make a GET request and POST it somewhere else
 * @example
 * execute(
 *   fetch(params)
 * )(state)
 * @constructor
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
function oldFetch(params) {

  return function (state) {
    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        getEndpoint = _expandReferences2.getEndpoint,
        query = _expandReferences2.query,
        postUrl = _expandReferences2.postUrl;

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        baseUrl = _state$configuration2.baseUrl,
        authType = _state$configuration2.authType;


    var sendImmediately = authType == 'digest' ? false : true;

    var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    return (0, _Client.getThenPost)({ username: username, password: password, query: query, url: url, sendImmediately: sendImmediately, postUrl: postUrl }).then(function (response) {
      console.log("Success:", response);
      var result = (typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' ? response : JSON.parse(response);
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}
