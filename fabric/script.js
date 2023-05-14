function loadImage(imgUrl, index) {
  fabricCanvas[index] = new fabric.Canvas(`fabric-${index}`, {
    backgroundColor: "transparent",
    selection: false,
    // isDrawingMode: true,
  });

  fabric.Image.fromURL(imgUrl, function (img) {
    let aspectRatio = img.width / img.height;
    let fabricContainer = document.getElementById(`fabric-${index}-Container`);
    fabricCanvas[index].setWidth(fabricContainer.clientWidth);
    fabricCanvas[index].setHeight(fabricContainer.clientWidth / aspectRatio);
    img.scaleToWidth(fabricContainer.clientWidth);
    fabricCanvas[index].setBackgroundImage(
      img,
      fabricCanvas[index].renderAll.bind(fabricCanvas[index]),
      {
        scaleX: fabricCanvas[index].width / img.width,
        scaleY: fabricCanvas[index].height / img.height,
      }
    );
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
            loadImage(canvas.toDataURL("image/png"), pageNumber);
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
let fabricCanvas = [];
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
    document.getElementById(
      "annotation"
    ).innerHTML = `<div class="fcontainer" id="fabric-${1}-Container"> <canvas id="fabric-${1}"></canvas></div> `;

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
       </div> `;
  }
  annotation.innerHTML = child;
}

function fetchPdf(pdfUrl, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", pdfUrl);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(new Uint8Array(xhr.response));
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.send();
}
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
function download() {
  if (isPdf) {
    const doc = new jsPDF();
    fabricCanvas.forEach((fabricCanvas) => {
      doc.addImage(
        fabricCanvas.toDataURL(),
        "PNG",
        0,
        0,
        doc.internal.pageSize.width,
        doc.internal.pageSize.height
      );
      doc.addPage();
    });
    doc.save("document.pdf");
  } else {
    const imageURL = fabricCanvas[1].toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = imageURL;
    link.click();
  }
}
