ALTER SESSION SET CONTAINER = FREEPDB1;

CREATE TABLE STUDENT.RESULTS (
                                 ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                 X_VAL      NUMBER(10, 4),
                                 Y_VAL      NUMBER(10, 4),
                                 R_VAL      NUMBER(10, 4),
                                 IS_HIT     NUMBER(1),
                                 CHECK_TIME TIMESTAMP,
                                 USER_ID    NUMBER
);

CREATE TABLE STUDENT.USERS (
                               ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               USERNAME   VARCHAR2(64) UNIQUE NOT NULL,
                               PASS_HASH  VARCHAR2(120) NOT NULL
);

ALTER TABLE STUDENT.RESULTS
    ADD CONSTRAINT FK_RESULTS_USER
        FOREIGN KEY (USER_ID) REFERENCES STUDENT.USERS (ID);
