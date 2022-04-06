![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)
<br /><br />
<img height="100" src="./ui/public/logo-text.svg">
<br />

[Galène](https://galene.org/) is a videoconference server (an “SFU”) that is easy
to deploy and that requires moderate server resources. [Pyrite](https://pyrite.video)
is an alternative web client and management interface based on the
[Vue](https://v3.vuejs.org/) framework. Checkout the documentation to learn more
about Pyrite's [features](./docs/features.md) or to find instructions how to
deploy Pyrite on a network.

# Installation

## Docker

For a quick try, you're probably best of trying the Docker-compose config.

```bash
git clone https://github.com/garage44/pyrite
cd pyrite/docker
PYRITE_UID=1000 PYRITE_GID=1000 docker-compose up
```

## Vanilla Galène

As an alternative, build Galène manually with Pyrite running directly from npm(npx).

```bash
git clone https://github.com/jech/galene
cd galene
git checkout galene-0.5.1
CGO_ENABLED=0 go build -ldflags='-s -w'
mkdir -p {data,groups,recordings}
./galene --insecure
```

### Using Npx (Published version)

This is the Express service that also hosts the frontend files in one service.

```bash
npx @garage44/pyrite:latest
```

### Manual build (Development)

For development, to get a grasp of how services interact, you should try the
manual build. The Express service and the frontend (Vitejs) are started
separately to keep development easier:

```bash
cd pyrite
npm install
npm run dev  # run frontend service on http://localhost:3000
nodemon admin/app.js  # run Express backend on http://localhost:3030
```

:tada: Open a browser: <http://localhost:3030>

<img height="300" width="50%" src="./docs/pyrite.png">
<img height="300" width="49.5%" src="./docs/pyrite-admin.png">
