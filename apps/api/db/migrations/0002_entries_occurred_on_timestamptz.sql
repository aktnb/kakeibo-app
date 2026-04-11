-- occurred_on を DATE から TIMESTAMPTZ に変更し時刻情報も保持できるようにする
ALTER TABLE entries ALTER COLUMN occurred_on TYPE TIMESTAMPTZ USING occurred_on::TIMESTAMPTZ;
