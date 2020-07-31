/* global Package, Npm */
Package.describe({
    name: 'socialize:base-model',
    summary: 'A model for all other models to extend.',
    version: '1.1.4',
    git: 'https://github.com/copleykj/socialize-base-model.git',
});

Npm.depends({
    'mongodb-diff': '0.4.4',
});

Package.onUse(function onUse(api) {
    api.versionsFrom('1.8.3');

    api.use(['meteor', 'mongo', 'ecmascript']);

    api.use([
        'aldeed:collection2@3.1.0', 'aldeed:schema-index@3.0.0', 'aldeed:schema-deny@3.0.0',
        'matb33:collection-hooks@1.0.1', 'socialize:server-time@1.0.0',
    ]);

    api.imply(['meteor', 'mongo', 'ecmascript']);

    api.imply([
        'aldeed:collection2', 'aldeed:schema-index', 'aldeed:schema-deny',
        'matb33:collection-hooks', 'socialize:server-time',
    ]);

    api.mainModule('entry-meteor.js');
});

Package.onTest(function onTest(api) {
    api.use(['tinytest', 'meteor', 'mongo', 'ecmascript']);

    api.use([
        'aldeed:collection2@3.0.6', 'matb33:collection-hooks@1.0.1',
        'socialize:base-model',
    ]);

    api.mainModule('tests.js');
});
