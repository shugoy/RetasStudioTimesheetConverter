# TimesheetConverter

![teaser](images/teaser.png)
RETAS STUDIOのタイムシートのsxfファイルをjson形式に変換・保存します．

## 使い方
### Windowsの場合
![screenshot](images/screenshot.gif)
- GitHubのReleasesから`sxf2json.exe`をダウンロードして好きな場所に置いて下さい．
- sxfファイル，またはsxfファイルの入ったフォルダを`sxf2json.exe`にドラッグ&ドロップしてください．
- sxfファイルと同じ階層にjsonファイルが出力されます．

### Macの場合
- GitHubのReleasesから`sxf2json`をダウンロードして好きな場所に置いて下さい．
- ターミナルで`sxf2json`のあるディレクトリに移動し，以下のコマンドを実行して下さい．
```
sxf2json <タイムシート.sxf>
```

### After Effectsでタイムシート(.json)の読み込み
![ae](images/ae.gif)

以下のファイル
- `loadTimesheet.jsx`
- `json2.js`[https://gist.github.com/atheken/654510] からダウンロード

を以下のパスに配置してください．
- `C:\Program Files\Adobe\Adobe After Effects <Version>\Support Files\Scripts` (Win) 

- `Applications/Adobe After Effects <Version>/Scripts` (Mac)

実行方法
1. `File > Scripts > Run Script File...`から`loadTimesheet.jsx`を実行．
2. "タイムシートを選択して実行"ボタンを押す．
3. jsonファイルを選択すると，コンポジションの作成とフッテージの読み込み，タイムリマップの設定が行われます．


### After Effectsでタイムシート(.sxf)の読み込み (sxf-->jsonの自動変換)
- AfterEffectsにて`Preferences > Scripting & Expressions > Application Scripting > Allow Scripts to Write Files and Access Network`にチェック.
- `sxf2json.exe`(Win)または`sxf2json`(Mac)をAfterEffectsのScriptsフォルダに配置．
- タイムシート選択時にsxfファイルを選択すると，バイナリが実行され，json変換・読み込みが行われます．(*パスに日本語が含まれているとうまく行かない可能性があります)