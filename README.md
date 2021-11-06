# TimesheetConverter

![teaser](images/teaser.png)
RETAS STUDIOのタイムシートのデータをjson形式に変換・保存します．

## 使い方
```
python3 sxf2json.py <timesheet.sxf>
```

フォルダ一括処理．（再帰的にフォルダ内のsxfファイルを取得してjsonに変換します．）
```
python3 sxf2json.py <フォルダ名>
```