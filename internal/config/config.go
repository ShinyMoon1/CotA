package config

import (
	"fmt"
	"os"
)

type Config struct {
	DBUser     string
	DBPassword string
	DBName     string
}

func mustEnv(name string) (string, error) {
	v, ok := os.LookupEnv(name)
	if !ok {
		return "", fmt.Errorf("config: %s is required", name)
	}
	return v, nil
}

func New() (*Config, error) {
	user, err := mustEnv("POSTGRES_USER")
	if err != nil {
		return nil, err
	}

	password, err := mustEnv("POSTGRES_PASSWORD")
	if err != nil {
		return nil, err
	}

	nameDB, err := mustEnv("POSTGRES_DB")
	if err != nil {
		return nil, err
	}

	return &Config{DBUser: user, DBPassword: password, DBName: nameDB}, nil
}
