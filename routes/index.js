const list = require("./list"); // 引入 list 路由模块
const api = require("./api");
module.exports = (app, client) => {
    // 注册 list 路由，并传递 client
    app.use("/list", list(client));
    app.use("/api", api(client));
};