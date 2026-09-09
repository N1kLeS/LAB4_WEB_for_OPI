# WEBLAB333

Лабораторная работа по ОПИ.

## Структура проекта

- `backend` - Jakarta EE backend, REST API, Oracle DB.
- `backend/db-init` - SQL-инициализация базы данных для Docker.
- `frontend` - frontend-приложение.
- `functional-tests` - Playwright e2e-тесты.
- `docs/test-cases.md` - 15 ручных тест-кейсов.
- `assets/sounds` - звук для Gradle-задачи `music`.
- `buildSrc` - Gradle convention scripts и задачи.
- `gradle/wrapper` - Gradle Wrapper для запуска через `./gradlew`.
- `gradle.properties` - параметры сборки, Docker-задач, `scp`, `team`, `env`.
- `docker-compose.yml` - запуск DB, backend, frontend и профиля `functional-tests`.
- `settings.gradle` - список Gradle-модулей.
- `build.gradle` - корневой Gradle-сценарий.

## INFO

Gradle Wrapper включён в проект, поэтому команды запускаются через `./gradlew`.

## Сборка

Полная сборка с проверками:

```bash
./gradlew clean build --no-daemon
```

Быстрая проверка компиляции и unit-тестов:

```bash
./gradlew compile test --no-daemon
```

## Docker

Собрать Docker-образы:

```bash
./gradlew dockerBuild --no-daemon
```

Запустить приложение:

```bash
./gradlew dockerUp --no-daemon
```

Остановить приложение и удалить:

```bash
./gradlew dockerDown --no-daemon
```

Адреса после запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- Oracle DB: `localhost:1521`

## Docker-задачи

Сборка проекта внутри контейнера:

```bash
./gradlew dockerBuildInContainer
```

Unit-тесты внутри контейнера:

```bash
./gradlew dockerTest
```

Функциональные тесты в контейнеризированном окружении:

```bash
./gradlew dockerFunctionalTest
```

Сборка нескольких ревизий проекта в Docker:

```bash
./gradlew dockerTeam
```

## Unit Tests

```bash
./gradlew test --no-daemon
```

## Functional Tests

```bash
./gradlew functionalTest --no-daemon
```

## Gradle Tasks

Основные задачи:

- `compile` - компиляция backend и проверка frontend-файлов.
- `build` - сборка проекта и проверки.
- `clean` - удаление build-артефактов.
- `test` - unit-тесты backend.
- `functionalTest` - Playwright-тесты через Docker.
- `dockerBuild` - сборка Docker-образов.
- `dockerUp` - запуск Docker Compose.
- `dockerDown` - остановка Docker Compose с удалением volume.

- `xml` - проверка XML-файлов.
- `music` - проигрывание звука после успешной сборки.
- `native2ascii` - создание ASCII-копий `.properties`.
- `scp` - отправка backend WAR на сервер по SCP.
- `doc` - Javadoc, manifest, checksums и zip-архив.
- `alt` - альтернативная копия проекта с заменами классов из `gradle.properties`.
- `history` - проверка последних Git-ревизий во временных worktree.
- `diff` - сохранение состояния рабочей копии и diff.
- `report` - запуск тестов и сохранение JUnit XML.
- `team` - сборка 4 предыдущих ревизий и zip с отчётами/артефактами.
- `env` - проверка окружения по параметрам из `gradle.properties`.

Показать все задачи:

```bash
./gradlew tasks --all --no-daemon
```

## Базовый запуск проекта
ON
```bash
docker compose up -d --build
```
OFF
```bash
docker compose down
```