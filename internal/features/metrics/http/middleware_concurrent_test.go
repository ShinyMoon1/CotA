package metrics

import (
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
)

func TestMiddleware_Concurrent(t *testing.T) {
	var wg sync.WaitGroup
	counter := &RequestCounter{}
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	wrapped := counter.Middleware(next)
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				req := httptest.NewRequest("GET", "/x", nil)
				rec := httptest.NewRecorder()
				wrapped.ServeHTTP(rec, req)
			}
		}()
	}
	wg.Wait()
	if got := counter.count.Load(); got != 10000 {
		t.Fatalf("got %d, want 10000", got)
	}
}
