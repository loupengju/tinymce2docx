const {
  when,
  whenDev,
  whenProd,
  whenTest,
  ESLINT_MODES,
  POSTCSS_MODES,
} = require('@craco/craco');

module.exports = {
  webpack: {
    configure: {
      output: {
//         publicPath: whenProd(() => '/tinymce2docx'),
      },
    },
  },
};
