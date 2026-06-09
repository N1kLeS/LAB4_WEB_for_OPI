package ru.nikitka.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.Result;
import ru.nikitka.jooq.JooqUtil;
import ru.nikitka.model.entity.ResultEntity;
import ru.nikitka.model.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.jooq.impl.DSL.*;

@Stateless
public class ResultService {

    @Inject
    private JooqUtil jooqUtil;

    private static final String RESULTS_TABLE = "RESULTS";
    private static final String USERS_TABLE = "USERS";
    private static final String ID_COL = "ID";
    private static final String X_VAL_COL = "X_VAL";
    private static final String Y_VAL_COL = "Y_VAL";
    private static final String R_VAL_COL = "R_VAL";
    private static final String IS_HIT_COL = "IS_HIT";
    private static final String CHECK_TIME_COL = "CHECK_TIME";
    private static final String USER_ID_COL = "USER_ID";

    public List<ResultEntity> findByUser(UserEntity user) {
        return jooqUtil.withDSLContext(ctx -> {
            Result<Record> result = ctx.select()
                    .from(table(name(jooqUtil.getSchema(), RESULTS_TABLE)))
                    .where(field(name(jooqUtil.getSchema(), RESULTS_TABLE, USER_ID_COL)).eq(user.getId()))
                    .orderBy(field(name(jooqUtil.getSchema(), RESULTS_TABLE, CHECK_TIME_COL)).desc())
                    .fetch();

            List<ResultEntity> entities = new ArrayList<>();
            for (Record record : result) {
                ResultEntity entity = mapToResultEntity(record);
                entity.setUser(user);
                entities.add(entity);
            }
            return entities;
        });
    }

    @Transactional
    public ResultEntity save(double x, double y, double r, UserEntity user) {
        boolean hit = isHit(x, y, r);
        LocalDateTime checkTime = LocalDateTime.now();
        java.sql.Timestamp timestamp = java.sql.Timestamp.valueOf(checkTime);

        return jooqUtil.withDSLContext(ctx -> {
            int rowsAffected = ctx.insertInto(table(name(jooqUtil.getSchema(), RESULTS_TABLE)))
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, X_VAL_COL)), x)
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, Y_VAL_COL)), y)
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, R_VAL_COL)), r)
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, IS_HIT_COL)), hit ? 1 : 0)
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, CHECK_TIME_COL)), timestamp)
                    .set(field(name(jooqUtil.getSchema(), RESULTS_TABLE, USER_ID_COL)), user.getId())
                    .execute();

            if (rowsAffected == 0) {
                throw new RuntimeException("Результат не удалось сохранить.");
            }

            Record record = ctx.select(max(field(name(jooqUtil.getSchema(), RESULTS_TABLE, ID_COL))).as("MAX_ID"))
                    .from(table(name(jooqUtil.getSchema(), RESULTS_TABLE)))
                    .fetchOne();

            Long id = record != null ? record.get("MAX_ID", Long.class) : null;

            ResultEntity entity = new ResultEntity();
            entity.setId(id);
            entity.setX(x);
            entity.setY(y);
            entity.setR(r);
            entity.setHit(hit);
            entity.setCheckTime(checkTime);
            entity.setUser(user);
            return entity;
        });
    }

    private ResultEntity mapToResultEntity(Record record) {
            ResultEntity entity = new ResultEntity();
            entity.setId(record.get(ID_COL, Long.class));
            entity.setX(record.get(X_VAL_COL, Double.class));
            entity.setY(record.get(Y_VAL_COL, Double.class));
            entity.setR(record.get(R_VAL_COL, Double.class));
            Integer isHit = record.get(IS_HIT_COL, Integer.class);
            entity.setHit(isHit != null && isHit == 1);
            java.sql.Timestamp timestamp = record.get(CHECK_TIME_COL, java.sql.Timestamp.class);
            if (timestamp != null) {
                entity.setCheckTime(timestamp.toLocalDateTime());
            }
            Long userId = record.get(USER_ID_COL, Long.class);
        return entity;
    }

    public boolean isHit(double x, double y, double r) {
        if (r <= 0) return false;

        if (x >= 0 && y >= 0 && (x * x + y * y <= r * r)) {
            return true;
        }

        if (x >= 0 && x <= r / 2.0 && y <= 0 && y >= -r) {
            return true;
        }

        if (x <= 0 && y <= 0) {
            double yLine = -0.5 * x - r / 2.0;
            if (y >= yLine && x >= -r) {
                return true;
            }
        }

        return false;
    }
}

