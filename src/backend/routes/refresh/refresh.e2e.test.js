'use strict';

const {parse} = require(`cookie`);
const HttpCodes = require(`http-status-codes`);
const request = require(`supertest`);

const {apiContainer} = require(`../../api`);
const {initDb} = require(`../../db`);
const {getRandomString, getRandomEmail} = require(`../../utils`);


const pathToUser = `/api/user`;
const pathToLogin = `/api/user/login`;
const pathToRefresh = `/api/user/refresh`;
const AVAILABLE_SYMBOLS = `abcdefghijklmnopqrstuvwxyz`;


const password = getRandomString(AVAILABLE_SYMBOLS, 6);

const userDate = {
  firstname: getRandomString(AVAILABLE_SYMBOLS, 10),
  lastname: getRandomString(AVAILABLE_SYMBOLS, 10),
  email: getRandomEmail(100, [`ru`, `com`]),
  avatar: `${getRandomString(AVAILABLE_SYMBOLS, 10)}.png`,
  password,
  repeatedPassword: password,
};

const auth = {
  email: userDate.email,
  password: userDate.password,
};

describe(`Auth API end-points`, () => {
  let server = null;
  let cookies = null;

  beforeAll(async () => {
    await initDb(true);
    server = await apiContainer.getInstance();
    await request(server).post(pathToUser).send(userDate);
  });

  beforeEach(async () => {
    const postAuthRes = await request(server).post(pathToLogin).send(auth);
    cookies = postAuthRes.headers[`set-cookie`];
  });

  afterAll(async () => {
    await apiContainer.destroyInstance();
    server = null;
  });

  test(`When POST auth with valid data status code should be ${HttpCodes.OK}`, async () => {
    const refreshTokenRes = await request(server)
      .post(pathToRefresh)
      .set('cookie', cookies)
      .send();
    expect(refreshTokenRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST auth without token status code should be ${HttpCodes.BAD_REQUEST}`, async () => {
    const refreshTokenRes = await request(server)
      .post(pathToRefresh)
      .send();
    expect(refreshTokenRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST auth with empty token status code should be ${HttpCodes.BAD_REQUEST}`, async () => {
    const refreshTokenRes = await request(server)
      .post(pathToRefresh)
      .set('cookie', [`refreshToken=; Path=/`])
      .send();
    expect(refreshTokenRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST auth with not exist token status code should be ${HttpCodes.NOT_FOUND}`, async () => {
    const refreshTokenRes = await request(server)
      .post(pathToRefresh)
      .set('cookie', [`refreshToken=not-exist-token; Path=/`])
      .send();
    expect(refreshTokenRes.statusCode).toBe(HttpCodes.NOT_FOUND);
  });

  test.each([`accessToken`, `refreshToken`])(`When POST auth with valid data should has %p`, async (propertyName) => {
    const refreshTokenRes = await request(server).post(pathToLogin).send(auth);
    const cookies = refreshTokenRes.headers[`set-cookie`].map((cookie) => parse(cookie));
    const hasCookie = cookies.some((cookie) => Boolean(cookie[propertyName]));
    expect(hasCookie).toBeTruthy();
  });
});