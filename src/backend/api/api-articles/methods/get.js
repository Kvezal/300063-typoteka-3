'use strict';

const HttpCodes = require(`http-status-codes`);

const {articleAdapter} = require(`backend/adapters`);


module.exports = async (req, res) => {
  const articleList = articleAdapter.getList();
  res.status(HttpCodes.OK).send(articleList);
};
