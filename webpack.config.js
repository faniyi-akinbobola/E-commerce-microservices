module.exports = function (options, webpack) {
  return {
    ...options,
    externals: {
      crypto: 'commonjs2 crypto',
    },
  };
};
