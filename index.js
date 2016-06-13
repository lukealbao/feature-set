'use strict';

var features;
var might;
var handlers;

function FeatureSet (opts) {
  opts = opts || {};
  
  this.env = {
    enableKey: opts && opts.env && opts.env.enable
            || 'NODE_FEATURES_ENABLED',
    disableKey: opts && opts.env && opts.env.disable
            || 'NODE_FEATURES_DISABLED'
  };

  process.env[this.env.enableKey] = process.env[this.env.enableKey] || '';
  process.env[this.env.disableKey] = process.env[this.env.disableKey] || '';
  
  this.features = {};
  
  if (typeof opts.map === 'object') {
    this.fromEnv(opts.map);
  } else {
    var i, key;
    var map = {};
    var enabled = process.env[this.env.enableKey].split(',')
                  .filter(function (str) {
                    return Boolean(str);
                  });
    var disabled = process.env[this.env.disableKey].split(',')
                   .filter(function (str) {
                     return Boolean(str);
                   });
    for (i in enabled) {
      key = enabled[i]; 
      map[key] = key;
    }
    
    for (i in disabled) {
      key = disabled[i]; 
      map[key] = key;
    }

    this.fromEnv(map);
  }

  if (process.env.NODE_FEATURES_DYNAMIC) {
    this.enabled = this._dynamicEnabled;
  }
};

FeatureSet.prototype.fromEnv = function (map) {
  var enabled = process.env[this.env.enableKey].split(',')
                .filter(function (str) {
                  return Boolean(str);
                });

  var disabled = process.env[this.env.disableKey].split(',')
                 .filter(function (str) {
                   return Boolean(str);
                 });
  
  for (var key in map) {
    this.features[key] = (enabled.indexOf(key) > -1);
  }
  
  return this;
};

FeatureSet.prototype.enabled = function (key) {
  if (this.features[key] === undefined) {
    throw new TypeError('Unregistered Feature: "' + key + '"');
  }
  return this.features[key];
};

FeatureSet.prototype._dynamicEnabled = function (key) {
  return (process.env[this.env.enableKey].split(',').indexOf(key) > -1);
};


module.exports = FeatureSet;
