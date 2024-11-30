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

// Handle QR Code Image Scanning and RSA Decryption
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];  // Get the file selected by the user
    if (!file) return;  // If no file is selected, return early
    fetchRequest(file);  // Call the fetchRequest function with the selected file
});

// Function to handle the QR code scanning and decryption
function fetchRequest(file) {
    let formData = new FormData();
    formData.append("file", file);  // Append the file to FormData

    p.innerText = "Scanning QR Code...";  // Display scanning message

    // Scan the QR code using the external API
    fetch("http://api.qrserver.com/v1/read-qr-code/", {
        method: "POST",
        body: formData  // Send the file in the POST request body
    })
    .then(res => res.json())  // Parse the JSON response
    .then(result => {
        // Handle the QR code result
        let encryptedText = result[0].symbol[0].data;
        console.log("Encrypted Text: ", encryptedText);

        if(!encryptedText) {
            p.innerText = "Couldn't Scan QR Code";  // If no data is found, display an error message
            return;
        }

        // Decrypt the scanned encrypted text using RSA private key
        const decryptedText = decryptWithRSA(encryptedText);

        // Display the decrypted text
        scannerDiv.classList.add("active");
        form.classList.add("active-img");
        img.src = URL.createObjectURL(file);
        textarea.innerText = decryptedText;
    })
    .catch(error => {
        console.error("Error scanning QR code:", error);
    });
}

// Function to decrypt the RSA-encrypted text using the stored private key
function decryptWithRSA(encryptedText) {
    const privateKey = localStorage.getItem('privateKey');
    if (!privateKey) {
        alert('Private key is missing! Please ensure the QR code generator has run first.');
        return;
    }

    // Convert private key PEM to an object
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);

    // Decrypt the encrypted text using the private key
    const decrypted = privateKeyObj.decrypt(forge.util.decode64(encryptedText), 'RSA-OAEP');
    return decrypted;  // Return the decrypted text
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

// Stop scan function (reset the UI)
function stopScan() {
    p.innerText = "Upload QR Code to Scan";
    scannerDiv.classList.remove("active");
    form.classList.remove("active-img");
    textarea.value = '';
}
