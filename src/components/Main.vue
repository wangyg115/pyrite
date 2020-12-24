<template>
    <div id="main" class="app">
        <div class="row full-height">
            <nav id="left-sidebar">
                <div class="users-header">
                    <div class="galene-header">
                        Galène
                    </div>
                </div>
                <div class="header-sep" />
                <div id="users" />
            </nav>
            <div class="container">
                <header>
                    <nav class="topnav navbar navbar-expand navbar-light fixed-top">
                        <div id="header">
                            <div
                                id="sidebarCollapse"
                                class="collapse"
                                title="Collapse left panel"
                            >
                                <svg
                                    aria-hidden="true"
                                    class="svg-inline--fa"
                                    data-icon="align-left"
                                    role="img"
                                    viewBox="0 0 448 512"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M288 44v40c0 8.837-7.163 16-16 16H16c-8.837 0-16-7.163-16-16V44c0-8.837 7.163-16 16-16h256c8.837 0 16 7.163 16 16zM0 172v40c0 8.837 7.163 16 16 16h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16zm16 312h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm256-200H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16h256c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <h1
                                id="title"
                                class="header-title"
                            />
                        </div>

                        <ul class="nav-menu">
                            <li>
                                <button
                                    id="presentbutton"
                                    class="invisible btn btn-success"
                                >
                                    <i
                                        aria-hidden="true"
                                        class="fas fa-play"
                                    /><span class="nav-text"> Ready</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    id="unpresentbutton"
                                    class="invisible btn btn-cancel"
                                >
                                    <i
                                        aria-hidden="true"
                                        class="fas fa-stop"
                                    /><span class="nav-text"> Panic</span>
                                </button>
                            </li>
                            <li>
                                <div
                                    id="mutebutton"
                                    class="nav-link nav-button"
                                >
                                    <span><i
                                        aria-hidden="true"
                                        class="fas fa-microphone-slash"
                                    /></span>
                                    <label>Mute</label>
                                </div>
                            </li>
                            <li>
                                <div
                                    id="sharebutton"
                                    class="invisible nav-link nav-button"
                                >
                                    <span><i
                                        aria-hidden="true"
                                        class="fas fa-share-square"
                                    /></span>
                                    <label>Share Screen</label>
                                </div>
                            </li>
                            <li>
                                <div
                                    id="unsharebutton"
                                    class="invisible nav-link nav-button nav-cancel"
                                >
                                    <span><i
                                        aria-hidden="true"
                                        class="fas fa-window-close"
                                    /></span>
                                    <label>Unshare Screen</label>
                                </div>
                            </li>
                            <li>
                                <div
                                    id="stopvideobutton"
                                    class="invisible nav-link nav-button nav-cancel"
                                >
                                    <span><i
                                        aria-hidden="true"
                                        class="fas fa-window-close"
                                    /></span>
                                    <label>Stop Video</label>
                                </div>
                            </li>
                            <li>
                                <div
                                    id="openside"
                                    class="nav-button nav-link nav-more"
                                >
                                    <span><i
                                        aria-hidden="true"
                                        class="fas fa-ellipsis-v"
                                    /></span>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </header>
                <div
                    id="mainrow"
                    class="row full-width"
                >
                    <div
                        id="left"
                        class="coln-left"
                    >
                        <div id="chat">
                            <div id="chatbox">
                                <div
                                    id="close-chat"
                                    class="close-chat"
                                    title="Hide chat"
                                >
                                    <span class="close-icon" />
                                </div>
                                <div id="box" />
                                <div class="reply">
                                    <form id="inputform">
                                        <textarea
                                            id="input"
                                            class="form-reply"
                                        />
                                        <input
                                            id="inputbutton"
                                            class="btn btn-default"
                                            type="submit"
                                            value="&#10148;"
                                        >
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="resizer" />
                    <div
                        id="right"
                        class="coln-right"
                    >
                        <span
                            id="switch-video"
                            class="show-video blink"
                        ><i
                            aria-hidden="true"
                            class="fas fa-exchange"
                        /></span>
                        <div
                            id="collapse-video"
                            class="collapse-video"
                        >
                            <i
                                class="far fa-comment-alt open-chat"
                                title="Open chat"
                            />
                        </div>
                        <div
                            id="video-container"
                            class="video-container no-video"
                        >
                            <div
                                id="expand-video"
                                class="expand-video"
                            >
                                <div id="peers" />
                            </div>
                        </div>
                        <div
                            id="login-container"
                            class="login-container invisible"
                        >
                            <div class="login-box">
                                <form
                                    id="userform"
                                    class="userform"
                                >
                                    <label for="username">Username</label>
                                    <input
                                        id="username"
                                        autocomplete="username"
                                        class="form-control"
                                        name="username"
                                        type="text"
                                    >
                                    <label for="password">Password</label>
                                    <input
                                        id="password"
                                        autocomplete="current-password"
                                        class="form-control"
                                        name="password"
                                        type="password"
                                    >
                                    <label>Auto ready</label>
                                    <div class="present-switch">
                                        <p class="switch-radio">
                                            <input
                                                id="presentoff"
                                                checked
                                                name="presentradio"
                                                type="radio"
                                                value=""
                                            >
                                            <label for="presentoff">Disabled</label>
                                        </p>
                                        <p class="switch-radio">
                                            <input
                                                id="presentmike"
                                                name="presentradio"
                                                type="radio"
                                                value="mike"
                                            >
                                            <label for="presentmike">Enable microphone</label>
                                        </p>
                                        <p class="switch-radio">
                                            <input
                                                id="presentboth"
                                                name="presentradio"
                                                type="radio"
                                                value="both"
                                            >
                                            <label for="presentboth">Enable camera and microphone</label>
                                        </p>
                                    </div>
                                    <div class="clear" />
                                    <div class="connect">
                                        <input
                                            id="connectbutton"
                                            class="btn btn-blue"
                                            type="submit"
                                            value="Connect"
                                        >
                                    </div>
                                </form>
                                <div class="clear" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HelloWorld',
    props: {
        msg: String,
    },
    data() {
        return {
            count: 0,
        }
    },
}
</script>
