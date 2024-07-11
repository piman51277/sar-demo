const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

//set the environment
const env = process.env.NODE_ENV || "production";

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(__dirname, "tsconfig.json"),
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  resolve: {
    extensions: [".ts"],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: env,
  devtool: env === "development" ? "eval" : false,
  watchOptions: {
    aggregateTimeout: 300,
    ignored: /node_modules/
  }
};
