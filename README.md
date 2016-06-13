# Feature Set
Easy feature toggling based on the runtime environment
variables. Pairs nicely with
[node-might](https://www.npmjs.com/package/might), to enable and
disable certain features via configuration changes rather than
modifying your codebase.

## As Simple as Possible
When you declare a new feature set, it will default to looking at
`process.env.NODE_FEATURES_ENABLED` and
`process.env.NODE_FEATURES_DISABLED` for a list of features that
should be considered enabled or disabled, respectively. The actual
values on `process.env` will of course be strings. Following normal
convention, this value can be a comma-separated list of features.

```bash
$ NODE_FEATURES_ENABLED=auth,replicate npm start
```

In your app code, you can check to see if this feature should be
enabled by calling the `on` method.

```javascript
var FeatureSet = require('feature-set');
var features = new FeatureSet();

// ...meanwhile

if (features.enabled('auth')) {
  // do some authy things
}
```

## API

### constructor (options) -> new FeatureSet instance
Most likely, you will just want to create a new feature set without
passing in any additional options, but there is functionality to make
some modifications if you choose. By default, it will register any
values in the comma-separated `process.env.NODE_FEATURES_ENABLED`
and mark them as enabled, and likewise for the comma-separated values
of `process.env.NODE_FEATURES_DISABLED`. You can, however, use
different environment variables if you like, by passing in an `env`
object in the options:

```javascript
var features = new FeatureSet({
  env: {
    enableKey: 'CUSTOM_ENABLED_FEATURES',
    disableKey: 'CUSTOM_DISABLED_FEATURES'
  }
});
```

If you find that the naming scheme for features in the environment
doesn't match the naming scheme you'd like to use when checking
`featureSet.enabled`, you can map them separately by passing in a
`map` object in your options. The keys correspond to the publicly
accessible feature names, and the values correspond to the environment
variable list:

```javascript
var features = new FeatureSet({
  map: {
    auth: 'MYAPPAUTH',
    replicate: 'MYAPP_REPLICATE_STUFF'
  }
});
```

### `featureSet.enabled(feature) : String -> Boolean | TypeError`
Looks up in the feature set to see if the feature is enabled. We assume
it would be a Bad Thing if this checks the status of a feature that
hasn't been configured yet, so if this method is passed the name of a feature
that is not explicity registered, it will throw an error:

```javascript
// process.env.NODE_FEATURES_ENABLED = ''

features.enabled('oops');

// -> throws TypeError(Unregistered Feature: "oops")
```

## Testing Environments
By default, a feature set is meant to be fairly static. Creating a new
feature set will look to the environment once, upon construction, to
flag features. Subsequent calls to `enabled` look up this basic
boolean.

However, in testing environments, you probably want to instrument
features between different tests. There are two ways to do this:

- **Enable/Disable methods:** Calling
  `featureSet.enable('featureName')` will enable or disable a feature
  on the fly. The drawback of this is your test harnesses need access
  to the feature set itself. In order to get around this, you can use
  the second option:

- **Testing environment variable** Setting the special
  `NODE_FEATURES_DYNAMIC` environment variable will monkey patch the
  `enabled` method to look up the values in the respective
  environments each time, rather than looking to the statically
  created flags. As such, you can simply alter your environment
  variables as needed for each test. *Note: this is much slower, so
  you should only use it for testing.* Example:

```
/* test/spec.js */
beforeEach(function () {
  process.env.NODE_FEATURES_ENABLED = 'defaults';
});

it('Does that one feature', function () {
  process.env.NODE_FEATURES_ENABLED += 'feature1';

  // do your tests...
});


/* package.json */
"scripts": {
  "test": "NODE_FEATURES_DYNAMIC=1 mocha test/spec.js"
}
```
