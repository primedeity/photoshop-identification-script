// Identification Effect Script by Jephthah & ChatGPT

// === Check for open document ===
if (app.documents.length === 0) {
    alert("Please open an image first.");
    return;
}

// === Get customization inputs ===
var userColor = prompt("Enter outline/glow color (e.g., red, #00FF00):", "#FF0000");
var userSize = parseInt(prompt("Enter outline/glow size in pixels (e.g., 5):", "5"));
var addWatermark = confirm("Do you want to add watermark text?");
var watermarkText = addWatermark ? prompt("Enter watermark text:", "Sample Watermark") : "";
var watermarkOpacity = addWatermark ? parseInt(prompt("Watermark opacity (0–100):", "30")) : 0;

// === Reference current doc and duplicate layer ===
var doc = app.activeDocument;
var originalLayer = doc.activeLayer;
var workingLayer = originalLayer.duplicate();
workingLayer.name = "Identification Effect";
workingLayer.convertToSmartObject();

// === Apply glow effect using Layer Styles ===
var desc = new ActionDescriptor();
var ref = new ActionReference();
ref.putClass(charIDToTypeID("Lefx"));
desc.putReference(charIDToTypeID("null"), ref);

var glowDesc = new ActionDescriptor();
var glowInnerDesc = new ActionDescriptor();

glowInnerDesc.putBoolean(charIDToTypeID("enab"), true);
glowInnerDesc.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("BlnM"), charIDToTypeID("Scrn"));
glowInnerDesc.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), 75);
glowInnerDesc.putObject(charIDToTypeID("Clr "), charIDToTypeID("RGBC"), hexToRGB(userColor));
glowInnerDesc.putUnitDouble(charIDToTypeID("Ckmt"), charIDToTypeID("#Pxl"), 0);
glowInnerDesc.putUnitDouble(charIDToTypeID("blur"), charIDToTypeID("#Pxl"), userSize);

glowDesc.putObject(charIDToTypeID("OrGl"), charIDToTypeID("OrGl"), glowInnerDesc);
desc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lefx"), glowDesc);
executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);

// === Optional watermark ===
if (addWatermark) {
    var textLayer = doc.artLayers.add();
    textLayer.kind = LayerKind.TEXT;
    textLayer.name = "Watermark";
    textLayer.textItem.contents = watermarkText;
    textLayer.textItem.position = [doc.width - 300, doc.height - 100];
    textLayer.textItem.size = 36;
    textLayer.opacity = watermarkOpacity;
}

// === Prompt for save format ===
var formatChoice = prompt("Save format? Type JPG, PNG, or PSD:", "JPG");

if (formatChoice) {
    formatChoice = formatChoice.toUpperCase();
    try {
        var originalPath = app.activeDocument.fullName.path;
        var saveFolder = new Folder(originalPath + "/Identified_Images");

        if (!saveFolder.exists) {
            saveFolder.create();
        }

        var docName = app.activeDocument.name.replace(/\.[^\.]+$/, '');
        var saveFile;

        if (formatChoice === "JPG") {
            saveFile = new File(saveFolder + "/" + docName + "_identified.jpg");
            var jpgOptions = new JPEGSaveOptions();
            jpgOptions.quality = 10;
            app.activeDocument.saveAs(saveFile, jpgOptions, true);
        } else if (formatChoice === "PNG") {
            saveFile = new File(saveFolder + "/" + docName + "_identified.png");
            var pngOptions = new PNGSaveOptions();
            app.activeDocument.saveAs(saveFile, pngOptions, true);
        } else if (formatChoice === "PSD") {
            saveFile = new File(saveFolder + "/" + docName + "_identified.psd");
            var psdOptions = new PhotoshopSaveOptions();
            app.activeDocument.saveAs(saveFile, psdOptions, true);
        } else {
            alert("Invalid format selected. Image not saved.");
        }

        if (saveFile) {
            alert("Image saved successfully in:\n" + saveFile.fsName);
        }
    } catch (e) {
        alert("Error saving file: " + e.message);
    }
}

// === Hex to RGB helper ===
function hexToRGB(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
    }
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    var colorDesc = new ActionDescriptor();
    colorDesc.putDouble(charIDToTypeID("Rd  "), r);
    colorDesc.putDouble(charIDToTypeID("Grn "), g);
    colorDesc.putDouble(charIDToTypeID("Bl  "), b);
    return colorDesc;
}
