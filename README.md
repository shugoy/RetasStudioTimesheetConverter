# TimesheetConverter

![teaser](images/teaser.png)
RETAS STUDIOのタイムシートのsxfファイルをjson形式に変換・保存します．

## 使い方
```
python3 sxf2json.py <タイムシート.sxf>
```

### フォルダ一括処理
```
pip3 install glob tqdm
python3 sxf2json.py <フォルダ名>
```
再帰的にフォルダ内のsxfファイルを取得してjsonに変換します．