function loadImage(imgUrl, index) {
  let imgElement = document.getElementById(`img-${index}`);
  imgElement.setAttribute("src", imgUrl);
  imgElement.addEventListener("load", () => {
    let fcontainer = document.getElementById(`fabric-${index}-Container`);
    fcontainer.style.width = `${imgElement.width}px`;
    fcontainer.style.height = `${imgElement.height}px`;
    fabricCanvas[index] = new fabric.Canvas(`fabric-${index}`, {
      backgroundColor: "transparent",
      selection: false,
      width: imgElement.width,
      height: imgElement.height,
    });
  });
}
function loadPdf(pdfUrl) {
  var PDFJS = window["pdfjs-dist/build/pdf"];
  PDFJS.GlobalWorkerOptions.workerSrc = "../common/pdf.worker.js";
  var loadingTask = PDFJS.getDocument(pdfUrl);

  loadingTask.promise.then(
    function (pdf) {
      var totalPages = pdf.numPages;
      console.log(totalPages);
      appendFabricCanvas(totalPages);
      function getPage(pageNumber) {
        pdf.getPage(pageNumber).then(function (page) {
          var scale = 1.5;
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement("canvas");
          var context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            let imageUrl = canvas.toDataURL("image/png");
            images.push(imageUrl);
            loadImage(imageUrl, pageNumber);
            if (pageNumber < totalPages) {
              getPage(pageNumber + 1);
            } else {
              setTool("selector");
            }
          });
        });
      }

      getPage(1);
    },
    function (reason) {
      console.error(reason);
    }
  );
}
isPdf = false;
let fabricCanvas = [],
  images = [];
const params = new URLSearchParams(window.location.search);
const imageUrl = params.get("image");
const pdfUrl = params.get("pdf");
if (pdfUrl) {
  isPdf = true;
  loadPdf(pdf);
} else if (imageUrl) {
  document.getElementById(
    "annotation"
  ).innerHTML = `<div class="fcontainer" id="fabric-${1}-Container"> <canvas id="fabric-${1}"></canvas></div> `;
  loadImage(imageUrl, 1);
} else {
  if (false) {
    document.getElementById("annotation").innerHTML = `
    <div class="fcontainer" id="fabric-${1}-Container"> 
          <canvas id="fabric-${1}"></canvas>
          <img  class="image" src="" id="img-${1}">
    </div> `;

    loadImage("../common/sample2.jpg", 1);
  } else {
    isPdf = true;
    loadPdf("../common/sample.pdf");
  }
}
function appendFabricCanvas(length) {
  let annotation = document.getElementById("annotation");
  let child = "";
  for (let k = 1; k <= length; k++) {
    child =
      child +
      `<div class="fcontainer" id="fabric-${k}-Container">
          <canvas id="fabric-${k}"></canvas>
          <img src="" id="img-${k}">
       </div> `;
  }
  annotation.innerHTML = child;
}
var originalWidth;
var originalHeight;
function setTool(tool) {
  fabricCanvas.forEach((fabricCanvas) => {
    // Set tool behavior based on current tool
    fabricCanvas.isDrawingMode = true;
    switch (tool) {
      case "pencil":
        fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 10;
        fabricCanvas.freeDrawingBrush.color = "red";
        break;
      case "eraser":
        fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.width = 10;
        fabricCanvas.freeDrawingBrush.color = fabricCanvas.backgroundColor;
        break;
      case "selector":
      default:
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.pointerEvents = "none";
        break;
    }
  });
}
var currentCanvas;
function download() {
  if (isPdf) {
    const doc = new jsPDF();
    let pageCount = 0;
    for (var i = 1; i <= fabricCanvas.length; i++) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Load original image to get its width and height
      const img = new Image();
      img.src = images[i - 1];
      img.onload = function () {
        // Set canvas dimensions to match input image
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        currentCanvas = fabricCanvas[i];
        // Draw fabric canvas image on top of input image
        // currentCanvas.renderAll();
        const imageData = currentCanvas.toDataURL({
          format: "png",
          multiplier: 1,
          left: 0,
          top: 0,
          width: currentCanvas.width,
          height: currentCanvas.height,
        });
        const img2 = new Image();
        img2.src = imageData;
        img2.onload = function () {
          context.drawImage(img2, 0, 0, canvas.width, canvas.height);
          const imageURL = canvas.toDataURL("image/jpeg", 0.8);
          doc.addImage(
            imageURL,
            "JPEG",
            0,
            0,
            doc.internal.pageSize.width,
            doc.internal.pageSize.height
          );
          pageCount++;

          if (pageCount === fabricCanvas.length) {
            doc.save("document.pdf");
          } else {
            doc.addPage();
          }
        };
      };
    }
  } else {
    let imgElement = document.getElementById(`img-1`);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Load original image to get its width and height
    const img = new Image();
    img.src = imgElement.src;
    img.onload = function () {
      // Set canvas dimensions to match input image
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw fabric canvas image on top of input image
      fabricCanvas[1].renderAll();
      const imageData = fabricCanvas[1].toDataURL({
        format: "png",
        multiplier: 1,
        left: 0,
        top: 0,
        width: fabricCanvas[1].width,
        height: fabricCanvas[1].height,
      });
      const img2 = new Image();
      img2.src = imageData;
      img2.onload = function () {
        context.drawImage(img2, 0, 0, canvas.width, canvas.height);
        const imageURL = canvas.toDataURL("image/jpeg", 0.8);
        const link = document.createElement("a");
        link.download = "image.jpeg";
        link.href = imageURL;
        link.click();
      };
    };
  }
}
