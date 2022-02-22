# Features

* Dark/light theme (CSS variables)
* I18n (en, fr, nl)
* Install app manifest (Chrome)

## Conference client

* Group list
  * Public and private group overview
  * Participants counter
  * Login screen with cam/mic selection; audio output selection only on Chrome

* Settings
  * Cam & mic setup
  * Theme/language selection
  * Stream bandwidth settings

* Global chat & tabbed private chat

* User list with context menu actions
  * Change Availability status (self)
  * Chat with ... (others)
  * Mute microphone (others, admin-only)
  * Kick (others, admin-only)
  * Remove operator/presenter role (others, admin-only)
  * Send notification (all)

* Stream
  * Volume soundmeter
  * PIP/Fullscreen/Stats

* Room actions
  * Global volume control
  * Toggle mute microphone
  * Raise hand
  * Toggle mute video camera
  * Share screen (optional audio is Chrome tab only)
  * Stream video file (mp4, webm, mkv)

## Management

* Express.js backend
  * Simple permissions check
* Runnable through npx
* Groups
  * Galene groups CRUD
  * Simple client stats graph from Galene
  * View, download & delete recordings
* Users
  * Pyrite users CRUD
  * Galene users sync
  * Galene permissions sync
