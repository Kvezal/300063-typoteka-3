-- Добавить админа и пользователей блога
INSERT INTO accounts VALUES
(DEFAULT,'Иван', 'Иванов', 'ivan@mail.ru', 'avatar-1.png', 'q1w2e3', 'admin'),
(DEFAULT,'Сергей', 'Есенин', 'huligan@mail.ru', 'avatar-2.png', 'q1w2e3', 'user'),
(DEFAULT,'Лев', 'Толстой', 'graf@mail.ru', 'avatar-3.png', 'q1w2e3', 'user'),
(DEFAULT,'Александр', 'Пушкин', 'onegin@mail.ru', 'avatar-4.png', 'q1w2e3', 'user'),
(DEFAULT,'Михаил', 'Лермонтов', 'borodino@mail.ru', 'avatar-5.png', 'q1w2e3', 'user');


-- Добавить статьи
INSERT INTO articles VALUES
(
  DEFAULT,
  'Как начать программировать',
  'Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать.',
  'Это один из лучших рок-музыкантов. Он написал больше 30 хитов. Золотое сечение — соотношение двух величин, гармоническая пропорция. Программировать не настолько сложно, как об этом говорят. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.',
  '2019-11-17 04:12:52',
  'forest@1x.jpg'
),
(
  DEFAULT,
  'Обзор новейшего смартфона',
  'Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.',
  'Первая большая ёлка была установлена только в 1938 году. Программировать не настолько сложно, как об этом говорят. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Простые ежедневные упражнения помогут достичь успеха. Собрать камни бесконечности легко, если вы прирожденный герой. Это один из лучших рок-музыкантов.',
  '2020-02-22 01:08:14',
  'sea@1x.jpg'
),
(
  DEFAULT,
  'Как достигнуть успеха не вставая с кресла',
  'Этот смартфон — настоящая находка. Большой и яркий экран, мощнейший процессор — всё это в небольшом гаджете.',
  'Ёлки — это не просто красивое дерево. Это прочная древесина. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Золотое сечение — соотношение двух величин, гармоническая пропорция. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Собрать камни бесконечности легко, если вы прирожденный герой. Достичь успеха помогут ежедневные повторения. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Программировать не настолько сложно, как об этом говорят. Первая большая ёлка была установлена только в 1938 году.',
  '2020-05-09 12:43:22',
  'skyscraper@1x.jpg'
);

-- Добавить категории
INSERT INTO categories VALUES
(DEFAULT, 'Деревья'),
(DEFAULT, 'За жизнь'),
(DEFAULT, 'Без рамки'),
(DEFAULT, 'Разное'),
(DEFAULT, 'IT'),
(DEFAULT, 'Музыка'),
(DEFAULT, 'Кино'),
(DEFAULT, 'Программирование'),
(DEFAULT, 'Железо');

-- Добавить комментарии
INSERT INTO comments VALUES
(DEFAULT, 'Согласен с автором!', '2020-02-01 10:48:27', 1, 1),
(DEFAULT, 'Давно не пользуюсь стационарными компьютерами. Ноутбуки победили.', '2020-04-25 11:37:10', 2, 1),
(DEFAULT, 'Мне кажется или я уже читал это где-то?', '2020-02-22 01:08:14', 3, 1),
(DEFAULT, 'Это где ж такие красоты?', '2019-02-01 10:48:27', 4, 2),
(DEFAULT, 'Хочу такую же футболку :-)', '2019-11-17 04:12:52', 5, 1);

-- Добавить категории для статей
INSERT INTO articles_categories VALUES
(1, 1),
(1, 3),
(1, 4),
(2, 2),
(2, 7),
(3, 4),
(3, 5),
(3, 2);
