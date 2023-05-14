function loadFile(inputData) {
  let fileUrl = inputData.fileUrl;
  if (inputData.type == "image") {
    createCanvasList(1);
    loadImage(fileUrl, 0);
  } else {
    pdfToImages("./sample.pdf", function (images) {
      console.log(images); // List of image URLs
      for (let i = 0; i <= images.length; i++) {
        loadImage(images[i], i);
      }
    });
  }
}
let pdfUrl = "";
const params = new URLSearchParams(window.location.search);
const imageUrl = params.get("image") || "./sample2.jpg";
// const pdfUrl = params.get("pdf") || "./sample.pdf";
if (pdfUrl) {
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
