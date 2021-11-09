#include 'json2.js'

//// GUI setting ////
// var win = new Window('palette', 'TimeSheetConverter');

// var group2 = win.add('group', undefined, ''); 
// var label_timesheet = group2.add('statictext', undefined, 'タイムシート');

// var tmp_filepath;
// if (Folder.fs == "Windows") tmp_filepath = "C:\\Documents and Settings\\username\\Desktop\\";
// else tmp_filepath = "~/desktop/";

// var filepath = group2.add("edittext",undefined,tmp_filepath);
// filepath.characters = 15;
// var btnChange = group2.add('button', undefined, '変更');


// // init list ///

// // var myList1 = new Array;
// // var myList2 = new Array;

// // for (var i=1; i<=app.project.items.length; i++) {
// //     if (app.project.item(i) instanceof CompItem) {
// //         myList[myList.length] = app.project.item(i).name;
// //     }
// //     else if (app.project.item(i) instanceof FolderItem) {
// //         myList2[myList2.length] = app.project.item(i).name;
// //     }
// // // }
// // updateList(myList, CompItem);
// // updateList(myList2, FolderItem);

// var group = win.add('group', undefined, 'Group title');  
// var label1 = group.add('statictext', undefined, "ターゲットコンポジション:"); 
// var dropDownList = group.add('dropdownlist', undefined, new Array);
// dropDownList.selection = 0;

// var group_folderlist = win.add('group', undefined, 'Group title');  
// var label2 = group_folderlist.add('statictext', undefined, "ターゲットフォルダ:"); 
// var dropDownList2 = group_folderlist.add('dropdownlist', undefined, new Array);
// dropDownList2.selection = 0;

// updateList(dropDownList, CompItem);
// updateList(dropDownList2, FolderItem);

// var group_buttun = win.add('group', undefined, 'Group title');  
// var btnUpdate = group_buttun.add('button', undefined, 'リストの更新');
// var btnRun = group_buttun.add('button', undefined, '実行');



// btnUpdate.onClick = function runUpdateList(){
//     updateList(dropDownList, CompItem);
//     updateList(dropDownList2, FolderItem);
// }


function openFileDirectory() {
    //var saveLoc = Folder.selectDialog ("Select Save Location").toString();
    var openPath = File.openDialog("タイムシートを選択してください", "json");
    if (Folder.fs == "Windows"){
        //filepath.text = saveLoc + "\\";
    }else{
        //filepath.text = saveLoc + "/";
    }
    return String(openPath);
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

function createNewComposition(tsObject) {
    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    var name = ["C", ("000"+tsObject.settings.scene).slice(-3), ("0000"+tsObject.settings.cut).slice(-4)].join("-");
    var width = 1280;
    var height = 720;
    var pixelAspect = 1;
    var duration = n_frames / fps;
    return app.project.items.addComp(name, width, height, pixelAspect, duration, fps);
}

function runTimeSheet() {

    var filepath = openFileDirectory();

    // app.project.framesCountType = FramesCountType.FC_START_1;
    app.project.frameRate = 24;
    app.project.timeDisplayType = TimeDisplayType.FRAMES;
    var tsObject = loadJsonFile(filepath);

    var n_frames = tsObject.settings.n_frames;
    var n_layers = tsObject.settings.n_layers;
    var fps = tsObject.settings.fps;

    theComp = createNewComposition(tsObject);
    theComp.openInViewer();

    var theFolder = app.project.items.addFolder(theComp.name);
    
    var splitstr = filepath.split("/");
    var pathdir = splitstr.slice(0, -1).join("/");

    const layerNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var itemList = new Array();
    for (var i=0; i<n_layers-1; i++) {
        var A = layerNames[i];
        var path = [pathdir, A, A+"0001.tga"].join("/");
        var file = File(path);
        if (file.exists) {
            var io = new ImportOptions(file);
            if (io.canImportAs(ImportAsType.FOOTAGE)) {
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
                for (var j=0; j<n_frames-1; j++) {
                    var value = tsObject.inbetween[A][j];
                    if (value > 0) {
                        var timeRemapProp = theLayer.property("ADBE Time Remapping");
                        var frameDuration = tgaseq.frameDuration;
                        var sec = j * frameDuration;
                        var valSec = (value - 1) * frameDuration;
                        timeRemapProp.setValueAtTime(sec, valSec);
                        timeRemapProp.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD)
                        keyIndex++;
                    }
                }
            }
        }
    }
}



runTimeSheet();