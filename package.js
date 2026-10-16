/* global Package, Npm */
Package.describe({
    name: 'socialize:base-model',
    summary: 'A model for all other models to extend.',
    version: '2.1.0',
    git: 'https://github.com/copleykj/socialize-base-model.git',
});

Npm.depends({
    '@freedombase/mongodb-diff': '0.6.0',
    'message-box': '1.0.0',
});

Package.onUse(function onUse(api) {
    api.versionsFrom('3.0');

    api.use(['meteor', 'mongo', 'ecmascript']);

    api.use([
        'aldeed:collection2@4.1.5 || 5.0.0', 'aldeed:simple-schema@1.13.1 || 2.0.0 || 3.0.0',
        'aldeed:schema-deny@5.0.0', 'matb33:collection-hooks@2.1.0-beta.5',
        'socialize:server-time@1.0.3',
    ]);

    api.imply(['meteor', 'mongo', 'ecmascript']);

    api.imply([
        'aldeed:collection2', 'aldeed:simple-schema', 'aldeed:schema-deny',
        'matb33:collection-hooks', 'socialize:server-time',
    ]);

    api.mainModule('entry-meteor.js');
});

Package.onTest(function onTest(api) {
    api.use(['tinytest', 'meteor', 'mongo', 'ecmascript']);

    api.use([
        'aldeed:collection2@4.0.1 || 5.0.0', 'matb33:collection-hooks@2.0.0',
        'socialize:base-model',
    ]);

    api.mainModule('tests.js');
});
