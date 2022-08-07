package db

import (
	"context"
	"database/sql"
	"strings"
)

type MigrationHistory struct {
	Version   string
	CreatedTs int64
}

type MigrationHistoryUpsert struct {
	Version string
}

type MigrationHistoryFind struct {
	Version *string
}

func (db *DB) FindMigrationHistory(ctx context.Context, find *MigrationHistoryFind) (*MigrationHistory, error) {
	tx, err := db.Db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	list, err := findMigrationHistoryList(ctx, tx, find)
	if err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	} else {
		return list[0], nil
	}
}

func (db *DB) UpsertMigrationHistory(ctx context.Context, upsert *MigrationHistoryUpsert) (*MigrationHistory, error) {
	tx, err := db.Db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	migrationHistory, err := upsertMigrationHistory(ctx, tx, upsert)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return migrationHistory, nil
}

func findMigrationHistoryList(ctx context.Context, tx *sql.Tx, find *MigrationHistoryFind) ([]*MigrationHistory, error) {
	where, args := []string{"1 = 1"}, []interface{}{}

	if v := find.Version; v != nil {
		where, args = append(where, "version = ?"), append(args, *v)
	}

	query := `
		SELECT 
			version,
			created_ts
		FROM
			migration_history
		WHERE ` + strings.Join(where, " AND ") + `
		ORDER BY created_ts DESC
	`
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	migrationHistoryList := make([]*MigrationHistory, 0)
	for rows.Next() {
		var migrationHistory MigrationHistory
		if err := rows.Scan(
			&migrationHistory.Version,
			&migrationHistory.CreatedTs,
		); err != nil {
			return nil, err
		}

		migrationHistoryList = append(migrationHistoryList, &migrationHistory)
	}

	return migrationHistoryList, nil
}

func upsertMigrationHistory(ctx context.Context, tx *sql.Tx, upsert *MigrationHistoryUpsert) (*MigrationHistory, error) {
	query := `
		INSERT INTO migration_history (
			version
		)
		VALUES (?)
		ON CONFLICT(version) DO UPDATE
		SET
			version=EXCLUDED.version
		RETURNING version, created_ts
	`
	row, err := tx.QueryContext(ctx, query, upsert.Version)
	if err != nil {
		return nil, err
	}
	defer row.Close()

	row.Next()
	var migrationHistory MigrationHistory
	if err := row.Scan(
		&migrationHistory.Version,
		&migrationHistory.CreatedTs,
	); err != nil {
		return nil, err
	}

	return &migrationHistory, nil
}
