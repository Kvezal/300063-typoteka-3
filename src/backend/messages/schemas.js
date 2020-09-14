'use strict';

module.exports = {
  Common: {
    REQUIRED_FIELD: `Поле обязательно для заполнения`,
    EMPTY_VALUE: `Не указано значение`,
  },
  Article: {
    MIN_TITLE_LENGTH: `Заголовок должен содержать не меньше 30 символов`,
    MAX_TITLE_LENGTH: `Заголовок должен содержать не больше 250 символов`,
    IMAGE_EXTENSION: `Допускаются только изображения с расширениемя jpg и png`,
    MIN_CATEGORY_ITEMS: `Необходимо выбрать хотя бы 1 категорию`,
    MIN_ANNOUNCE_LENGTH: `Анонс должен содержать не меньше 30 символов`,
    MAX_ANNOUNCE_LENGTH: `Анонс должен содержать не больше 250 символов`,
    MAX_TEXT_LENGTH: `Текст публикации должен содержать не больше 1000 символов`,
    DATE_FORMAT: `Укажите дату согласно стандарту ISO 8601`
  },
  Comment: {
    MAX_COMMENT_LENGTH: `Комментарий должен содержать не больше 1000 символов`,
  },
};
