# Инструкция для работы с проектом

Для запуска проекта необходимо иметь созданные БД и пользователя БД, все переменные окружения описаны
в файле `environments.md`, для работы приложения нужно, чтобы были указаны переменные из блока `Important params`
в `.env` файле (для ускорения создания БД и пользователя БД смотреть ниже в разделе CLI)

## Содержание
* [CLI](#cli)
* [Подготовка среды и запуск проекта](#подготовка-среды-и-запуск-проекта)
* [Подготовка среды и запуск тестов](#подготовка-среды-и-запуск-тестов)
* [Скрипты](#скрипты)
* [Дополнителная информация](#дополнителная-информация)


## <a name="#cli"></a>CLI

Для работы CLI:
1) в коревой директории проекта создайте файл `.env`
2) выполните команду `npm install && npm link` (установит все зависимости и позволит использовать CLI через `typoteka`)
3) ознакомьтесь с доступными командами выполнив `typoteka --help`)

Если пункт 3 выдаст ошибку возможностями CLI можно пользоваться указывая путь до скрипта `cli.js` находящегося в
корневой директории проекта, например `node ./cli.js --help`.


## <a name="#подготовка-среды-и-запуск-проекта"></a>Подготовка среды и запуск проекта

Для работы проекта все необходимые переменные берутся из `.env` (в качестве значений выбираются переменные
с префикос `DEV_`), поэтому добавьте все необходимое в этот файл и затем выполните следующие шаги:
1) установить PostgreSQL (должен быть доступен CLI для работы с PostgreSQL);
2) выполните команду `typoteka --init-db` - создает пользователя БД и БД, нужно будет ввести пароль суперпользователя,
по-умолчанию им является `postgres`, если у вас другой, то его можно передать параметром, например так `typoteka --init-db test`
в данном случае суперпользователем будет `test`;
3) выполните команду `typoteka --init-db-tables` - создаёт все необходимые таблицы для работы приложения;
4) выполните команду `typoteka --fill-db <КОЛИЧЕСТВО_ЗАПИСЕЙ>` - заполняет все таблицы БД моковыми данными, например
`typoteka --fill-db 100` создаст во всех таблицах по 100 записей;
5) выполните один из сриптов для запуска приложения, описание в разделе скрипты.

Шагами 3 и 4 можно пренебречь, если нужны пустые таблицы. Если на втором шаге произошла ошибка создания пользователя БД
или самой БД, можно выполнить команду, которая удалит пользователя БД и БД - `typoteka --delete-db`, будьте осторожны
выполнение команды, может привести к потере данных, или создать недостающую сущность вручную.


## <a name="#подготовка-среды-и-запуск-тестов"></a>Подготовка среды и запуск тестов

Для работы тестов необходимо:
1) иметь установленный PostgreSQL (должен быть доступен CLI для работы с PostgreSQL);
2) выполните команду `NODE_ENV=test typoteka --init-db` - создает пользователя БД и БД, нужно будет ввести пароль
суперпользователя, по-умолчанию им является `postgres`, если у вас другой, то его можно передать параметром, например
так `NODE_ENV=test typoteka --init-db test` в данном случае суперпользователем будет `test`;
3) выполните один из нижеописанных сриптов для запуска тестов, описание в разделе скрипты.

Если на втором шаге произошла ошибка создания пользователя БД или самой БД, можно выполнить команду, которая удалит
пользователя БД и БД - `NODE_ENV=test typoteka --delete-db`, будьте осторожны, выполнение этой команды, может привести
к потере данных, или создать недостающую сущность вручную.


## <a name="#скрипты"></a>Скрипты

Запуск приложения:
1) `start` - в продуктовом режиме
2) `start::dev` - в режиме разработки
3) `start::debug` - в режиме отладки
4) `start::backend` - backend в продуктовом режиме
5) `start::backend::dev` - backend в режиме разработки
6) `start::backend::debug` - backend в режиме отладки
7) `start::frontend` - frontend в продуктовом режиме
8) `start::frontend::dev` - frontend в режиме разработки
9) `start::frontend::debug` - frontend в режиме отладки

Запуск тестов:
1) `test` - все включая линтер
2) `test::backend` - backend
3) `test::backend::dev` - backend в режиме разработки
4) `test::common` - builder приложений
5) `test::common::dev` - builder приложений в режиме разработки
6) `eslint` - линтер для проверки кода на соответствие style guide

Инициализация:
1) `init` - инициализирует необходимые директории для работы приложения
2) `init::backend` - инициализирует необходимые директории для работы backend
3) `init::frontend` - инициализирует необходимые директории для работы frontend


## <a name="#дополнителная-информация"></a>Дополнителная информация
1) описание всех переменных в `./environments.md`
2) описание AppBuilder в `./src/common/app-builder/app-builder.md`