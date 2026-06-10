FROM gradle:8.10.2-jdk17 AS build

WORKDIR /app

COPY settings.gradle build.gradle gradle.properties ./
COPY buildSrc buildSrc
COPY backend/build.gradle backend/build.gradle

RUN gradle :backend:dependencies --no-daemon

COPY backend/src backend/src

RUN gradle :backend:war --no-daemon

FROM quay.io/wildfly/wildfly:34.0.1.Final-jdk17

COPY --from=build /app/backend/build/libs/jsf-area-check-backend.war /opt/jboss/wildfly/standalone/deployments/jsf-area-check-backend.war

EXPOSE 8080 9990
