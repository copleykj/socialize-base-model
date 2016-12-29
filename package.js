Package.describe({
    name: "socialize:base-model",
    summary: "A model for all other models to extend.",
    version: "1.0.0",
    git: "https://github.com/copleykj/socialize-base-model.git"
});

Package.onUse(function(api) {
    Npm.depends({
        'mongodb-diff':'0.4.3'
    });
    api.versionsFrom("1.3");

    api.use(["meteor", "mongo", "underscore", "ecmascript"]);

    api.use([
        "socialize:server-time@0.1.2", "aldeed:simple-schema@1.5.3",
        "aldeed:collection2@2.9.0", "matb33:collection-hooks@0.8.1"
    ]);

    api.imply(["meteor", "mongo", "underscore", "ecmascript"]);

    api.imply([
        "aldeed:simple-schema@1.5.3", "aldeed:collection2@2.9.0", "matb33:collection-hooks@0.8.1"
    ]);

    api.mainModule("base-model.js");
});

Package.onTest(function(api){
    api.use(["tinytest", "meteor", "mongo", "underscore", "ecmascript"]);

    api.use([
        "socialize:server-time@0.1.2", "aldeed:simple-schema@1.5.3",
        "aldeed:collection2@2.9.0", "matb33:collection-hooks@0.8.1",
        "socialize:base-model"
    ]);

    api.mainModule("tests.js");
});
