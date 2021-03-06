'use strict';

const bcrypt = require(`bcrypt`);
const HttpCodes = require(`http-status-codes`);
const request = require(`supertest`);

const {commonParams} = require(`../../../common/params`);
const {apiContainer} = require(`../../api`);
const {db, initDb} = require(`../../db`);
const {getRandomString} = require(`../../utils`);


const SALT_ROUND = +process.env.SALT_ROUND || commonParams.SALT_ROUND;
const PATH_TO_ARTICLES = `/api/articles`;
const PATH_TO_LOGIN = `/api/user/login`;
const AVAILABLE_SYMBOLS = `abcdefghijklmnopqrstuvwxyz`;
const articleData = {
  title: `Обзор новейшего смартфона test`,
  image: `123.png`,
  announce: `Золотое сечение — соотношение двух величин, гармоническая пропорция.`,
  text: `Вы можете достичь всего. Стоит только немного постараться и запастись книгами. Это один из лучших рок-музыкантов. Собрать камни бесконечности легко, если вы прирожденный герой.`,
  categories: [1, 2, 3],
  date: `2020-09-10`,
};
const newArticleData = {
  title: `Как перестать беспокоиться и начать жить`,
  image: `123.png`,
  announce: `Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами.`,
  text: `Это один из лучших рок-музыкантов. Он написал больше 30 хитов. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Как начать действовать? Для начала просто соберитесь. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.`,
  categories: [3, 4],
  date: `2020-09-10`,
};
const authAdminParams = {
  email: `admin@mail.ru`,
  password: `123456`,
};
const authUserParams = {
  email: `user@mail.ru`,
  password: `654321`,
};

const initTest = async () => {
  await initDb(true);
  await createUsers();
  const categoriesForDbTable = new Array(5)
    .fill(``)
    .map(() => ({title: getRandomString(AVAILABLE_SYMBOLS, 10)}));
  await db.Category.bulkCreate(categoriesForDbTable);
};

const createUsers = async () => {
  return await db.Account.bulkCreate([
    {
      firstname: getRandomString(AVAILABLE_SYMBOLS, 20),
      lastname: getRandomString(AVAILABLE_SYMBOLS, 20),
      email: authAdminParams.email,
      avatar: `test.png`,
      password: bcrypt.hashSync(authAdminParams.password, SALT_ROUND),
      isAdmin: true,
    },
    {
      firstname: getRandomString(AVAILABLE_SYMBOLS, 20),
      lastname: getRandomString(AVAILABLE_SYMBOLS, 20),
      email: authUserParams.email,
      avatar: `test.png`,
      password: bcrypt.hashSync(authUserParams.password, SALT_ROUND),
      isAdmin: false,
    },
  ]);
};

describe(`Article ID API end-points`, () => {
  let server = null;
  let article = null;
  let adminCookie = null;
  let userCookie = null;

  beforeAll(async () => {
    await initTest();
    server = await apiContainer.getInstance();
    const admin = await request(server).post(PATH_TO_LOGIN).send(authAdminParams);
    adminCookie = admin.headers[`set-cookie`];
    const user = await request(server).post(PATH_TO_LOGIN).send(authUserParams);
    userCookie = user.headers[`set-cookie`];
  });

  beforeEach(async () => {
    const createArticleResponse = await request(server)
      .post(PATH_TO_ARTICLES)
      .set(`cookie`, adminCookie)
      .send(articleData);
    article = createArticleResponse.body;
  });

  afterAll(async () => {
    await apiContainer.destroyInstance();
    server = null;
  });

  describe(`GET`, () => {
    test(`When GET exist article by ID status code should be 200`, async () => {
      const res = await request(server).get(`${PATH_TO_ARTICLES}/${article.id}`);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test.each([`id`, `title`, `image`, `announce`, `text`, `date`, `categories`, `commentCount`])(`When GET exist article by ID should have %p property`, async (property) => {
      const res = await request(server).get(`${PATH_TO_ARTICLES}/${article.id}`);
      expect(res.body).toHaveProperty(property);
    });

    test(`When GET article when articleId is not number status code should be 400`, async () => {
      const res = await request(server).get(`${PATH_TO_ARTICLES}/not-number`).send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When GET article when articleId is number status code should be 200`, async () => {
      const res = await request(server).get(`${PATH_TO_ARTICLES}/${article.id}`).send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });
  });

  describe(`DELETE`, () => {
    test(`When DELETE article status code should be 204`, async () => {
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      expect(res.statusCode).toBe(HttpCodes.NO_CONTENT);
    });

    test(`When DELETE not exist article status code should be 400`, async () => {
      await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When DELETE not exist article response should has "empty" property`, async () => {
      await request(server).delete(`${PATH_TO_ARTICLES}/${article.id}`);
      await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      expect(res.body).toHaveProperty(`message`);
    });

    test(`When DELETE article when articleId is not number status code should be 400`, async () => {
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/not-number`)
        .set(`cookie`, adminCookie)
        .send();
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When DELETE article when articleId is number status code should be 204`, async () => {
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send();
      expect(res.statusCode).toBe(HttpCodes.NO_CONTENT);
    });

    test(`When DELETE article without access token status code should be 401`, async () => {
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .send();
      expect(res.statusCode).toBe(HttpCodes.UNAUTHORIZED);
    });

    test(`When DELETE article with not admin access token status code should be 403`, async () => {
      const res = await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, userCookie)
        .send();
      expect(res.statusCode).toBe(HttpCodes.FORBIDDEN);
    });
  });

  describe(`PUT`, () => {
    test(`When PUT article params status code should be 200`, async () => {
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid title when length is less then 30 status code should be 400`, async () => {
      const articleParams = {
        title: getRandomString(AVAILABLE_SYMBOLS, 29),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with valid title when length is equal 30 status code should be 200`, async () => {
      const articleParams = {
        title: getRandomString(AVAILABLE_SYMBOLS, 30),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid title when length is great then 250 status code should be 400`, async () => {
      const articleParams = {
        title: getRandomString(AVAILABLE_SYMBOLS, 251),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with valid title when length is equal 250 status code should be 200`, async () => {
      const articleParams = {
        title: getRandomString(AVAILABLE_SYMBOLS, 250),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid announce when length is less then 30 status code should be 400`, async () => {
      const articleParams = {
        announce: getRandomString(AVAILABLE_SYMBOLS, 29),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with valid announce when length is equal 30 status code should be 200`, async () => {
      const articleParams = {
        announce: getRandomString(AVAILABLE_SYMBOLS, 30),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid announce when length is great then 250 status code should be 400`, async () => {
      const articleParams = {
        announce: getRandomString(AVAILABLE_SYMBOLS, 251),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with valid announce when length is equal 250 status code should be 200`, async () => {
      const articleParams = {
        announce: getRandomString(AVAILABLE_SYMBOLS, 250),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid text when length is great then 1000 status code should be 400`, async () => {
      const articleParams = {
        text: getRandomString(AVAILABLE_SYMBOLS, 1001),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with valid text when length is equal 1000 status code should be 200`, async () => {
      const articleParams = {
        text: getRandomString(AVAILABLE_SYMBOLS, 1000),
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with valid image extension status code should be 200`, async () => {
      const articleParams = {
        image: `123.png`,
      };
      const resWithPng = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(resWithPng.statusCode).toBe(HttpCodes.OK);
      articleParams.image = `123.jpg`;
      const resWithJpg = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(resWithJpg.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article with invalid image extension status code should be 400`, async () => {
      const articleParams = {
        image: `123.pmng`,
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with invalid date format status code should be 400`, async () => {
      const articleParams = {
        date: `10-09-2020`,
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with categories length equal 0 status code should be 400`, async () => {
      const articleParams = {
        categories: [],
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article with not exist property status code should be 400`, async () => {
      const articleParams = {
        test: `test`,
      };
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(articleParams);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article when articleId is not number status code should be 400`, async () => {
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/not-number`)
        .set(`cookie`, adminCookie)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });

    test(`When PUT article when articleId is number status code should be 200`, async () => {
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.OK);
    });

    test(`When PUT article without access token status code should be 401`, async () => {
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.UNAUTHORIZED);
    });

    test(`When PUT article with not admin access token status code should be 403`, async () => {
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, userCookie)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.FORBIDDEN);
    });

    test(`When PUT article with not existed id status code should be 400`, async () => {
      await request(server)
        .delete(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie);
      const res = await request(server)
        .put(`${PATH_TO_ARTICLES}/${article.id}`)
        .set(`cookie`, adminCookie)
        .send(newArticleData);
      expect(res.statusCode).toBe(HttpCodes.BAD_REQUEST);
    });
  });
});
