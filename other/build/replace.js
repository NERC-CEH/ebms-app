const pkg = require('../../package.json');

module.exports = grunt => ({
  // Cordova config changes
  cordova_config: {
    src: ['other/cordova/cordova.xml'],
    dest: 'dist/cordova/config.xml',
    replacements: [
      {
        from: /\{ID\}/g, // string replacement
        to: () => pkg.id,
      },
      {
        from: /\{APP_VER\}/g, // string replacement
        to: () => pkg.version,
      },
      {
        from: /\{APP_TITLE\}/g,
        to: () => pkg.title,
      },
      {
        from: /\{APP_DESCRIPTION\}/g,
        to: () => pkg.description,
      },
      {
        from: /\{BUNDLE_VER\}/g,
        to: () => pkg.build,
      },
      {
        from: /\{ANDROID_BUNDLE_VER\}/g,
        to() {
          let version = pkg.version.replace(/\./g, '') + pkg.build;
          if (!grunt.option('oldversion')) {
            version += 8;
          }
          return version;
        },
      },
    ],
  },
});
