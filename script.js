function loadFile(inputData) {
  let fileUrl = inputData.fileUrl;
  if (inputData.type == "image") {
    let img = new Image();
    img.src = fileUrl;
    document.getElementById("image").setAttribute("src", fileUrl);
    let canvasContainer = document.getElementById("canvasContainer");
    img.onload = function () {
      let imgWidth = img.width;
      let imgHeight = img.height;
      let aspectRatio = imgWidth / imgHeight;

      let canvas = document.getElementById("canvas");
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientWidth / aspectRatio;

      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let fabricCanvas = new fabric.Canvas("fabric", {
        backgroundColor: "transparent",
        selection: false,
      });

      fabricCanvas.setWidth(canvas.width);
      fabricCanvas.setHeight(canvas.height);

      fabric.Image.fromURL(fileUrl, function (img) {
        img.scaleToWidth(canvas.width);
        fabricCanvas.setBackgroundImage(
          img,
          fabricCanvas.renderAll.bind(fabricCanvas),
          {
            scaleX: fabricCanvas.width / img.width,
            scaleY: fabricCanvas.height / img.height,
          }
        );
      });
    };
  } else {
  }
}
loadFile({
  fileUrl: "./samples/sample_page-0002.jpg",
  type: "image",
});
