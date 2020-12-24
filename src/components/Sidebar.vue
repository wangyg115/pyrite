<template>
    <div id="sidebarnav" class="sidenav">
        <div class="sidenav-header">
            <h2>Settings</h2>
            <a id="clodeside" class="closebtn"><i aria-hidden="true" class="fas fa-times" /></a>
        </div>
        <div id="optionsdiv" class="sidenav-content">
            <div id="profile" class="profile invisible">
                <div class="profile-user">
                    <div class="profile-logo">
                        <span><i aria-hidden="true" class="fas fa-user" /></span>
                    </div>
                    <div class="profile-info">
                        <span id="userspan" />
                        <span id="permspan" />
                    </div>
                    <div class="user-logout">
                        <a id="disconnectbutton">
                            <span class="logout-icon"><i class="fas fa-sign-out-alt" /></span>
                            <span class="logout-text">Logout</span>
                        </a>
                    </div>
                </div>
            </div>
            <div id="mediaoptions" class="invisible">
                <fieldset>
                    <legend>Media Options</legend>
                    <label class="sidenav-label-first" for="videoselect">Camera:</label>
                    <select id="videoselect" class="select select-inline">
                        <option value="">
                            off
                        </option>
                    </select>

                    <label class="sidenav-label" for="audioselect">Microphone:</label>
                    <select id="audioselect" class="select select-inline">
                        <option value="">
                            off
                        </option>
                    </select>

                    <form>
                        <input id="blackboardbox" type="checkbox">
                        <label for="blackboardbox">Blackboard mode</label>
                    </form>
                </fieldset>
            </div>

            <fieldset>
                <legend>Other Settings</legend>

                <form id="sendform">
                    <label class="sidenav-label-first" for="sendselect">Send:</label>
                    <select id="sendselect" class="select select-inline">
                        <option value="lowest">
                            lowest
                        </option>
                        <option value="low">
                            low
                        </option>
                        <option selected value="normal">
                            normal
                        </option>
                        <option value="unlimited">
                            unlimited
                        </option>
                    </select>
                </form>

                <form id="requestform">
                    <label class="sidenav-label" for="requestselect">Receive:</label>
                    <select id="requestselect" class="select select-inline">
                        <option value="">
                            nothing
                        </option>
                        <option value="audio">
                            audio only
                        </option>
                        <option value="screenshare">
                            screen share
                        </option>
                        <option selected value="everything">
                            everything
                        </option>
                    </select>
                </form>

                <form>
                    <input id="activitybox" type="checkbox">
                    <label for="activitybox">Activity detection</label>
                </form>
            </fieldset>

            <form id="fileform">
                <label class=".sidenav-label-first" for="fileinput">Play local file:</label>
                <input
                    id="fileinput" accept="audio/*,video/*"
                    multiple
                    type="file"
                >
            </form>
        </div>
    </div>
</template>

<script>
export default {

}
</script>