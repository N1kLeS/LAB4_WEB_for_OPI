package ru.nikitka.ejb;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jooq.Record;
import org.jooq.Result;
import org.mindrot.jbcrypt.BCrypt;
import ru.nikitka.jooq.JooqUtil;
import ru.nikitka.model.entity.UserEntity;

import java.util.Optional;

import static org.jooq.impl.DSL.*;

@Stateless
public class UserService {

    @Inject
    private JooqUtil jooqUtil;

    private static final String USERS_TABLE = "USERS";
    private static final String ID_COL = "ID";
    private static final String USERNAME_COL = "USERNAME";
    private static final String PASS_HASH_COL = "PASS_HASH";

    public Optional<UserEntity> findByUsername(String username) {
        return jooqUtil.withDSLContext(ctx -> {
            Result<Record> result = ctx.select()
                    .from(table(name(jooqUtil.getSchema(), USERS_TABLE)))
                    .where(field(name(jooqUtil.getSchema(), USERS_TABLE, USERNAME_COL)).eq(username))
                    .fetch();

            if (result.isEmpty()) {
                return Optional.empty();
            }

            Record record = result.get(0);
            UserEntity user = new UserEntity();
            user.setId(record.get(ID_COL, Long.class));
            user.setUsername(record.get(USERNAME_COL, String.class));
            user.setPasswordHash(record.get(PASS_HASH_COL, String.class));
            return Optional.of(user);
        });
    }

    public Optional<UserEntity> findById(Long id) {
        return jooqUtil.withDSLContext(ctx -> {
            Result<Record> result = ctx.select()
                    .from(table(name(jooqUtil.getSchema(), USERS_TABLE)))
                    .where(field(name(jooqUtil.getSchema(), USERS_TABLE, ID_COL)).eq(id))
                    .fetch();

            if (result.isEmpty()) {
                return Optional.empty();
            }

            Record record = result.get(0);
            UserEntity user = new UserEntity();
            user.setId(record.get(ID_COL, Long.class));
            user.setUsername(record.get(USERNAME_COL, String.class));
            user.setPasswordHash(record.get(PASS_HASH_COL, String.class));
            return Optional.of(user);
        });
    }

    public boolean checkPassword(UserEntity user, String rawPassword) {
        return BCrypt.checkpw(rawPassword, user.getPasswordHash());
    }

    @Transactional
    public UserEntity createUser(String username, String rawPassword) {
        if (findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Пользователь существует");
        }

        String passwordHash = BCrypt.hashpw(rawPassword, BCrypt.gensalt());

        return jooqUtil.withDSLContext(ctx -> {
            int rowsAffected = ctx.insertInto(table(name(jooqUtil.getSchema(), USERS_TABLE)))
                    .set(field(name(jooqUtil.getSchema(), USERS_TABLE, USERNAME_COL)), username)
                    .set(field(name(jooqUtil.getSchema(), USERS_TABLE, PASS_HASH_COL)), passwordHash)
                    .execute();

            if (rowsAffected == 0) {
                throw new RuntimeException("Не удалось создать пользователя.");
            }

            Record record = ctx.select(max(field(name(jooqUtil.getSchema(), USERS_TABLE, ID_COL))).as("MAX_ID"))
                    .from(table(name(jooqUtil.getSchema(), USERS_TABLE)))
                    .fetchOne();

            Long id = record != null ? record.get("MAX_ID", Long.class) : null;
            UserEntity user = new UserEntity();
            user.setId(id);
            user.setUsername(username);
            user.setPasswordHash(passwordHash);
            return user;
        });
    }
}

