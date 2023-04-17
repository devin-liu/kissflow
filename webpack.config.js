const path = require('path');

module.exports = {
  entry: {
    contentScript: path.resolve(__dirname, 'src/contentScript/index.ts'),
    background: path.resolve(__dirname, 'src/background/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'production',
};
