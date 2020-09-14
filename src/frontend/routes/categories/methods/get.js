'use strict';

const {accountAdapter, categoryAdapter} = require(`../../../adapters`);
const {logger} = require(`../../../utils`);


module.exports = async (req, res) => {
  const categories = await categoryAdapter.getList();
  const content = {
    account: accountAdapter.getAuth(),
    categories
  };
  res.render(`pages/categories`, content);
  logger.endRequest(req, res);
};