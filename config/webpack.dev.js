const path = require("path"); //nodejs模块
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReachRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

//用来获取处理样式的loader
function getStyleLoader(pre) {
  return [
    "style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"], //能解决大多数样式兼容性问题
        },
      },
    },
    pre,
  ].filter(Boolean);
}

module.exports = {
  //入口
  entry: "./src/main.js", //相对路径
  //输出
  output: {
    path: undefined,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[hash:10][ext][query]",
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
              plugins: ["react-refresh/babel"], //激活js的hmr功能
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
    new ReachRefreshWebpackPlugin(), //激活js的hmr功能
  ],
  //开发服务器：不会输出资源，在内存中编译打包
  devServer: {
    host: "localhost", //启动服务器域名
    port: 3000, //启动服务器端口
    open: true, //是否自动打开浏览器
    hot: true,
    historyApiFallback: true, //解决前端路由刷新404问题
  },
  //模式
  mode: "development",
  // devtool: "cheap-module-source-map",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
  },
  //webpack解析模块加载的选项
  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },
};
