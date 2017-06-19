/* eslint-disable no-undef */
Package.describe({
    name: 'socialize:base-model',
    summary: 'A model for all other models to extend.',
    version: '1.0.3',
    git: 'https://github.com/copleykj/socialize-base-model.git',
});

Npm.depends({
    'rus-diff': '1.1.0',
    'simpl-schema': '0.3.0',
});

Package.onUse(function onUse(api) {
    api.versionsFrom('1.3');

    api.use(['meteor', 'mongo', 'underscore', 'ecmascript']);

    api.use([
        'socialize:server-time@1.0.0',
        'aldeed:collection2-core@2.0.1', 'aldeed:schema-index@2.0.0', 'aldeed:schema-deny@2.0.0',
        'matb33:collection-hooks@0.8.4',
    ]);

    api.imply(['meteor', 'mongo', 'underscore', 'ecmascript']);

    api.imply([
        'aldeed:collection2-core', 'aldeed:schema-index', 'aldeed:schema-deny',
        'matb33:collection-hooks',
    ]);

    api.mainModule('base-model.js');
});

Package.onTest(function onTest(api) {
    api.use(['tinytest', 'meteor', 'mongo', 'underscore', 'ecmascript']);

    api.use([
        'socialize:server-time@1.0.0',
        'aldeed:collection2-core@2.0.1', 'matb33:collection-hooks@0.8.4',
        'socialize:base-model',
    ]);

    api.mainModule('tests.js');
});
