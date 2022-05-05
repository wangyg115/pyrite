import {globbyWin} from './utils.js'
import path from 'path'
import fs from 'fs-extra'

const groupName = async () => {
    let fp = "\\gows\\galene\\groups\\**\\*.json".replaceAll(path.sep, '/')
    fp.replaceAll('/',path.sep)
    console.log(fp)
    const files = await globbyWin("\\gows\\galene\\groups\\**\\*.json")
       
    console.log(files)
}

groupName();