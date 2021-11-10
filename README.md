# TimesheetConverter

![teaser](images/teaser.png)
RETAS STUDIOのタイムシートのsxfファイルをjson形式に変換・保存します．

## 使い方
### sxfファイルをjsonファイルに変換
```
python3 sxf2json.py <タイムシート.sxf>
```

### フォルダ一括処理
```
pip3 install glob tqdm
python3 sxf2json.py <フォルダ名>
```
再帰的にフォルダ内のsxfファイルを取得してjsonに変換します．

### After Effectsでタイムシートの読み込み
以下のファイルを`Applications/Adobe After Effects <Version>/Scripts`に配置してください．
- `loadTimesheet.jsx`
- `initComp.json`
- `json2.js`[https://gist.github.com/atheken/654510] からダウンロード

1. `File > Scripts > Run Script File...`から`loadTimesheet.jsx`を実行．
2. "タイムシートを選択して実行"ボタンを押す．
3. jsonファイルを選択すると，コンポジションの作成とフッテージの読み込み，タイムリマップの設定が行われます．

`initComp.json`にてコンポジション設定の初期設定を編集することができます．

#### スクリプトからsxfファイルを選択してpythonによるjson変換を自動で実行
- AfterEffectsにて`Preferences > Scripting & Expressions > Application Scripting > Allow Scripts to Write Files and Access Network`にチェック.
- `sxf2json.py`をAfterEffectsのScriptsフォルダに配置．
- jsonファイル選択時にsxfファイルを選択すると，pythonが実行され，json変換・読み込みが行われます．(*パスに日本語が含まれているとうまく行かない可能性があります)