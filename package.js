Package.describe({
  name: "socialize:base-model",
  summary: "A model for all other models to inherit from ",
  version: "0.4.0",
  git: "https://github.com/copleykj/socialize-base-model.git"
});

Package.onUse(function (api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    "meteor",
    "mongo",
    "underscore"
  ]);

  api.use([
      "socialize:server-time@0.1.2",
      "lepozepo:publish-with-relations@1.2.4",
      "aldeed:simple-schema@1.5.3",
      "aldeed:collection2@2.8.0",
      "artpolikarpov:collection-hooks@0.8.5"
    ]);

  api.imply(["meteor", "mongo", "underscore"]);

  api.imply([
      "lepozepo:publish-with-relations@1.2.4",
      "aldeed:simple-schema@1.5.3",
      "aldeed:collection2@2.8.0",
      "artpolikarpov:collection-hooks@0.8.5"
    ]);

  api.addFiles(["base-model.js", "security.js"]);

  api.export("BaseModel");
});
