package metrics

import (
	"encoding/json"
	"net/http"
	"sync/atomic"
)

type RequestCounter struct {
	count atomic.Int64
}
type MetricsResponse struct {
	Requests int64 `json:"requests"`
}

func (c *RequestCounter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c.count.Add(1)
		next.ServeHTTP(w, r)
	})
}

func (c *RequestCounter) Handler(w http.ResponseWriter, r *http.Request) {
	metR := MetricsResponse{Requests: c.count.Load()}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metR)
}
