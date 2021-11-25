#include 'json2.js'

// path setting
if (Folder.fs == "Macintosh") {
    var slash = "/";
} else if (Folder.fs == "Windows") {
    var slash = "\\";
}

function openFileDirectory() {
    var openPath = File.openDialog("タイムシート[.json]を選択してください", "");

    var ext = openPath.name.split('.').slice(-1)[0];
    if (ext == "json") {return openPath;}
    else if (ext == "sxf") {
        var fsName = openPath.fsName;
        if (Folder.fs == "Windows" && File(scriptPath + slash + "sxf2json.exe").exists) {
            var cmd = scriptPath + slash + "sxf2json.exe";
        } else if (Folder.fs == "Macintosh" && File(scriptPath + slash + "sxf2json").exists) {
            var cmd = scriptPath + slash + "sxf2json";
        } else if (File(scriptPath + slash + "sxf2json.py").exists) {
            var cmd = ["python3", scriptPath + slash + "sxf2json.py"].join(" ");
        } else {
            return null;
        }
        var cmd = [cmd, fsName].join(" ");
        var result = system.callSystem(cmd);
        return new File(openPath.fsName.split('.')[0] + ".json");
    }
    else return null;
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

function createNewComposition(tsObject, name) {
    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    var pixelAspect = 1;
    var duration = n_frames / fps;
    return app.project.items.addComp(name, parseInt(width.text, 10), parseInt(height.text, 10), pixelAspect, duration, fps);
}

function getFootagePath(pathdir, layerName) {
    var exts = [".tga", ".TGA", ".png", ".PNG", ".jpg", ".JPG", ".tiff", ".TIFF"];
    for (var i=0; i<5; i++) {
        for (var j=0; j<exts.length; j++) {
            var number = "00001".slice(-i);
            var path = [pathdir, layerName, layerName + number + exts[j]].join(slash);
            var file = File(path);
            if (file.exists) return file
        }
    }
    return null;
}

function runTimeSheet() {

    var file = openFileDirectory();

    if (file == null) {
        alert("ファイルを読み込めませんでした．")
        return;
    } 
    else if (!file.exists) {
        alert(file.fsName + "が存在しません．")
        return;
    }

    filepath = file.fsName;
    var name = file.parent.name;
    var parent = file.parent;

    var tsObject = loadJsonFile(filepath);

    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    app.project.frameRate = fps;
    app.project.timeDisplayType = TimeDisplayType.FRAMES;

    theComp = createNewComposition(tsObject, name);
    theComp.openInViewer();

    var theFolder = app.project.items.addFolder(name);
    
    var pathdir = filepath.split(slash).slice(0, -1).join(slash);

    const layerNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (var idx_layer=0; idx_layer<n_layers-1; idx_layer++) {
        var layerName = layerNames[idx_layer];

        var file = getFootagePath(pathdir, layerName);
        if (file == null) continue;
        
        if (file.exists) {
            var io = new ImportOptions(file);
        }
        else continue;
    
        if (!io.canImportAs(ImportAsType.FOOTAGE)) continue;
        io.importAs = ImportAsType.FOOTAGE;
        io.sequence = true;
        io.forceAlphabetical = true;
        tgaseq = app.project.importFile(io);
        tgaseq.parentFolder = theFolder;
        var theLayer = theComp.layers.add(tgaseq);
        
        theLayer.timeRemapEnabled = true;
        var timeRemapProp = theLayer.property("ADBE Time Remapping")
        timeRemapProp.removeKey(timeRemapProp.numKeys);
        
        theLayer.outPoint = n_frames/fps;
        
        var keyIndex = 1;
        for (var idx_frame=0; idx_frame<n_frames-1; idx_frame++) {
            var value = tsObject.inbetween[layerName][idx_frame];
            if (value > 0) {
                var timeRemapProp = theLayer.property("ADBE Time Remapping");
                var frameDuration = tgaseq.frameDuration;
                var sec = idx_frame * frameDuration;
                var valSec = (value - 1) * frameDuration;
                timeRemapProp.setValueAtTime(sec, valSec);
                timeRemapProp.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD)
                keyIndex++;
            }
        }   
    }
}


// GUI setting
var win = new Window('palette', 'Compose from JSON');
// var win = this;
win.add('statictext', undefined, "コンポジション設定"); 

var scriptFile = new File($.fileName);
var scriptPath = scriptFile.parent.fsName;
var comp_setting = loadJsonFile([scriptPath, "initComp.json"].join(slash));

if (comp_setting == null) {
    var w = 1280;
    var h = 720;
} else {
    var w = comp_setting.Width;
    var h = comp_setting.Height;
}
var group_w = win.add('group', undefined, '');  
group_w.add('statictext', undefined, "Width:"); 
var width = group_w.add('edittext', undefined, w); 

var group_h = win.add('group', undefined, '');  
group_h.add('statictext', undefined, "Height:"); 
var height = group_h.add('edittext', undefined, h); 

var btnRun = win.add('button', undefined, 'タイムシートを選択して実行');

btnRun.onClick = function btnRunTimesheet(){
    runTimeSheet();
}

win.center();
win.show();
