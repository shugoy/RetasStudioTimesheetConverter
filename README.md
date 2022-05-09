# RetasStudio Timesheet Converter

![teaser](images/teaser.png)
RETAS STUDIOのタイムシートのsxfファイルをjson形式に変換・保存します．

## 使い方
### Windowsの場合
![screenshot](images/screenshot.gif)
- GitHubのReleasesから`sxf2json.exe`をダウンロードして好きな場所に置いて下さい．
- sxfファイル，またはsxfファイルを含んだフォルダを`sxf2json.exe`にドラッグ&ドロップしてください．
- sxfファイルと同じ階層にjsonファイルが出力されます．

### Macの場合
- GitHubのReleasesから`sxf2json`をダウンロードして好きな場所に置いて下さい．
- ターミナルで`sxf2json`のあるディレクトリに移動し，以下のコマンドを実行して下さい．
```
sxf2json <タイムシート.sxf>
```
- sxfファイルを含んだフォルダに対して実行
```
sxf2json <タイムシートを含んだフォルダ>
```
### Pythonで実行 (Win/Mac)
- ターミナル/コマンドプロンプトで`sxf2json.py`のあるディレクトリに移動し，以下のコマンドを実行して下さい．
```
python3 sxf2json.py <タイムシート.sxf>
```
- sxfファイルを含んだフォルダに対して実行
```
python3 sxf2json <タイムシートを含んだフォルダ>
```
## After Effectsでタイムシート(.json)の読み込み
![ae](images/ae.gif)

`loadTimesheet.jsx`を以下のパスに配置してください．
- `C:\Program Files\Adobe\Adobe After Effects <Version>\Support Files\Scripts\ScriptUI Panels` (Win) 

- `Applications/Adobe After Effects <Version>/Scripts/ScriptUI Panels` (Mac)

実行方法
1. After Effectsの`Window > Load Timesheet.jsx`にチェックしてLoad Timesheetパネルを表示
2. Load Timesheetパネルの"実行"ボタンを押す．
3. jsonファイルを選択すると，コンポジションの作成とフッテージの読み込み，タイムリマップの設定が実行されます．


### After Effectsでタイムシート(.sxf)の読み込み (sxf-->jsonの自動変換)
- After Effectsにて`Preferences > Scripting & Expressions > Application Scripting > Allow Scripts to Write Files and Access Network`にチェック.
- `sxf2json.exe`(Win)または`sxf2json`(Mac)または`sxf2json.py`(Win/Mac)をAfterEffectsの`Scripts/ScriptUI Panels`フォルダに配置．
- タイムシート選択時にsxfファイルを選択すると，バイナリが実行され，json変換・読み込みが行われます．(*パスに日本語が含まれているとうまく行かない可能性があります)