import { ipcRenderer } from 'electron'
import React, { useState, useEffect, useCallback } from 'react'
import { Container, TextField } from '@material-ui/core'
import { FILE_EVENTS, saveFile, FileInfoType } from '../../fileIO'
import Menu from './menu'

// ipcを利用して、メインプロセスにダイアログ表示を依頼

const openFileDialog = (): void => {
  ipcRenderer.send(FILE_EVENTS.OPEN_DIALOG)
}

const openSaveAsDialog = (fileInfo: FileInfoType): void => {
  ipcRenderer.send(FILE_EVENTS.SAVE_DIALOG, fileInfo)
}

const App: React.FC = () => {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // htmlに埋め込まれた値を取得し、state書き換え。キャッシュ機能あり。
    setText(e.currentTarget.value)
  }, [])

  const handleFileSave = useCallback(() => {
    if (fileName) {
      saveFile(fileName, text)
    } else {
      openSaveAsDialog({
        fileName: '',
        fileText: text,
      })
    }
    // 一時キャッシュに前回記述したファイル名、内容を保存しておく
  }, [fileName, text])

  const handleFileSaveAs = useCallback(() => {
    openSaveAsDialog({
      fileName: fileName,
      fileText: text,
    })
  }, [fileName, text])

  // Dialog選択結果の取得
  /* NOTE:useEffectは再描画毎に実行される関数。
      第2引数を空にすると毎回body丸ごと再描画され危険のため、通常空にすることはない
      空の配列が渡された場合、マウント・アンマウント時のみ第１引数の関数を実行
  */
  useEffect(() => {
    // 開いたファイルの名前とデータを取得
    ipcRenderer.on(FILE_EVENTS.OPEN_FILE, (_, fileInfo: FileInfoType) => {
      setText(fileInfo.fileText)
      setFileName(fileInfo.fileName)
    })
    // 別名保存した際の名前を取得
    ipcRenderer.on(FILE_EVENTS.SAVE_FILE, (_, newFileName: string) => {
      setFileName(newFileName)
    })

    return (): void => {
      ipcRenderer.removeAllListeners(FILE_EVENTS.OPEN_FILE)
      ipcRenderer.removeAllListeners(FILE_EVENTS.SAVE_FILE)
    }
  }, [])

  return (
    <Container>
      <Menu
        onFileOpen={openFileDialog}
        onFileSave={handleFileSave}
        onFileSaveAs={handleFileSaveAs}
      />
      <TextField
        multiline
        fullWidth
        variant='outlined'
        rows={10}
        rowsMax={20}
        value={text}
        inputProps={{
          style: {
            fontSize: 14,
          },
        }}
        onChange={handleChange}
        helperText={fileName || '[Untitled]'}
      />
    </Container>
  )
}

export default App
