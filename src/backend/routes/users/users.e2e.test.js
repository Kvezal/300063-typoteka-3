'use strict';

const HttpCodes = require(`http-status-codes`);
const request = require(`supertest`);

const {apiContainer} = require(`../../api`);
const {initDb} = require(`../../db`);
const {getRandomString, getRandomEmail} = require(`../../utils`);


const PATH_TO_USER = `/api/user`;
const AVAILABLE_SYMBOLS = `abcdefghijklmnopqrstuvwxyz`;

const getUserDate = () => {
  const password = getRandomString(AVAILABLE_SYMBOLS, 6);
  return {
    firstname: getRandomString(AVAILABLE_SYMBOLS, 10),
    lastname: getRandomString(AVAILABLE_SYMBOLS, 10),
    email: getRandomEmail(100, [`ru`, `com`]),
    avatar: `${getRandomString(AVAILABLE_SYMBOLS, 10)}.png`,
    password,
    repeatedPassword: password,
  };
};

describe(`User API end-points`, () => {
  let server = null;

  beforeAll(async () => {
    await initDb(true);
    server = await apiContainer.getInstance();
  });

  afterAll(async () => {
    await apiContainer.destroyInstance();
    server = null;
  });

  test(`When POST user with valid data status code should be 200`, async () => {
    const userDate = getUserDate();
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test.each(
    [`firstname`, `lastname`, `email`, `password`, `repeatedPassword`]
  )(`When POST user without %p field data status code should be 400`, async (propertyName) => {
    const userDate = getUserDate();
    delete userDate[propertyName];
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test.each(
    [`firstname`, `lastname`, `email`, `password`, `repeatedPassword`]
  )(`When POST user without %p field data status code should be 400`, async (propertyName) => {
    const userDate = getUserDate();
    userDate[propertyName] = ``;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with invalid symbols in "firstname" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.firstname = `invalid-firstname`;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with max length "firstname" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.firstname = getRandomString(AVAILABLE_SYMBOLS, 50);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with too long "firstname" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.firstname = getRandomString(AVAILABLE_SYMBOLS, 51);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with invalid symbols in "lastname" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.lastname = `invalid-lastname`;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with max length "lastname" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.lastname = getRandomString(AVAILABLE_SYMBOLS, 50);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with too long "lastname" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.lastname = getRandomString(AVAILABLE_SYMBOLS, 51);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with invalid "email" pattern status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.email = `invalid-email`;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with max length "email" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.email = getRandomEmail(100, [`ru`, `com`]);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with too long "email" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.email = getRandomEmail(101, [`ru`, `com`]);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with exist email status code should be 400`, async () => {
    const userDate = getUserDate();
    await request(server).post(PATH_TO_USER).send(userDate);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user without "avatar" field status code should be 200`, async () => {
    const userDate = getUserDate();
    delete userDate.avatar;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with empty "avatar" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.avatar = ``;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with max length "avatar" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.avatar = `${getRandomString(AVAILABLE_SYMBOLS, 96)}.jpg`;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with too long "avatar" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.avatar = `${getRandomString(AVAILABLE_SYMBOLS, 97)}.jpg`;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with min length "password" field status code should be 200`, async () => {
    const userDate = getUserDate();
    userDate.password = getRandomString(AVAILABLE_SYMBOLS, 6);
    userDate.repeatedPassword = userDate.password;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.OK);
  });

  test(`When POST user with too short "password" field status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.password = getRandomString(AVAILABLE_SYMBOLS, 5);
    userDate.repeatedPassword = userDate.password;
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });

  test(`When POST user with different "password" and "repeatedPassword" status code should be 400`, async () => {
    const userDate = getUserDate();
    userDate.password = getRandomString(AVAILABLE_SYMBOLS, 6);
    userDate.repeatedPassword = getRandomString(AVAILABLE_SYMBOLS, 7);
    const postUserRes = await request(server).post(PATH_TO_USER).send(userDate);
    expect(postUserRes.statusCode).toBe(HttpCodes.BAD_REQUEST);
  });
});
