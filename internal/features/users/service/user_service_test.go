package service_test

import (
	"context"
	"errors"
	"testing"

	"dayliki/internal/core/domain"
	"dayliki/internal/features/users/service"
)

type fakeUserRepo struct {
	createdFunc func(ctx context.Context, user domain.User) (int, error)
	getFunc     func(ctx context.Context, id int) (domain.User, error)
}

func (f *fakeUserRepo) CreateUser(ctx context.Context, user domain.User) (int, error) {
	return f.createdFunc(ctx, user)
}

func (f *fakeUserRepo) GetUser(ctx context.Context, id int) (domain.User, error) {
	return f.getFunc(ctx, id)
}

func TestCreateUser(t *testing.T) {
	fake := &fakeUserRepo{createdFunc: func(ctx context.Context, user domain.User) (int, error) { return 1, nil }}
	pool := service.NewPool(10, func(ctx context.Context, job service.UserRegistered) error { return nil })

	svc := service.NewUserService(fake, pool)

	tests := []struct {
		name    string
		user    domain.User
		wantID  int
		wantErr bool
	}{
		{"valid user", domain.User{Nick_name: "ivan", Email: "a@b.ru", Password: "secret"}, 1, false},
		{"empty nick", domain.User{Email: "a@b.ru", Password: "secret"}, 0, true},
		{"empty email", domain.User{Nick_name: "ivan", Password: "secret"}, 0, true},
	}

	pool.Start(3)
	defer pool.Stop()
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			id, err := svc.CreateUser(t.Context(), tc.user)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if id != tc.wantID {
				t.Errorf("got id=%d", tc.wantID)
			}
		})

	}
}

func TestGetUser(t *testing.T) {
	fake := &fakeUserRepo{getFunc: func(ctx context.Context, id int) (domain.User, error) {
		if id == 999 {
			return domain.User{}, errors.New("not found")
		}
		return domain.User{ID: id, Nick_name: "sanya", Email: "a@g.com", Password: "secret"}, nil
	},
	}
	pool := service.NewPool(10, func(ctx context.Context, job service.UserRegistered) error { return nil })
	svc := service.NewUserService(fake, pool)

	test := []struct {
		name     string
		id       int
		wantUser domain.User
		wantErr  bool
	}{
		{"valid id", 1, domain.User{ID: 1, Nick_name: "sanya", Email: "a@g.com", Password: "secret"}, false},
		{"empty id", 0, domain.User{Nick_name: "sanya", Email: "a@g.com", Password: "secret"}, true},
		{"id not found", 999, domain.User{ID: 1, Nick_name: "sanya", Email: "a@g.com", Password: "secret"}, true},
	}

	for _, tc := range test {
		t.Run(tc.name, func(t *testing.T) {
			user, err := svc.GetUser(t.Context(), tc.id)
			if tc.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if user != tc.wantUser {
				t.Errorf("got user=%d", tc.wantUser.ID)
			}
		})
	}
}
