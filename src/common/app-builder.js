'use strict';

const express = require(`express`);


class AppBuilder {
  constructor(config) {
    this._config = config;
    this._methods = [`get`, `post`, `put`, `delete`];
  }

  async getInstance() {
    if (!this._app) {
      await this._init();
      await this._build();
    }
    return this._app;
  }

  async destroyInstance() {
    this._config.close.async.forEach(async (func) => await func());
    this._config.close.sync.forEach((func) => func());
    this._app = null;
  }

  async _init() {
    this._app = express();
    const initParams = this._config.init;
    if (!initParams) {
      return;
    }
    if (initParams.async) {
      this._config.init.async.forEach(async (func) => await func());
    }
    if (initParams.sync) {
      this._config.init.sync.forEach((func) => func());
    }
  }

  async _build() {
    this._setAppSettings(this._config.settings);
    this._setAppMiddlewares(this._config.middlewares.before);
    this._initPrefixRouter();
    this._buildRoutes(this._config.routes);
    this._setAppMiddlewares(this._config.middlewares.after);
  }

  _setAppSettings(settings) {
    if (!settings) {
      return;
    }
    settings.forEach((setting) => this._app.set(...setting));
  }

  _setAppMiddlewares(middlewares) {
    if (!middlewares) {
      return;
    }
    middlewares.forEach((middleware) => this._app.use(middleware));
  }

  _initPrefixRouter() {
    const prefix = this._config.prefix ? `/${this._config.prefix}` : ``;
    let router = this._app;
    if (prefix) {
      router = new express.Router();
      this._app.use(prefix, router);
    }
    this._prefixRouter = router;
  }

  _buildRoutes(routes, router = this._prefixRouter) {
    if (!routes || routes.length === 0) {
      return;
    }
    routes.forEach((route) => this._buildRoute(route, router));
  }

  _buildRoute(route, router) {
    const newRouter = this._createRouter(route, router);
    this._addMethodsHandlerToRoute(route, newRouter);
    this._buildRoutes(route.children, newRouter);
  }

  _createRouter(route, router) {
    let path = `/${route.path}`;
    if (!route.children || route.children.length === 0) {
      return router;
    }
    const newRouter = new express.Router({mergeParams: true});
    const middleware = this._getRouterMiddleware(route);
    router.use(path, middleware, newRouter);
    return newRouter;
  }

  _getRouterMiddleware(route) {
    let middleware = [];
    if (route.middleware && route.middleware.route) {
      middleware = [...route.middleware.route];
    }
    return middleware;
  }

  _addMethodsHandlerToRoute(route, router) {
    const {Component, middleware, children} = route;
    if (!Component) {
      return;
    }
    const component = new Component();
    const path = children && children.length !== 0 ? `/` : `/${route.path}`;
    this._methods.forEach((method) => {
      if (!component[method]) {
        return;
      }
      const middlewares = this._getRouteMiddleware(middleware, method);
      router[method](path, middlewares, component[method]);
    });
  }

  _getRouteMiddleware(middleware = {}, method) {
    const {
      all: allMethodsMiddleware = [],
      [method]: methodMiddleware = []
    } = middleware;
    return [...allMethodsMiddleware, methodMiddleware];
  }
}

module.exports = AppBuilder;
