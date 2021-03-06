// path delimiter
if (Folder.fs == "Macintosh") {
    var delimiter = "/";
} else if (Folder.fs == "Windows") {
    var delimiter = "\\";
}

var scriptFile = new File($.fileName);
var scriptDir = scriptFile.parent.fsName;

function getTimesheetFromDialog() {
    var openPath = File.openDialog("タイムシート[.json/.sxf]を選択してください", "");
    if (openPath === null) {
        return null;
    } 
    var ext = openPath.name.split('.').slice(-1)[0];
    
    if (ext == "json") {
        return openPath;
    }
    else if (ext == "sxf" || ext == "tsf") {
        var fsName = openPath.fsName;
        var sxf2jsonPath = scriptDir + delimiter + "sxf2json";
        if (Folder.fs == "Windows" && File(sxf2jsonPath+".exe").exists) {
            var cmd = sxf2jsonPath+".exe";
        } else if (Folder.fs == "Macintosh" && File(sxf2jsonPath).exists) {
            var cmd = sxf2jsonPath;
        } else if (File(sxf2jsonPath+".py").exists) {
            var cmd = ["python3", sxf2jsonPath+".py"].join(" ");
        } else {
            alert(scriptDir+"にsxf2json[.exe/.py]が存在しません．");
            return null;
        }
        var cmd = [cmd, fsName].join(" ");
        var result = system.callSystem(cmd);
        return new File(openPath.fsName.split('.')[0] + ".json");
    }
    else {
        return -1;
    }
}

function loadJsonFile(_filepath) {
    var myFile = new File(_filepath);
    if (myFile.open("r")) {
        myFile.encoding = "UTF-8";
        var myJson = myFile.read();
        var myObject = JSON.parse(myJson);
        myFile.close();
    }

    return myObject;
}

function createNewComposition(tsObject, name, width, height) {
    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    var pixelAspect = 1;
    var duration = n_frames / fps;
    return app.project.items.addComp(name, width, height, pixelAspect, duration, fps);
}

function getFootagePath(pathdir, layerName) {
    var exts = [".tga", ".TGA", ".png", ".PNG", ".jpg", ".JPG", ".tiff", ".TIFF"];
    for (var i=0; i<5; i++) {
        for (var j=0; j<exts.length; j++) {
            var number = "00001".slice(-i);
            var path = [pathdir, layerName, layerName + number + exts[j]].join(delimiter);
            var file = File(path);
            if (file.exists) return file
        }
    }
    return null;
}

function runTimeSheet() {

    var file = getTimesheetFromDialog();

    if (file === null) {  // Cancel
        return;
    }
    else if (file == -1) {
        alert("ファイルを読み込めませんでした．")
        return;
    } 
    else if (!file.exists) {
        alert(file.fsName + "が存在しません．")
        return;
    }

    filepath = file.fsName;
    var name = file.parent.name;

    var tsObject = loadJsonFile(filepath);

    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    app.project.frameRate = fps;
    app.project.timeDisplayType = TimeDisplayType.FRAMES;

    var theComp = null
    var theFolder = app.project.items.addFolder(name);
    var pathdir = filepath.split(delimiter).slice(0, -1).join(delimiter);

    const layerNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (var idx_layer=0; idx_layer<n_layers-1; idx_layer++) {
        var layerName = layerNames[idx_layer];

        var file = getFootagePath(pathdir, layerName);
        if (file === null) continue;
        
        if (file.exists) {
            var io = new ImportOptions(file);
        }
        else continue;
    
        // 画像シーケンスを読み込み
        if (!io.canImportAs(ImportAsType.FOOTAGE)) continue;
        io.importAs = ImportAsType.FOOTAGE;
        io.sequence = true;
        io.forceAlphabetical = true;
        var img_sequence = app.project.importFile(io);
        img_sequence.parentFolder = theFolder;
        img_sequence.mainSource.conformFrameRate = fps;
        
        // コンポジションの作成
        if (theComp === null) {
            var width = img_sequence.width;
            var height = img_sequence.height;
            theComp = createNewComposition(tsObject, name, width, height);
            theComp.openInViewer();
        }
        // コンポジションにレイヤーを追加
        var theLayer = theComp.layers.add(img_sequence);
        
        // タイムリマップを有効化
        theLayer.timeRemapEnabled = true;
        var timeRemapProp = theLayer.property("ADBE Time Remapping")
        // タイムリマップは初期状態で先頭と末尾に打たれるので，末尾を削除
        timeRemapProp.removeKey(timeRemapProp.numKeys);

        var frameDuration = img_sequence.frameDuration;
        theLayer.outPoint = n_frames * frameDuration;
        
        var isVisible = false;
        for (var idx_frame = 0; idx_frame < n_frames-1; idx_frame++) {
            var frame_value = tsObject.inbetween[layerName][idx_frame];
            if (frame_value > 0) {
                // inpointを設定
                if (isVisible == false) {
                    theLayer.inPoint = idx_frame*frameDuration;
                    theLayer.outPoint = theLayer.outPoint - theLayer.inPoint;
                    isVisible = true;
                }
                var time_sec = idx_frame * frameDuration;
                var val_sec = (frame_value - 1) * frameDuration;
                timeRemapProp.setValueAtTime(time_sec, val_sec);
                // 一番後ろのキーの設定
                timeRemapProp.setInterpolationTypeAtKey(timeRemapProp.numKeys, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD)
            } 
        }   
    }
}


// GUI setting
function createUI(thisObj){
    var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Compose from Timesheet",
    [100, 100, 300, 300]);
    
    var btnRun = myPanel.add('button', [10, 10, 10+90, 10+20], '実行');
    btnRun.onClick = function (){
        runTimeSheet();
    };

    // myPanel.add('statictext', [10, 40, 10+140, 40+20], "スクリプトパスを表示");
    // var btn_showScriptDir = myPanel.add('button', [10+140+10, 40, 10+140+10+30, 40+20], 'スクリプトパスを表示');
    var btn_showScriptDir = myPanel.add('button', [10, 40, 10+140+10+30, 40+20], 'スクリプトパスを表示');
    btn_showScriptDir.onClick = function () {
        alert(scriptDir)
    }
    
    // myPanel.add('statictext', [10, 40, 10+140, 40+20], "sxf2json");
    // var textui_sxf2json_path = myPanel.add('edittext', [10, 60, 10+140, 60+20]);
    // var btn_sxf2json_path = myPanel.add('button', [10+140+10, 60, 10+140+10+30, 60+20], '...');
    
    // btn_sxf2json_path.onClick = function btnfn_sxf2json_path(){
    //     var openPath = File.openDialog("sxf2json[.exe/.py]を選択してください", "");
    //     if (openPath === null) {
    //         alert("ファイルを読み込めませんでした．")
    //         return;
    //     } else {
    //         scriptDir = openPath.parent.fsName;
    //         textui_sxf2json_path.text = openPath.fsName;
    //     }
    // }
    // textui_sxf2json_path.onChanging = function () {
    //     scriptFile = new File(textui_sxf2json_path.text);
    //     scriptDir = scriptFile.parent.fsName;
    // }

    return myPanel;
}

var myToolsPanel = createUI(this);

// for debugging
if (myToolsPanel instanceof Window) {
    myToolsPanel.center();
    myToolsPanel.show();
    runTimeSheet();
}
