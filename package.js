Package.describe({
    name: "socialize:base-model",
    summary: "A model for all other models to inherit from ",
    version: "0.3.2",
    git: "https://github.com/copleykj/socialize-base-model.git"
});

Package.onUse(function(api) {
    api.versionsFrom("1.0.2.1");

    api.use(["meteor", "mongo", "underscore"]);

    api.use([
        "socialize:server-time@0.1.2", "tmeasday:publish-with-relations@0.2.0", "aldeed:simple-schema@1.5.3",
        "aldeed:collection2@2.8.0", "matb33:collection-hooks@0.8.1", "meteorhacks:unblock@1.1.0"
    ]);

    api.imply(["meteor", "mongo", "underscore"]);

    api.imply([
        "tmeasday:publish-with-relations@0.2.0", "aldeed:simple-schema@1.5.3",
        "aldeed:collection2@2.8.0", "matb33:collection-hooks@0.8.1", "meteorhacks:unblock@1.1.0"
    ]);

    api.addFiles(["base-model.js", "security.js"]);

    api.export("BaseModel");
});
