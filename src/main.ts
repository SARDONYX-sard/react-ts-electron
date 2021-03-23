import os from 'os'
import path from 'path'
import { BrowserWindow, app, session, dialog, ipcMain } from 'electron'

import { FILE_EVENTS, readFile, saveFile, FileInfoType, FILE_FILTERS } from './fileIO'

// entry(最初に読まれるhtml)
const mainURL = `file://${__dirname}/index.html`
// Window
let mainWindow: BrowserWindow | null = null

// ------------------------life cycle関連  start------------------------------ -----------------

// アプリ起動後にWindowを立ち上げる
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true },
  })

  mainWindow.loadURL(mainURL)
  // 開発者ツールも同時に開く
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// アプリ起動後、非同期処理でReact開発ツール拡張機能(ver 4.10.1_0)を有効化、
// その後Windowを立ち上げ
const reactDevToolsPath = path.join(
  os.homedir(),
  'AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.10.1_0'
)
app
  .whenReady()
  .then(async () => {
    await session.defaultSession.loadExtension(reactDevToolsPath, {
      allowFileAccess: true,
    })
    createWindow()
  })
  .catch((e) => {
    console.log(e)
  })

// アプリの起動と終了
app.on('window-all-closed', () => {
  app.quit()
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
// ------------------------life cycle関連  end------------------------------ -------------------

// ファイルを開く
ipcMain.on(FILE_EVENTS.OPEN_DIALOG, () => {
  if (mainWindow === null) return
  const fileNames: string[] | undefined = dialog.showOpenDialogSync(mainWindow, {
    // propertiesの指定でファイル選択モードでダイアログを開く
    properties: ['openFile'],
    filters: FILE_FILTERS,
  })
  if (!fileNames || !fileNames.length) return
  const fileText = readFile(fileNames[0])
  //レンダラープロセスへ送信
  mainWindow.webContents.send(FILE_EVENTS.OPEN_FILE, {
    fileName: fileNames[0],
    fileText,
  })
})

// 名前をつけて保存する
ipcMain.on(FILE_EVENTS.SAVE_DIALOG, (_, fileInfo: FileInfoType) => {
  if (mainWindow === null) return
  const newFileName: string | undefined = dialog.showSaveDialogSync(mainWindow, {
    defaultPath: fileInfo.fileName,
    filters: FILE_FILTERS,
  })
  if (!newFileName) return
  saveFile(newFileName, fileInfo.fileText)
  //レンダラープロセスへ送信
  mainWindow.webContents.send(FILE_EVENTS.SAVE_FILE, newFileName)
})
