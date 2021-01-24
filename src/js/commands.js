/**
 * A command known to the command-line parser.
 *
 * @typedef {Object} command
 * @property {string} [parameters]
 *     - A user-readable list of parameters.
 * @property {string} [description]
 *     - A user-readable description, null if undocumented.
 * @property {() => string} [predicate]
 *     - Returns null if the command is available.
 * @property {(c: string, r: string) => void} f
 */

/**
 * The set of commands known to the command-line parser.
 *
 * @type {Object.<string,command>}
 */
let commands = {}

function operatorPredicate() {
    if(serverConnection && serverConnection.permissions &&
       serverConnection.permissions.op)
        return null
    return 'You are not an operator'
}

function recordingPredicate() {
    if(serverConnection && serverConnection.permissions &&
       serverConnection.permissions.record)
        return null
    return 'You are not allowed to record'
}

commands.help = {
    description: 'display this help',
    f: (c, r) => {
        /** @type {string[]} */
        let cs = []
        for(let cmd in commands) {
            let c = commands[cmd]
            if(!c.description)
                continue
            if(c.predicate && c.predicate())
                continue
            cs.push(`/${cmd}${c.parameters?' ' + c.parameters:''}: ${c.description}`)
        }
        cs.sort()
        let s = ''
        for(let i = 0; i < cs.length; i++)
            s = s + cs[i] + '\n'
        addToChatbox(null, null, null, Date.now(), false, null, s)
    },
}

commands.me = {
    f: (c, r) => {
        // handled as a special case
        throw new Error("this shouldn't happen")
    },
}

commands.set = {
    f: (c, r) => {
        if(!r) {
            let settings = getSettings()
            let s = ""
            for(let key in settings)
                s = s + `${key}: ${JSON.stringify(settings[key])}\n`
            addToChatbox(null, null, null, Date.now(), false, null, s)
            return
        }
        let p = parseCommand(r)
        let value
        if(p[1]) {
            value = JSON.parse(p[1])
        } else {
            value = true
        }
        updateSetting(p[0], value)
        reflectSettings()
    },
}

commands.unset = {
    f: (c, r) => {
        delSetting(r.trim())
        return
    },
}

commands.leave = {
    description: "leave group",
    f: (c, r) => {
        if(!serverConnection)
            throw new Error('Not connected')
        serverConnection.close()
    },
}

commands.clear = {
    predicate: operatorPredicate,
    description: 'clear the chat history',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'clearchat')
    },
}

commands.lock = {
    predicate: operatorPredicate,
    description: 'lock this group',
    parameters: '[message]',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'lock', r)
    },
}

commands.unlock = {
    predicate: operatorPredicate,
    description: 'unlock this group, revert the effect of /lock',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'unlock')
    },
}

commands.record = {
    predicate: recordingPredicate,
    description: 'start recording',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'record')
    },
}

commands.unrecord = {
    predicate: recordingPredicate,
    description: 'stop recording',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'unrecord')
    },
}

commands.subgroups = {
    predicate: operatorPredicate,
    description: 'list subgroups',
    f: (c, r) => {
        serverConnection.groupAction(getUsername(), 'subgroups')
    },
}

commands.renegotiate = {
    description: 'renegotiate media streams',
    f: (c, r) => {
        for(let id in serverConnection.up)
            serverConnection.up[id].restartIce()
        for(let id in serverConnection.down)
            serverConnection.down[id].restartIce()
    },
}

commands.msg = {
    parameters: 'user message',
    description: 'send a private message',
    f: (c, r) => {
        let p = parseCommand(r)
        if(!p[0])
            throw new Error('/msg requires parameters')
        let id = findUserId(p[0])
        if(!id)
            throw new Error(`Unknown user ${p[0]}`)
        let username = getUsername()
        serverConnection.chat(username, '', id, p[1])
        addToChatbox(serverConnection.id, id, username,
            Date.now(), false, '', p[1])
    },
}


commands.kick = {
    parameters: 'user [message]',
    description: 'kick out a user',
    predicate: operatorPredicate,
    f: userCommand,
}

commands.op = {
    parameters: 'user',
    description: 'give operator status',
    predicate: operatorPredicate,
    f: userCommand,
}

commands.unop = {
    parameters: 'user',
    description: 'revoke operator status',
    predicate: operatorPredicate,
    f: userCommand,
}

commands.present = {
    parameters: 'user',
    description: 'give user the right to present',
    predicate: operatorPredicate,
    f: userCommand,
}

commands.unpresent = {
    parameters: 'user',
    description: 'revoke the right to present',
    predicate: operatorPredicate,
    f: userCommand,
}

commands.mute = {
    parameters: 'user',
    description: 'mute a remote user',
    predicate: operatorPredicate,
    f: userMessage,
}

commands.warn = {
    parameters: 'user message',
    description: 'send a warning to a user',
    predicate: operatorPredicate,
    f: (c, r) => {
        userMessage('warning', r)
    },
}

commands.wall = {
    parameters: 'message',
    description: 'send a warning to all users',
    predicate: operatorPredicate,
    f: (c, r) => {
        if(!r)
            throw new Error('empty message')
        serverConnection.userMessage(getUsername(), 'warning', '', r)
    },
}


/**
 * @param {string} user
 */
function findUserId(user) {
    if(user in users)
        return user

    for(let id in users) {
        if(users[id] === user)
            return id
    }
    return null
}



/**
 * parseCommand splits a string into two space-separated parts.  The first
 * part may be quoted and may include backslash escapes.
 *
 * @param {string} line
 * @returns {string[]}
 */
function parseCommand(line) {
    let i = 0
    while(i < line.length && line[i] === ' ')
        i++
    let start = ' '
    if(i < line.length && line[i] === '"' || line[i] === "'") {
        start = line[i]
        i++
    }
    let first = ""
    while(i < line.length) {
        if(line[i] === start) {
            if(start !== ' ')
                i++
            break
        }
        if(line[i] === '\\' && i < line.length - 1)
            i++
        first = first + line[i]
        i++
    }

    while(i < line.length && line[i] === ' ')
        i++
    return [first, line.slice(i)]
}


/**
   @param {string} c
   @param {string} r
*/
function userCommand(c, r) {
    let p = parseCommand(r)
    if(!p[0])
        throw new Error(`/${c} requires parameters`)
    let id = findUserId(p[0])
    if(!id)
        throw new Error(`Unknown user ${p[0]}`)
    serverConnection.userAction(getUsername(), c, id, p[1])
}

function userMessage(c, r) {
    let p = parseCommand(r)
    if(!p[0])
        throw new Error(`/${c} requires parameters`)
    let id = findUserId(p[0])
    if(!id)
        throw new Error(`Unknown user ${p[0]}`)
    serverConnection.userMessage(getUsername(), c, id, p[1])
}

export default commands