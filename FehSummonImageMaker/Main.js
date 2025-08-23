
function putResizedImageForCanvas(
    canvasContext, imgId, putX, putY, sizeX, sizeY
) {
    const img = document.getElementById(imgId);
    canvasContext.drawImage(img,
        0, 0, img.width, img.height,
        putX, putY, sizeX, sizeY);
}
function drawTextOnCanvasByRatio(
    canvas, text, textPosXRatio, textPosYRatio, fontSize, fontFamily, lineHeight = 1.1) {
    const ctx = resultCanvas.getContext("2d");
    ctx.font = `normal ${fontSize}px ${fontFamily}`;
    const textPosX = canvas.width * textPosXRatio;
    const textPosY = canvas.height * textPosYRatio;
    drawTextOnCanvas(ctx, text, textPosX, textPosY, fontSize, lineHeight);
}
function drawTextOnCanvas(ctx, text, textPosX, textPosY, fontSize, lineHeight = 1.1) {
    for (let lines = text.split("\n"), i = 0; i < lines.length; ++i) {
        let line = lines[i];
        let posY = textPosY + fontSize * lineHeight * i;
        ctx.strokeText(
            line,
            textPosX, posY);
        ctx.fillText(
            line,
            textPosX, posY);
    }
}