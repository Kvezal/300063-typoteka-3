'use strict';

const bcrypt = require(`bcrypt`);
const HttpCodes = require(`http-status-codes`);
const request = require(`supertest`);

const {apiContainer} = require(`../../api`);
const {db, initDb} = require(`../../db`);
const {getRandomString} = require(`../../utils`);


const pathToComments = `/api/comments`;
const pathToArticles = `/api/articles`;
const AVAILABLE_SYMBOLS = `abcdefghijklmnopqrstuvwxyz`;
const commentLimit = 5;

const articleData = {
  title: getRandomString(AVAILABLE_SYMBOLS, 40),
  image: `123.png`,
  announce: getRandomString(AVAILABLE_SYMBOLS, 40),
  text: getRandomString(AVAILABLE_SYMBOLS, 40),
  categories: [1, 2, 3],
  date: `2020-09-10`,
};
const commentData = {
  accountId: 1,
  text: getRandomString(AVAILABLE_SYMBOLS, 10),
};

const initTest = async () => {
  await initDb(true);
  await createAdmin();
  const categoriesForDbTable = new Array(5)
    .fill(``)
    .map(() => ({title: getRandomString(AVAILABLE_SYMBOLS, 10)}));
  await db.Category.bulkCreate(categoriesForDbTable);
};

const createAdmin = async () => {
  const admin = {
    firstname: getRandomString(AVAILABLE_SYMBOLS, 20),
    lastname: getRandomString(AVAILABLE_SYMBOLS, 20),
    email: `admin@mail.ru`,
    avatar: `test.png`,
    password: bcrypt.hashSync(`123456`, 10),
    isAdmin: true,
  };
  return await db.Account.create(admin);
};

const fillCommentsTable = async (count) => {
  const commentsForDbTable = Array(count).fill({}).map(() => ({
    text: getRandomString(AVAILABLE_SYMBOLS, 20),
    date: new Date(),
    accountId: 1,
    articleId: 1,
  }));
  await db.Comment.bulkCreate(commentsForDbTable)
    .catch((error) => showAccessError(error, `comments`));
};

describe(`Comments API end-points`, () => {
  let server = null;
  let article = null;

  beforeAll(async () => {
    await initTest();
    server = await apiContainer.getInstance();
  });

  beforeEach(async () => {
    const postArticleResponse = await request(server).post(pathToArticles).send(articleData);
    article = postArticleResponse.body;
  });

  afterAll(async () => {
    await apiContainer.destroyInstance();
    server = null;
  });

  describe(`GET`, () => {
    test(`When GET comment list status code should be ${HttpCodes.OK}`, async () => {
      const res = await request(server).get(pathToComments);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When GET comment list by article id with not exist article status code should be ${HttpCodes.BAD_REQUEST}`, async () => {
      await request(server).delete(`${pathToArticles}/${article.id}`);
      const res = await request(server).get(`${pathToComments}?articleId=${article.id}`);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When GET comment list with limit status code should be ${HttpCodes.OK}`, async () => {
      const res = await request(server).get(`${pathToComments}?limit=${commentLimit}`);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When GET comment list with limit should return correct count of comments`, async () => {
      await fillCommentsTable(10);
      const res = await request(server).get(`${pathToComments}?limit=${commentLimit}`);
      expect(res.body.length).toBe(commentLimit);
    });
  });

  describe(`POST`, () => {
    test(`When POST article comment status code should be ${HttpCodes.CREATED}`, async () => {
      const comment = {
        ...commentData,
        articleId: article.id,
      };
      const res = await request(server).post(pathToComments).send(comment);
      expect(res.statusCode).toBe(HttpCodes.CREATED);
    });

    test(`When POST article comment without "text" property should have ${HttpCodes.BAD_REQUEST}`, async () => {
      const comment = {
        ...commentData,
        articleId: article.id,
      };
      delete comment.text;
      const postCommentResponse = await request(server).post(pathToComments).send(comment);
      expect(postCommentResponse.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test.each([`id`, `text`, `date`, `accountId`, `articleId`])(`When POST article comment should have %p property`, async (property) => {
      const comment = {
        ...commentData,
        articleId: article.id,
      };
      const postCommentResponse = await request(server).post(pathToComments).send(comment);
      expect(postCommentResponse.body).toHaveProperty(property);
    });

    test(`When POST article with invalid text when length is great then 1000 status code should be ${HttpCodes.BAD_REQUEST}`, async () => {
      const comment = {
        ...commentData,
        articleId: article.id,

        text: getRandomString(AVAILABLE_SYMBOLS, 1001),
      };
      const res = await request(server).post(pathToComments).send(comment);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When POST article with valid text when length is equal 1000 status code should be ${HttpCodes.CREATED}`, async () => {
      const comment = {
        ...commentData,
        articleId: article.id,
        text: getRandomString(AVAILABLE_SYMBOLS, 1000),
      };
      const res = await request(server).post(pathToComments).send(comment);
      expect(res.statusCode).toBe(HttpCodes.CREATED);
    });
  });
});
