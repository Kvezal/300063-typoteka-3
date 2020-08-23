'use strict';

const {Sequelize, DataTypes} = require(`sequelize`);

const {DB_DRIVER, ExitCode} = require(`common/params`);
const {logger} = require(`backend/utils`);

const getAccount = require(`./models/account`);
const getAccountType = require(`./models/account-type`);
const getArticle = require(`./models/article`);
const getCategory = require(`./models/category`);
const getComment = require(`./models/comment`);


const sequelize = new Sequelize({
  dialect: process.env.DB_DRIVER || DB_DRIVER,
});

const Account = getAccount(sequelize, DataTypes);
const AccountType = getAccountType(sequelize, DataTypes);
const Article = getArticle(sequelize, DataTypes);
const Category = getCategory(sequelize, DataTypes);
const Comment = getComment(sequelize, DataTypes);

const initDb = async () => {
  logger.info(`DB is connecting...`);
  await sequelize.sync()
    .catch((error) => {
      logger.error(`DB connection error ${error}`);
      process.exit(ExitCode.ERROR);
    });
  logger.info(`DB connected successfully`);
};

AccountType.hasMany(Account, {
  as: `accounts`,
  foreignKey: `accountTypeId`,
});
Account.belongsTo(AccountType, {
  as: `accountTypes`,
  foreignKey: `accountTypeId`,
});

Account.hasMany(Comment, {
  as: `comments`,
  foreignKey: `accountId`,
});
Comment.belongsTo(Account, {
  as: `accounts`,
  foreignKey: `accountId`,
});

Article.hasOne(Comment, {
  as: `comments`,
  foreignKey: `articleId`,
});
Comment.belongsTo(Article, {
  as: `articles`,
  foreignKey: `articleId`,
});

Article.belongsToMany(Category, {
  through: `articleCategory`,
  as: `categories`,
  foreignKey: `articleId`,
  timestamps: false,
  paranoid: false,
});
Category.belongsToMany(Article, {
  through: `articleCategory`,
  as: `articles`,
  foreignKey: `categoryId`,
  timestamps: false,
  paranoid: false,
});


module.exports = {
  db: {
    Account,
    AccountType,
    Article,
    Category,
    Comment,
  },
  sequelize,
  initDb,
};
