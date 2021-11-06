import re
import os, sys
import json

def divide_chars(chars):
    array = []
    for i, chara in enumerate(chars):
        if i > 1 and len(chara) > 2:
            array.append(chara[:2])
            array.append(chara[2:])
        else:
            array.append(chara)
    return array

def convert(s):
    if len(s) == 2:
        try:
            ret = int(s, 16)
        except ValueError:
            if s == '\\t':
                return int('0x09', 16)
            elif s == '\\n':
                return int('0x0a', 16)
            elif s == '\\r':
                return int('0x0d', 16)
            else:
                return ord(s)
        else:
            return ret
    else:
        return ord(s)
        
def get_settings_dict(array):
    d = {}
    idx_dict = {
        "n_frames":16, 
        "n_layers": 20, 
        "fps": 22,
        "scene": 26,
        "cut": 34,
        "sheet_view": 48,
        "frames_per_page": 52,
        "guideline": 50
    }
    for k, v in idx_dict.items():
        d[k] = convert(array[v])
    
    # sheet_view_dict = {
    #     1: "num_frames",
    #     2: "feet",
    #     4: "page, frame number",
    #     8: "sec+koma"
    # }
    
    return d

def get_framedata(lines, n_layers, n_frames, isKeyanimation):

    num2alpha = lambda c: chr(c+64)

    if isKeyanimation:
        start = 1
    else:
        start = 1 + n_layers

    frame_dict = {}
    for layer in range(n_layers):
        layerline = lines[start+layer]
        layerline = layerline.replace('\\x00', '_')
        layerline = layerline.replace('\\x01', '#')
        keyframes = []
        for i in range(n_frames):
            frame_str = layerline[i*10:i*10+10]
            keyframe = re.findall(r'_#(.*?)_', frame_str)
            if len(keyframe):
                keyframes.append(int(keyframe[0]))
            else:
                keyframes.append(0)
        frame_dict[num2alpha(layer+1)] = keyframes    
    return frame_dict

def sxf2json(filepath, savepath):
    with open(filepath, "rb") as f:
        buffer = f.read()
        strr = repr(buffer)[2:-1]

    str_lines = re.split(r'\\x01[A-Z]\\x00\\x00\\x00\\x0[0-1]\\x00\\x00\\x00\\n', strr)

    settings_chars = str_lines[0].split("\\x")
    settings_divided = divide_chars(settings_chars)
    settings = get_settings_dict(settings_divided)   

    n_layers = settings["n_layers"] 
    n_frames = settings["n_frames"] 

    keyanimation = get_framedata(str_lines, n_layers, n_frames, isKeyanimation=True)
    inbetween = get_framedata(str_lines, n_layers, n_frames, isKeyanimation=False)

    savedata = {
        "settings": settings, 
        "keyanimation": keyanimation,
        "inbetween": inbetween
        }

    with open(savepath, "w") as f:
        json.dump(savedata, f, indent=4)
        
if __name__ == '__main__':

    if len(sys.argv) != 2:
        print("Usage: python3 sxf2json.py <timesheet.sxf>")
        exit(0)

    filepath = sys.argv[1]
    if os.path.isfile(filepath) and os.path.splitext(filepath)[-1] == ".sxf":
        savepath = os.path.splitext(filepath)[0]+".json"
        sxf2json(filepath, savepath)
        print("Saved to", savepath)
    elif os.path.isdir(filepath):
        from glob import glob
        from tqdm import tqdm
        inputpaths = sorted(glob(os.path.join(filepath, "**", "*.sxf")))
        print(inputpaths)
        for inputpath in tqdm(inputpaths):
            savepath = os.path.splitext(inputpath)[0]+".json"
            sxf2json(inputpath, savepath)
    else:
        print('No such file or directory:', filepath)



    