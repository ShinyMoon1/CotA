package service

import (
	"context"
	"sync"
	"testing"
)

func TestPool(t *testing.T) {
	var got []int
	var mu sync.Mutex
	var wg sync.WaitGroup

	pool := NewPool(10, func(ctx context.Context, job UserRegistered) error {
		mu.Lock()
		got = append(got, job.UserID)
		mu.Unlock()
		return nil
	})
	pool.Start(4)
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 10; j++ {
				pool.Submit(UserRegistered{UserID: i*10 + j})
			}
		}()
	}
	wg.Wait()
	pool.Stop()
	if len(got) != 100 {
		t.Fatalf("got %d jobs, want 100", len(got))
	}
}
