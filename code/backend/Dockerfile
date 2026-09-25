# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# Stage 2: Run the application
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["sh", "-c", "java -Xmx128m -Xms128m -XX:MaxMetaspaceSize=128m -Xss512k -jar app.jar --server.port=${SERVER_PORT:-8082} --spring.flyway.enabled=true --spring.flyway.locations=classpath:db/migration --spring.jpa.hibernate.ddl-auto=update"]
