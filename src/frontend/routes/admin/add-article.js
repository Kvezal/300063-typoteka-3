'use strict';

const {articleAdapter, categoryAdapter} = require(`../../adapters`);
const routeName = require(`../../route-name`);
const {getQueryString, logger, transformDate, adaptDate} = require(`../../utils`);


class AddArticleRoute {
  constructor() {
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
  }

  async get(req, res) {
    const {account} = req.locals;
    const {article, errorMessages} = this._parseQueryParams(req);
    const categories = await categoryAdapter.getList();
    const content = {
      type: `add`,
      article,
      account,
      categories,
      scriptList: [
        `js/vendor.js`,
        `js/main.js`
      ],
      errorMessages,
    };
    res.render(`pages/articles/edit`, content);
    logger.endRequest(req, res);
  }

  async post(req, res) {
    const {date, title, announce, categories, text, image} = req.body;
    const {cookie} = req.headers;
    const articleParams = {
      title,
      announce,
      text,
      categories: categories ? categories.map((category) => +category) : [],
      image,
      date,
    };
    const articleRes = await articleAdapter.addItem({
      ...articleParams,
      date: transformDate(date),
    }, {
      headers: {cookie},
    });
    const path = this._getPath(articleRes, articleParams);
    res.redirect(path);
    logger.endRequest(req, res);
  }

  _parseQueryParams(req) {
    let {article, errorMessages} = req.query;
    if (article) {
      article = JSON.parse(article);
    } else {
      article = {
        date: adaptDate(new Date().toISOString()).day,
      };
    }
    if (errorMessages) {
      errorMessages = JSON.parse(errorMessages);
    }
    return {article, errorMessages};
  }

  _getPath(articleRes, articleParams) {
    let path = `/${routeName.MY}`;
    if (articleRes.content && articleRes.content.errorMessages) {
      const query = getQueryString({
        article: JSON.stringify(articleParams),
        errorMessages: JSON.stringify(articleRes.content.errorMessages),
      });
      path = `/${routeName.ARTICLES}/${routeName.ADD}?${query}`;
    }
    return path;
  }
}

module.exports = AddArticleRoute;
