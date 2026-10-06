package auth

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type ctxKey int

const userIDKey ctxKey = 0

func UserIDFromContext(ctx context.Context) (int, bool) {
	id, ok := ctx.Value(userIDKey).(int)
	if !ok || id <= 0 {
		return 0, false
	}
	return id, true
}

func RequireAuth(secret []byte, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}
		const prefix = "Bearer "
		if !strings.HasPrefix(authHeader, prefix) {
			http.Error(w, "invalid authorization header", http.StatusUnauthorized)
			return
		}
		token := strings.TrimPrefix(authHeader, prefix)
		if token == "" {
			http.Error(w, "empty token", http.StatusUnauthorized)
			return
		}
		parsed, err := jwt.Parse(token, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return secret, nil
		})
		if err != nil || !parsed.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		claims, ok := parsed.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "invalid claims", http.StatusUnauthorized)
			return
		}
		sub, ok := claims["sub"].(float64)
		if !ok || sub <= 0 {
			http.Error(w, "invalid subject", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, int(sub))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
