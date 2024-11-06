const path = require("path"); //nodejs模块
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ReachRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { javascript } = require("webpack");

//获取cross-env定义的环境变量
const isProduction = process.env.NODE_ENV === "production";

//用来获取处理样式的loader
function getStyleLoader(pre) {
  return [
    isProduction ? MiniCssExtractPlugin.loader : "style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"], //能解决大多数样式兼容性问题
        },
      },
    },
    pre && {
      loader: pre,
      options:
        pre === "less-loader"
          ? {
              //antd主题色
              lessOptions: {
                modifyVars: { "@primary-color": "#1DA57A" },
                javascriptEnabled: true,
              },
            }
          : {},
    },
  ].filter(Boolean);
}

module.exports = {
  //入口
  entry: "./src/main.js", //相对路径
  //输出
  output: {
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
    filename: isProduction
      ? "static/js/[name].[contenthash:10].js"
      : "static/js/[name].js",
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:10].chunk.js"
      : "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[hash:10][ext][query]",
    clean: true,
  },
  //加载器
  module: {
    rules: [
      {
        //每个文件只能被其中一个loader配置处理，第一个命中就不看后续了
        oneOf: [
          //处理css
          {
            test: /\.css$/i,
            use: getStyleLoader(),
          },
          {
            test: /\.less$/,
            use: getStyleLoader("less-loader"),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader("sass-loader"),
          },
          {
            test: /\.styl$/,
            use: getStyleLoader("stylus-loader"),
          },
          //处理图片
          {
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, //10kb(小于10kb的图片会被转化成base64字符串,可以减少图片请求)
              },
            },
          },
          //处理其他资源
          {
            test: /\.(ttf|woff2?)$/,
            type: "asset/resource",
          },
          //处理js
          {
            test: /\.jsx?$/,
            include: path.resolve(__dirname, "../src"),
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [!isProduction && "react-refresh/babel"].filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  //插件
  plugins: [
    new ESLintWebpackPlugin({
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintcache"
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    isProduction &&
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:10].css",
        chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
      }),
    isProduction &&
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../public"),
            to: path.resolve(__dirname, "../dist"),
            globOptions: {
              //忽略index.html
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
    !isProduction && new ReachRefreshWebpackPlugin(),
  ].filter(Boolean),
  //模式
  mode: isProduction ? "production" : "development",
  // devtool: isProduction ? "source-map":"cheap-module-source-map",
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        //react react-dom react-router-dom 一起打包成一个js文件
        react: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name: "chunk-react",
          priority: 40,
        },
        //antd单独打包
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: "chunk-antd",
          priority: 30,
        },
        //剩下的node_modules单独打包
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: "chunk-libs",
          priority: 20,
        },
      },
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
    minimize: isProduction,
    minimizer: [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin(),
      //   new ImageMinimizerPlugin({
      //     minimizer: {
      //       implementation: ImageMinimizerPlugin.imageminGenerate,
      //       options: {
      //         plugins: [
      //           ["gifsicle", { interlaced: true }],
      //           ["jpegtran", { progressive: true }],
      //           ["optipng", { optimizationLevel: 5 }],
      //           [
      //             "svgo",
      //             {
      //               plugins: [
      //                 "preset-default",
      //                 "prefixIds",
      //                 {
      //                   name: "sortAttrs",
      //                   params: {
      //                     xmlnsOrder: "alphabetical",
      //                   },
      //                 },
      //               ],
      //             },
      //           ],
      //         ],
      //       },
      //     },
      //   }),
    ],
  },
  //webpack解析模块加载的选项
  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },
  //开发服务器：不会输出资源，在内存中编译打包
  devServer: {
    host: "localhost", //启动服务器域名
    port: 3000, //启动服务器端口
    open: true, //是否自动打开浏览器
    hot: true,
    historyApiFallback: true, //解决前端路由刷新404问题
  },
  performance: false,
};
