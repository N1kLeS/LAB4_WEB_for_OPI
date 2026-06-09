# WEBLAB333

Лабораторная работа по ОПИ.

Проект состоит из:

- `backend` - Jakarta EE backend, REST API, работа с Oracle DB;
- `frontend` - frontend-приложение;
- `functional-tests` - Playwright функциональные тесты;
- `docs/test-cases.md` - 15 тест-кейсов;
- `docker-compose.yml` - запуск базы, backend и frontend;
- `build.gradle` - Gradle-сборка и задачи лабораторной.

## Требования

- Java 17+
- Gradle
- Docker
- Node.js и npm

## Сборка

```bash
gradle build --no-daemon
```

Команда запускает сборку проекта и проверки, включая функциональные тесты через Docker.

Для быстрой проверки компиляции и unit-тестов:

```bash
gradle compile test --no-daemon
```

## Docker

Собрать Docker-образы:

```bash
gradle dockerBuild --no-daemon
```

Запустить приложение:

```bash
gradle dockerUp --no-daemon
```

Остановить приложение:

```bash
gradle dockerDown --no-daemon
```

После запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- Oracle DB: `localhost:1521`

Можно использовать Docker напрямую:

```bash
docker compose up --build -d
docker compose down
```

## Unit Tests

```bash
gradle test --no-daemon
```

Или напрямую для backend:

```bash
gradle :backend:test --no-daemon
```

## Functional Tests

Функциональные тесты запускаются через Gradle:

```bash
gradle functionalTest --no-daemon
```

Эта задача:

1. устанавливает зависимости Playwright через `npm ci`;
2. собирает и запускает Docker Compose;
3. ждёт доступности frontend и backend;
4. запускает 15 Playwright-тестов;
5. останавливает Docker Compose после тестов.

Ручной запуск:

```bash
docker compose up --build -d
cd functional-tests
npm ci
npm test
cd ..
docker compose down
```

## Gradle Tasks

Основные задачи:

- `compile` - компиляция backend и проверка frontend-файлов;
- `build` - сборка проекта и запуск проверок;
- `clean` - удаление build-артефактов и отчётов функциональных тестов;
- `test` - unit-тесты backend;
- `functionalTest` - функциональные Playwright-тесты через Docker;
- `dockerBuild` - сборка Docker-образов;
- `dockerUp` - запуск приложения через Docker Compose;
- `dockerDown` - остановка Docker Compose.

Задачи по варианту:

- `xml` - проверка XML-файлов;
- `music` - проигрывание звука после успешной сборки;
- `native2ascii` - создание ASCII-копий `.properties` файлов;
- `scp` - отправка WAR по SCP при наличии параметров `scp.host`, `scp.user`, `scp.path`;
- `doc` - генерация Javadoc;
- `alt` - сборка альтернативного архива проекта;
- `history` - сохранение последних Git-ревизий;
- `diff` - сохранение текущего Git diff;
- `report` - копирование JUnit XML-отчётов;
- `team` - архив с артефактами сборки и последними Git-ревизиями;
- `env` - вывод информации об окружении.

Проверить список всех задач:

```bash
gradle tasks --all --no-daemon
```
