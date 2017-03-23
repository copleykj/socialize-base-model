Package.describe({
    name: "socialize:base-model",
    summary: "A model for all other models to extend.",
    version: "1.0.1",
    git: "https://github.com/copleykj/socialize-base-model.git"
});

Npm.depends({
    'rus-diff':'1.1.0',
    'simpl-schema':'0.2.3'
});

Package.onUse(function(api) {
    api.versionsFrom("1.3");

    api.use(["meteor", "mongo", "underscore", "ecmascript"]);

    api.use([
        "socialize:server-time@0.1.2",
        "aldeed:collection2-core@2.0.0", "aldeed:schema-index@2.0.0", "aldeed:schema-deny@2.0.0",
        "matb33:collection-hooks@0.8.4"
    ]);

    api.imply(["meteor", "mongo", "underscore", "ecmascript"]);

    api.imply([
        "aldeed:collection2-core@2.0.0", "aldeed:schema-index@2.0.0", "aldeed:schema-deny@2.0.0",
        "matb33:collection-hooks@0.8.4"
    ]);

    api.mainModule("base-model.js");
});

Package.onTest(function(api){
    api.use(["tinytest", "meteor", "mongo", "underscore", "ecmascript"]);

    api.use([
        "socialize:server-time@0.1.2",
        "aldeed:collection2-core@2.0.0", "matb33:collection-hooks@0.8.4",
        "socialize:base-model"
    ]);

    api.mainModule("tests.js");
});
