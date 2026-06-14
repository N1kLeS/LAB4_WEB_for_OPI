# WEBLAB333

Лабораторная работа по ОПИ.

## Структура проекта

- `backend` - Jakarta EE backend, REST API, Oracle DB.
- `frontend` - frontend-приложение.
- `functional-tests` - Playwright-тесты.
- `docs/test-cases.md` - 15 тест-кейсов.
- `assets/sounds` - звук для Gradle task `music`.
- `gradle.properties` - параметры сборки и лабораторных задач.
- `docker-compose.yml` - запуск DB, backend и frontend.
- `build.gradle` - корневой Gradle-сценарий.

## Требования

- Java 17+
- Docker
- Node.js и npm

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

Остановить приложение и удалить volume базы:

```bash
./gradlew dockerDown --no-daemon
```

Адреса после запуска:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- Oracle DB: `localhost:1521`

## Unit Tests

```bash
./gradlew test --no-daemon
```

## Functional Tests

```bash
./gradlew functionalTest --no-daemon
```

Задача `functionalTest` собирает Docker-образы, поднимает окружение, ждёт frontend/backend, выполняет `npm ci`, устанавливает Chromium через Playwright, запускает 15 e2e-тестов и завершает окружение через `docker compose down -v`.

## Документация

```bash
./gradlew doc --no-daemon
```

Результат:

```text
build/distributions/WEBLAB333-doc.zip
```

В архив входят:

- `javadoc/`
- `META-INF/MANIFEST.MF`
- `checksums.txt` с MD5 и SHA-1 файлов проекта

## Отправка WAR на сервер

Параметры сервера задаются в `gradle.properties`:

```properties
scpHost=helios.cs.ifmo.ru
scpPort=2222
scpUser=s466495
scpPath=~
scpIdentity=
```

Запуск:

```bash
./gradlew scp
```

Пароль не хранится в проекте и вводится вручную в терминале при запросе `scp`.

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

Задачи по варианту:

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
