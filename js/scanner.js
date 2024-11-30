// Select necessary elements from the DOM
const scannerDiv = document.querySelector(".scanner");
const camera = scannerDiv.querySelector("h1 .fa-camera");
const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");
const form = scannerDiv.querySelector(".scanner-form");
const fileInput = form.querySelector("input");
const p = form.querySelector("p");
const img = form.querySelector("img");
const video = form.querySelector("video");
const content = form.querySelector(".content");
const textarea = scannerDiv.querySelector(".scanner-details textarea");
const copyBtn = scannerDiv.querySelector(".scanner-details .copy");
const closeBtn = scannerDiv.querySelector(".scanner-details .close");

// Add event listener to the form element
form.addEventListener("click", () => fileInput.click());

//scan
// Scan QR Code Image

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];  // Get the file selected by the user
    if (!file) return;  // If no file is selected, return early
    fetchRequest(file);  // Call the fetchRequest function with the selected file
});

function fetchRequest(file) {
    let formData = new FormData();
    formData.append("file", file);  // Append the file to FormData

    p.innerText = "Scanning QR Code...";  // Display scanning message

    fetch("http://api.qrserver.com/v1/read-qr-code/", {
        method: "POST",
        body: formData  // Send the file in the POST request body
    })
    .then(res => res.json())  // Parse the JSON response
    .then(result => {
        // Handle the QR code result
        let text = result[0].symbol[0].data;
        console.log(text);

        if(!text)
            return p.innerText="Could't Scan QR Code";

        scannerDiv.classList.add("active");

        form.classList.add("active-img");

        img.src =URL.createObjectURL(file);

        textarea.innerText=text;
    })
    .catch(error => {
        console.error("Error scanning QR code:", error);
    });
}


// Copy text to clipboard when "Copy" button is clicked
copyBtn.addEventListener("click", () => {
    let text = textarea.textContent;
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log("Text copied to clipboard");
        })
        .catch(err => {
            console.error("Failed to copy text: ", err);
        });
});

// Close and stop scanning when "Close" button is clicked
closeBtn.addEventListener("click", () => stopScan());

// Stop scan function
function stopScan() {
    p.innerText = "Upload QR Code to Scan";
    scannerDiv.classList.remove("active");
    form.classList.remove("active-img");
    textarea.value = '';
}


