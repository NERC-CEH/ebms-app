const BUILD = 'dist/_build/';

const pkg = require('../../package.json');

module.exports = grunt => ({
  // Fix double define problem
  leaflet: {
    src: ['node_modules/leaflet/dist/leaflet-src.js'],
    overwrite: true,
    replacements: [
      {
        from: 'window.L = L',
        to: '//window.L = L',
      },
    ],
  },

  // need to remove Ratchet's default fonts to work with fontello ones
  photoswipe: {
    src: ['node_modules/photoswipe/dist/default-skin/default-skin.css'],
    overwrite: true,
    replacements: [
      {
        from: 'url(default-skin.',
        to: 'url(images/default-skin.',
      },
    ],
  },

  // moving the stylesheet to root makes the path different
  fontello_fonts: {
    src: ['src/common/vendor/fontello/css/icons.css'],
    dest: `${BUILD}styles/icons.css`,
    replacements: [
      {
        from: /\.\.\/font\//g,
        to: './font/',
      },
    ],
  },

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
