import fs from 'fs'

export enum FILE_EVENTS {
  OPEN_DIALOG = 'open_dialog',
  SAVE_DIALOG = 'save_dialog',
  OPEN_FILE = 'open_file',
  SAVE_FILE = 'save_file',
}

// 拡張子識別
export const FILE_FILTERS: {
  name: string
  extensions: string[]
}[] = [
  { name: 'Text', extensions: ['txt'] },
  { name: 'All Files', extensions: ['*'] },
]

export interface FileInfoType {
  fileName: string
  fileText: string
}

// read読み込み関数
export const readFile = (fileName: string): string => {
  let fileText = ''
  try {
    fileText = fs.readFileSync(fileName, 'utf-8')
  } catch (e) {
    console.log(e)
  }
  return fileText
}

// save書き込み関数
export const saveFile = (fileName: string, fileText: string): void => {
  try {
    fs.writeFileSync(fileName, fileText, 'UTF-8')
  } catch (e) {
    console.log(e)
  }
}
