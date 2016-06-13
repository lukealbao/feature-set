'use strict';

var expect = require('chai').expect;
var FeatureSet = require(__dirname + '/..');

describe('Public API', function () {
  beforeEach(function () {
    process.env.NODE_FEATURES_ENABLED = undefined;
    process.env.NODE_FEATURES_DISABLED = undefined;
  });
  describe('Constructor(opts)', function () {
    it('opts.env.enable defaults to NODE_FEATURES_ENABLED', function () {
      var defaults = new FeatureSet();
      var custom = new FeatureSet({env: {enable: 'custom'}});

      expect(defaults.env.enableKey).to.equal('NODE_FEATURES_ENABLED');
      expect(custom.env.enableKey).to.equal('custom');      
    });

    it('opts.env.disable defaults to NODE_FEATURES_DISABLED', function () {
      var defaults = new FeatureSet();
      var custom = new FeatureSet({env: {disable: 'custom'}});

      expect(defaults.env.disableKey).to.equal('NODE_FEATURES_DISABLED');
      expect(custom.env.disableKey).to.equal('custom');      
    });

    it('opts.map registers feature keys and maps them to opts.env',
       function () {
         process.env.NODE_FEATURES_ENABLED = 'a,b';
         process.env.NODE_FEATURES_DISABLED = 'c,d';

         var fs = new FeatureSet({
           map: {a: 'a', b: 'b', c: 'c', d: 'd'}
         });

         expect(fs.enabled('a')).to.equal(true);
         expect(fs.enabled('b')).to.equal(true);
         expect(fs.enabled('c')).to.equal(false);
         expect(fs.enabled('d')).to.equal(false);
       });

    it('If !opts.map, registers keys directly from opts.env', function () {
      process.env.NODE_FEATURES_ENABLED = 'a,b';
      process.env.NODE_FEATURES_DISABLED = 'c,d';

      var fs = new FeatureSet();

      expect(fs.enabled('a')).to.equal(true);
      expect(fs.enabled('b')).to.equal(true);
      expect(fs.enabled('c')).to.equal(false);
      expect(fs.enabled('d')).to.equal(false);
    });
  });

  describe('FeatureSet.enabled(key)', function () {
    var features;
    beforeEach(function () {
      process.env.NODE_FEATURES_ENABLED = 'a';
      process.env.NODE_FEATURES_DISABLED = 'b';
      
      features = new FeatureSet({
        map: {
          a: 'a',
          b: 'b'
        }
      });
    });
    
    it('Returns true if feature is enabled', function () {
      expect(features.enabled('a')).to.equal(true);
    });

    it('Returns false if feature is disabled', function () {
      expect(features.enabled('b')).to.equal(false);
    });

    it('Throws TypeError if given an unregistered feature', function () {
      function shouldThrow () {
        return features.enabled('c');
      }
      expect(shouldThrow).to.throw(/Unregistered Feature: "c"/);
    });
  });
});
