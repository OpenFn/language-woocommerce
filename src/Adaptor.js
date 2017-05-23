import { execute as commonExecute, expandReferences } from 'language-common';
import { getThenPost, clientPost } from './Client';
import request from 'request';
import { resolve as resolveUrl } from 'url';
import WooCommerceAPI from 'woocommerce-api';

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
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
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
export function fetch(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const {consumerKey,url,consumerSecret,wpAPI,version} = state.configuration;

    const { endpoint, postUrl } = expandReferences(params)(state);

    var WooCommerce = new WooCommerceAPI({
        url,
        consumerKey,
        consumerSecret,
        wpAPI,
        version
    });

    console.log(WooCommerce)

    WooCommerce.get(
      endpoint,
      function(error, response, body) {

        console.log(body)
        console.log(postUrl)
        request.post ({
          url: postUrl,
          json: response
        }, function(error, response, postResponseBody){
          error = assembleError({error, response})
          if (error) {
            console.error("POST failed.")
            throw(error);
          } else {
            console.log("POST succeeded.");
            return body;
          }
        })

      })

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
export function oldFetch(params) {

  return state => {

    const { getEndpoint, query, postUrl } = expandReferences(params)(state);

    const { username, password, baseUrl, authType } = state.configuration;

    var sendImmediately = authType == 'digest' ? false : true;

    const url = resolveUrl(baseUrl + '/', getEndpoint)

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    return getThenPost({ username, password, query, url, sendImmediately, postUrl })
    .then((response) => {
      console.log("Success:", response);
      let result = (typeof response === 'object') ? response : JSON.parse(response);
      return { ...state, references: [ result, ...state.references ] }
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
