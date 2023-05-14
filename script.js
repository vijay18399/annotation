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

      fabricCanvas.setWidth(canvasContainer.clientWidth);
      fabricCanvas.setHeight(canvasContainer.clientWidth / aspectRatio);

      fabric.Image.fromURL(fileUrl, function (img) {
        img.scaleToWidth(canvasContainer.clientWidth);
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
    pdfToImages("./sample.pdf", function (images) {
      console.log(images); // List of image URLs
    });
  }
}

const params = new URLSearchParams(window.location.search);
const imageUrl = params.get("image") || "./sample2.jpg";
const pdfUrl = params.get("pdf") || "./sample.pdf";
if (!imageUrl) {
  loadFile({
    fileUrl: pdfUrl,
    type: "pdf",
  });
} else {
  loadFile({
    fileUrl: imageUrl,
    type: "image",
  });
}
