const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const conversionType = document.getElementById("conversionType");
const downloadLink = document.getElementById("downloadLink");

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

convertBtn.addEventListener("click", async () => {

  const file = fileInput.files[0];
  if (!file) return alert("Selecione um arquivo.");

  if (file.size > MAX_SIZE) {
    return alert("Arquivo maior que 50MB.");
  }

  const type = conversionType.value;

  if (type === "pngToJpg" || type === "jpgToPng") {
    convertImage(file, type);
  } else if (type === "pdfToDoc") {
    convertPdfToDoc(file);
  } else if (type === "docToPdf") {
    convertDocToPdf(file);
  }
});

function convertImage(file, type) {

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const format = type === "pngToJpg" ? "image/jpeg" : "image/png";
      const dataUrl = canvas.toDataURL(format, 1.0);

      triggerDownload(dataUrl, "convertido");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function convertPdfToDoc(file) {

  const reader = new FileReader();

  reader.onload = async function() {

    const pdf = await pdfjsLib.getDocument({data: reader.result}).promise;
    let textContent = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map(item => item.str).join(" ") + "\n\n";
    }

    const doc = new docx.Document({
      sections: [{
        children: [
          new docx.Paragraph(textContent)
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    triggerDownload(URL.createObjectURL(blob), "convertido.docx");
  };

  reader.readAsArrayBuffer(file);
}

function convertDocToPdf(file) {

  const reader = new FileReader();

  reader.onload = function() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.text("Conversão básica de DOCX para PDF.\nConteúdo simplificado.", 10, 10);

    const blob = pdf.output("blob");
    triggerDownload(URL.createObjectURL(blob), "convertido.pdf");
  };

  reader.readAsArrayBuffer(file);
}

function triggerDownload(url, filename) {

  document.getElementById("conversionAd").style.display = "flex";

  downloadLink.href = url;
  downloadLink.download = filename;
  downloadLink.style.display = "block";
}

function closeAd() {
  document.getElementById("conversionAd").style.display = "none";
  downloadLink.click();
}
