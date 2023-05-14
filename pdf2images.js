var PDFJS = window["pdfjs-dist/build/pdf"];
PDFJS.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";

function pdfToImages(url, callback) {
  var loadingTask = PDFJS.getDocument(url);

  loadingTask.promise.then(
    function (pdf) {
      var totalPages = pdf.numPages;
      var images = [];

      function getPage(pageNumber) {
        pdf.getPage(pageNumber).then(function (page) {
          var scale = 1.5;
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement("canvas");
          var context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = { canvasContext: context, viewport: viewport };
          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            images.push(canvas.toDataURL("image/png"));
            if (images.length < totalPages) {
              getPage(pageNumber + 1);
            } else {
              callback(images);
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

function loadImage(fileUrl, index) {
  let fabricCanvas = new fabric.Canvas("fabric" + index, {
    backgroundColor: "transparent",
    selection: false,
  });

  fabric.Image.fromURL(fileUrl, function (img) {
    let canvasContainer = document.getElementById(`fabric-${index}-Container`);
    let aspectRatio = img.width / img.height;
    fabricCanvas.setWidth(canvasContainer.clientWidth);
    fabricCanvas.setHeight(canvasContainer.clientWidth / aspectRatio);
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
}

function appendFabricCanvas(length) {
  let annotation = document.getElementById("annotation");
  let child = "";
  for (let k = 0; k < length; k++) {
    child =
      child +
      `<div class="fcontainer" id="fabric-${k}-Container">
          <canvas id="fabric-${k}"></canvas>
       </div> `;
  }
  annotation.innerHTML = child;
}
