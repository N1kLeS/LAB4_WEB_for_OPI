package ru.nikitka.jooq;

import jakarta.annotation.Resource;
import jakarta.enterprise.context.ApplicationScoped;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.conf.Settings;
import org.jooq.impl.DSL;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@ApplicationScoped
public class JooqUtil {

    @Resource(lookup = "java:/OracleDS")
    private DataSource dataSource;

    private static final String SCHEMA = "STUDENT";

    public DSLContext getDSLContext() {
        try {
            Connection connection = dataSource.getConnection();
            Settings settings = new Settings()
                    .withRenderSchema(true)
                    .withRenderCatalog(false);

            return DSL.using(connection, SQLDialect.DEFAULT, settings);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to get DSLContext", e);
        }
    }

    public <T> T withDSLContext(java.util.function.Function<DSLContext, T> operation) {
        try (Connection connection = dataSource.getConnection()) {
            Settings settings = new Settings()
                    .withRenderSchema(true)
                    .withRenderCatalog(false);
            DSLContext ctx = DSL.using(connection, SQLDialect.DEFAULT, settings);
            return operation.apply(ctx);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to execute JOOQ operation", e);
        }
    }

    public String getSchema() {
        return SCHEMA;
    }
}
