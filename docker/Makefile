# ──────────────────────────────────────────────────────────────────────────────
# docker/Makefile
#
# Build and run the Acadia Dashboard container.
# Run from the repo root:   make -f docker/Makefile <target>
# Or from docker/:          make <target>
#
# Variables (override on CLI, e.g. make build TAG=v1.2.3)
# ──────────────────────────────────────────────────────────────────────────────
IMAGE    ?= arches-dashboard
TAG      ?= latest
PORT     ?= 3010
CONTEXT  ?= ..                   # build context = repo root
DOCKERFILE ?= $(CURDIR)/Dockerfile
# Primary LAN IP — used to print the network-reachable URL after `make run`.
HOST_IP ?= $(strip $(shell hostname -I 2>/dev/null | awk '{print $$1}'))

.PHONY: build run stop logs shell clean

## build — build the Docker image
build:
	docker build \
		--file $(DOCKERFILE) \
		--tag $(IMAGE):$(TAG) \
		$(CONTEXT)

## run — run the container in detached mode (replaces any existing one)
## Port is published on 0.0.0.0 so the app is reachable from other hosts.
run:
	docker rm -f $(IMAGE) 2>/dev/null || true
	docker run -d \
		--name $(IMAGE) \
		--publish 0.0.0.0:$(PORT):3010 \
		--restart unless-stopped \
		$(IMAGE):$(TAG)
	@echo "Dashboard running at:"
	@echo "  local:   http://localhost:$(PORT)"
	@if [ -n "$(HOST_IP)" ]; then echo "  network: http://$(HOST_IP):$(PORT)"; fi

## stop — stop and remove the container
stop:
	docker stop $(IMAGE) 2>/dev/null || true
	docker rm   $(IMAGE) 2>/dev/null || true

## logs — tail container logs
logs:
	docker logs -f $(IMAGE)

## shell — open a shell inside the running container
shell:
	docker exec -it $(IMAGE) sh

## clean — remove the image
clean: stop
	docker rmi $(IMAGE):$(TAG) 2>/dev/null || true
