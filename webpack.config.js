const path = require("path");
const rootDir = path.resolve(__dirname);
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "main",
  devtool: "source-map",
  output: {
    path: path.join(rootDir, "dist"),
    chunkFilename: "[contenthash:20].[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    modules: [path.join(rootDir, "src"), "node_modules"],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          sourceMap: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        include: path.join(rootDir, "src"),
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        include: path.join(rootDir, "src"),
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                  cssnano: {},
                },
              },
            },
          },
        ],
      },
    ],
  },
};
