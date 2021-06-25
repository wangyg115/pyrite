<img height="100" src="./media/logo-text.svg">

![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)

[Pyrite](https://pyrite.video) is a [Vue 3](https://v3.vuejs.org/) GUI for [Galène](https://github.com/jech/galene);
an efficient [Golang](https://golang.org/)/[Pion](https://github.com/pion/webrtc)-based SFU.
Its goal is to provide simple, yet powerful, user & privacy-friendly video communication to
everyone.

Pyrite is a project with scarce resources. Its focus lies mainly on advancing the GUI,
while piggybacking on advancements of the Galène project. Its architecture is as simple
as possible, in order to keep the project light-weight and easy to grasp.

The **main** Git branch is deployed to [pyrite.video](https://pyrite.video); a public
Galène server, that uses the latest *stable* version of Pyrite. The *develop* branch
is deployed to [beta.pyrite.video](https://beta.pyrite.video) and has the latest
(but incomplete) features.

## Getting started

**requirements:** Docker, Docker-compose & Node.js

* Install Pyrite locally

  ```bash
  git clone git@github.com:garage44/pyrite.git
  cd pyrite
  npm i
  # Start Galène
  npm run galene
  # Start frontend development tool
  npm run dev
  ```

* [Open Pyrite](http://localhost:3000) in a browser and login to the pyrite channel
  using `pyrite` as user and `1234` as password

* Open an extra browser with a fake webcam device

  ```bash
  chromium --use-fake-device-for-media-stream --enable-experimental-web-platform-features --user-data-dir=/tmp/.chromium-tmp
  ```

* Login with the second browser using a random username and password

## Documentation

Checkout the [docs](./docs/index.md) for more information.
