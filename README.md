<img height="100" src="./media/logo-text.svg">

![Pyrite build passing](https://github.com/garage44/pyrite/actions/workflows/test.yml/badge.svg)

[Pyrite](https://pyrite.video) is a web-based GUI for [Galène](https://github.com/jech/galene);
a high-performance [Golang](https://golang.org/)/[Pion](https://github.com/pion/webrtc)-based SFU.

Its purpose is to provide a simple, yet powerful, well-designed, user & privacy-friendly
(video) communication experience for organisations interested in improving their
remote communication.

Pyrite is a low-resource project. Its focus lies mainly on advancing the GUI,
while piggybacking on advancements of the main Galène project. The frontend
architecture is meant to stay as simple as possible. It is component-based (Vue-3)
and uses POJO state. By keeping it simple, Pyrite can keep developing new features
at a fast rate, while keeping the cognitive load/learning curve low for developers.

The **main** Git branch is deployed to [pyrite.video](https://pyrite.video); a public
Galène server, that uses the latest *stable* version of Pyrite. The *develop* branch
is continuously deployed to [beta.pyrite.video](https://beta.pyrite.video) and has
the latest (but incomplete) features, which can be previewed/tested there.

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

## Deployment

* Setup the [Galène SFU](https://github.com/garage44/pyrite/wiki/SFU-Config)
* Setup a [proxy](https://github.com/garage44/pyrite/wiki/Proxy-Config) for your domain
