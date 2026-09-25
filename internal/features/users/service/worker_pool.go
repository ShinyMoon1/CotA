package service

import (
	"context"
	"sync"
)

type UserRegistered struct {
	UserID int
}

type Pool struct {
	jobs   chan UserRegistered
	wg     sync.WaitGroup
	handle func(ctx context.Context, job UserRegistered) error
}

func NewPool(buffer int, handle func(ctx context.Context, job UserRegistered) error) *Pool {
	jobs := make(chan UserRegistered, buffer)
	return &Pool{
		jobs:   jobs,
		handle: handle,
	}
}

func (p *Pool) Start(workers int) {
	for i := 0; i < workers; i++ {
		p.wg.Add(1)
		go func() {
			defer p.wg.Done()
			for job := range p.jobs {
				p.handle(context.Background(), job)
			}
		}()
	}
}

func (p *Pool) Submit(job UserRegistered) {
	p.jobs <- job
}

func (p *Pool) Stop() {
	close(p.jobs)
	p.wg.Wait()
}
