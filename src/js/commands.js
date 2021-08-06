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

function findUserId(username) {
    for(const user of app.$s.users) {
        if(user.username === username) {
            return user.id
        }
    }
    return null
}

function userCommand(c, r) {
    let p = parseCommand(r)
    if(!p[0]) throw new Error(`/${c} requires parameters`)
    let id = findUserId(p[0])
    if(!id) throw new Error(`Unknown user ${p[0]}`)
    app.connection.userAction(c, id, p[1])
}

function userMessage(c, r) {
    let p = parseCommand(r)
    if(!p[0]) throw new Error(`/${c} requires parameters`)
    let id = findUserId(p[0])
    if(!id) throw new Error(`Unknown user ${p[0]}`)
    app.connection.userMessage(c, id, p[1])
}

let commands = {}

function operatorPredicate() {
    if(app.connection && app.connection.permissions &&
        app.connection.permissions.op)
        return null
    return 'You are not an operator'
}

function recordingPredicate() {
    if(app.connection && app.connection.permissions &&
        app.connection.permissions.record)
        return null
    return 'You are not allowed to record'
}

commands.help = {
    description: 'display this help',
    f: () => {
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
        app.$s.chat.channels.main.messages.push({message: s, nick: null, time: Date.now()})
    },
}

commands.me = {
    f: () => {
        // handled as a special case
        throw new Error("this shouldn't happen")
    },
}

commands.leave = {
    description: "leave group",
    f: () => {
        if(!app.connection)
            throw new Error('Not connected')
        app.connection.close()
    },
}

commands.clear = {
    description: 'clear the chat history',
    f: () => {
        app.connection.groupAction('clearchat')
    },
    predicate: operatorPredicate,
}

commands.lock = {
    description: 'lock this group',
    f: (c, r) => {
        app.connection.groupAction('lock', r)
    },
    parameters: '[message]',
    predicate: operatorPredicate,
}

commands.unlock = {
    description: 'unlock this group, revert the effect of /lock',
    f: () => {
        app.connection.groupAction('unlock')
    },
    predicate: operatorPredicate,
}

commands.record = {
    description: 'start recording',
    f: () => {
        app.connection.groupAction('record')
    },
    predicate: recordingPredicate,
}

commands.unrecord = {
    description: 'stop recording',
    f: () => {
        app.connection.groupAction('unrecord')
    },
    predicate: recordingPredicate,
}

commands.subgroups = {
    description: 'list subgroups',
    f: () => {
        app.connection.groupAction('subgroups')
    },
    predicate: operatorPredicate,
}

commands.renegotiate = {
    description: 'renegotiate media streams',
    f: () => {
        for(let id in app.connection.up) {
            app.connection.up[id].restartIce()
        }
        for(let id in app.connection.down) {
            app.connection.down[id].restartIce()
        }
    },
}

commands.kick = {
    description: 'kick out a user',
    f: userCommand,
    parameters: 'user [message]',
    predicate: operatorPredicate,
}

commands.op = {
    description: 'give operator status',
    f: userCommand,
    parameters: 'user',
    predicate: operatorPredicate,
}

commands.unop = {
    description: 'revoke operator status',
    f: userCommand,
    parameters: 'user',
    predicate: operatorPredicate,
}

commands.present = {
    description: 'give user the right to present',
    f: userCommand,
    parameters: 'user',
    predicate: operatorPredicate,
}

commands.unpresent = {
    description: 'revoke the right to present',
    f: userCommand,
    parameters: 'user',
    predicate: operatorPredicate,
}

commands.mute = {
    description: 'mute a remote user',
    f: userMessage,
    parameters: 'user',
    predicate: operatorPredicate,
}

commands.muteall = {
    description: 'mute all remote users',
    f: () => {
        app.connection.userMessage('mute', null, null, true)
    },
    predicate: operatorPredicate,
}

commands.warn = {
    description: 'send a warning to a user',
    f: (c, r) => {
        userMessage('warning', r)
    },
    parameters: 'user message',
    predicate: operatorPredicate,
}

commands.wall = {
    description: 'send a warning to all users',
    f: (c, r) => {
        if(!r) throw new Error('empty message')
        app.connection.userMessage('warning', '', r)
    },
    parameters: 'message',
    predicate: operatorPredicate,

}

/**
 * parseCommand splits a string into two space-separated parts.
 * The first part may be quoted and may include backslash escapes.
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

export default commands
