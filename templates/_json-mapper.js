'use strict';

/**
 * Class to map an object to another object based on properties
 * The class is modified version of the 'hapi-json-view' module's 'Runtime' class
 * But unlike hapi-json-view this does not use the hapi view-engine
 * @class JsonMapper
 */
class JsonMapper {
  /**
   * Creates an instance of JsonMapper
   * @param {Object} partials - All the partial template files
   * @memberof JsonMapper
   */
  constructor(partials) {
    this.content = {};
    this.partials = partials;
  }

  /**
   * Set the value of json or a property of json
   * @param {Array} args - If the method is called with one argument then the item is the value
   * that will be set as content. Otherwise the fist item is the key and the second item is the value
   * that will be set to the key of content
   * @memberof JsonMapper
   */
  set(...args) {
    const key = args.length === 2
      ? args[0]
      : null;
    let value = args.length === 2
      ? args[1]
      : args[0];

    if (typeof value === 'function') {
      const jsonMapper = new JsonMapper(this.partials);
      value(jsonMapper);
      value = jsonMapper.content;
    }

    if (key) {
      this.content[key] = value;
    } else {
      this.content = value;
    }
  }


  /**
   * Set an object in JSON of the object exists
   * @param {string} key - The key in mapped JSON
   * @param {Object} obj - The object to be mapped
   * @param {string} partialName - The partial to be used to map objectWithSid
   * @param {string} partialKey - The key in which data will be passed for partial
   * @param {any} [defaultValue] - The value to be set if the given object doesn't exist
   */
  setIfExist(key, obj, partialName, partialKey, defaultValue) {
    if (obj) {
      this.set(key, json => {
        const partialObject = {};
        partialObject[partialKey] = obj;
        json.set(json.partial(partialName, partialObject));
      });
    } else {
      this.set(key, defaultValue);
    }
  }

  /**
   * Set an object in JSON of the object exists and have a 'sid'
   * @param {string} key - The key in mapped JSON
   * @param {Object} objWithSid - The object to be mapped, must contain 'sid' to be mapped
   * @param {string} partialName - The partial to be used to map objectWithSid
   * @param {string} partialKey - The key in which data will be passed for partial
   * @param {any} [defaultValue] - The value to be set if the given object doesn't exist or doesn't have 'sid'
   */
  setIfSidExist(key, objWithSid, partialName, partialKey, defaultValue) {
    if (objWithSid && objWithSid.sid) {
      this.set(key, json => {
        const partialObject = {};
        partialObject[partialKey] = objWithSid;
        json.set(json.partial(partialName, partialObject));
      });
    } else {
      this.set(key, defaultValue);
    }
  }

  /**
   * @callback JsonMapper~mapperCallback
   * @param {Object<JsonMapper>} jsonMapper - An instance of json mapper
   * @param {Object} item - The item to be mapper
   */

  /**
   * Set an array inside json
   * @param {Array} items - Items of the array that are to be mapped
   * @param {JsonMapper~mapperCallback} callback - The callback
   * @return {Array} - The array after mapping
   * @memberof JsonMapper
   */
  array(items, callback) {
    if (!items || !items.length) return [];

    return items.map((item) => {
      const jsonMapper = new JsonMapper(this.partials);
      callback(jsonMapper, item);

      return jsonMapper.content;
    });
  }

  /**
   * Apply a partial template to given data and return the transformed data
   * @param {string} name - Name of the partial file
   * @param {Object} data - The data to be mapped with the partial
   * @return {Object} - The mapped object
   * @memberof JsonMapper
   */
  partial(name, data) {
    const jsonMapper = new JsonMapper(this.partials);
    this.partials[name](jsonMapper, data);
    return jsonMapper.content;
  }
}

module.exports = JsonMapper;
