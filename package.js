Package.describe({
    name: "socialize:base-model",
    summary: "A model for all other models to inherit from ",
    version: "0.1.0",
    git: "https://github.com/copleykj/socialize-base-model.git"
});

Package.onUse(function(api) {
    api.versionsFrom("1.0.2.1");

    api.use(["meteor", "underscore"]);

    api.addFiles("base-model.js");

    api.export("BaseModel");
});

