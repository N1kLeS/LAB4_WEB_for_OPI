FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q package

FROM quay.io/wildfly/wildfly:34.0.1.Final-jdk17

COPY --from=build /app/target/jsf-area-check-backend.war /opt/jboss/wildfly/standalone/deployments/jsf-area-check-backend.war

EXPOSE 8080 9990