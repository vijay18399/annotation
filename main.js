let source, mode;
function init() {
  let params = new URLSearchParams(window.location.search);
  source = params.get("source");
  mode = params.get("mode");

  if (source) {
    // Make an AJAX request to fetch the PDF file
    let xhr = new XMLHttpRequest();
    xhr.open("GET", source, true);
    xhr.responseType = "blob";

    xhr.onload = function () {
      if (xhr.status === 200) {
        let blob = xhr.response;

        // Create a new FileReader to read the blob data
        let reader = new FileReader();
        reader.onloadend = function () {
          // Get the base64-encoded data URL
          let dataUrl = reader.result;

          // Pass the data URL to the function that handles the PDF or the Image
          if (mode == "img") {
            document.getElementById("annotation").innerHTML = `
            <div class="fcontainer" id="fabric-${1}-Container"> 
                 <canvas id="fabric-${1}"></canvas>
                 <img  class="image" src="" id="img-${1}">
            </div> `;
          }
          mode == "pdf" ? handlePdf(dataUrl) : handleImage(dataUrl, 1);
        };
        reader.readAsDataURL(blob);
      } else {
        console.error("Failed to fetch the PDF file.");
      }
    };

    xhr.send();
  } else {
    console.error("No PDF source provided.");
  }
}

function handlePdf(pdfUrl) {
  var PDFJS = window["pdfjs-dist/build/pdf"];
  PDFJS.GlobalWorkerOptions.workerSrc = "./pdf.worker.js";
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
            handleImage(imageUrl, pageNumber);
            if (pageNumber < totalPages) {
              getPage(pageNumber + 1);
            } else {
              //   setTool("selector");
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
function handleImage(imgUrl, index) {
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
  if (mode == "pdf") {
    const doc = new jsPDF();
    let pageCount = 0;
    for (let i = 1; i < fabricCanvas.length; i++) {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = images[i - 1];

      generateCanvasImage(canvas, img, fabricCanvas[i], function (imageURL) {
        doc.addImage(
          imageURL,
          "JPEG",
          0,
          0,
          doc.internal.pageSize.width,
          doc.internal.pageSize.height
        );
        pageCount++;

        if (pageCount == fabricCanvas.length - 1) {
          doc.save("document.pdf");
        } else {
          doc.addPage();
        }
      });
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
function generateCanvasImage(canvas, img, fabricCanvas, callback) {
  const context = canvas.getContext("2d");
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageURL = canvas.toDataURL("image/jpeg", 0.8);

    generateFabricCanvasImage(canvas, fabricCanvas, function () {
      callback(imageURL);
    });
  };
}

function generateFabricCanvasImage(canvas, fabricCanvas, callback) {
  const context = canvas.getContext("2d");
  fabricCanvas.renderAll();
  const imageData = fabricCanvas.toDataURL({
    format: "png",
    multiplier: 1,
    left: 0,
    top: 0,
    width: fabricCanvas.width,
    height: fabricCanvas.height,
  });

  const img = new Image();
  img.src = imageData;

  img.onload = function () {
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    callback();
  };
}
var images = [];
var fabricCanvas = [];
init();
