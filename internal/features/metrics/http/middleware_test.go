package metrics

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func MiddlewareTest(t *testing.T) {
	counter := &RequestCounter{}
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	wrapped := counter.Middleware(next)
	req := httptest.NewRequest("GET", "/x", nil)
	rec := httptest.NewRecorder()
	wrapped.ServeHTTP(rec, req)
	if got := counter.count.Load(); got != 1 {
		t.Fatalf("got %d, want 1", got)
	}
}
