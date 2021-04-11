
module.exports = {
  rules: [
    { from: 'src/index.html', to: 'pub/' },
    { from: 'src/manifest.json', to: 'pub/' },
    { from: 'src/assets/**/*', to: 'pub/assets/' },
  ],
};
