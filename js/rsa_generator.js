// RSA Key Generation and Storage
const forge = window.forge || require('node-forge'); 

const generatorDiv = document.querySelector(".generator");
const generateBtn = generatorDiv.querySelector(".generator-form button");
const qrInput = generatorDiv.querySelector(".generator-form input");
const qrImg = generatorDiv.querySelector(".generator-img img");
const downloadBtn = generatorDiv.querySelector(".generator-btn .btn-link");

let imgURL = '';

// Generate RSA Keys and Store them in localStorage
const generateRSAKeys = () => {
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

    // Store keys in localStorage
    localStorage.setItem('publicKey', publicKey);
    localStorage.setItem('privateKey', privateKey);

    return { publicKey, privateKey };
};

// Check if keys exist in localStorage, if not, generate and store them
if (!localStorage.getItem('publicKey') || !localStorage.getItem('privateKey')) {
    const { publicKey, privateKey } = generateRSAKeys();
    console.log("Public and Private Keys generated and stored.");
} else {
    console.log("Keys found in localStorage.");
}

// Encrypt input with RSA
function encryptWithRSA(text) {
    const publicKey = localStorage.getItem('publicKey');
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encrypted = publicKeyObj.encrypt(text, 'RSA-OAEP');
    return forge.util.encode64(encrypted); // URL-safe base64 encoding
}

generateBtn.addEventListener("click", () => {
    let qrValue = qrInput.value.trim();
    if (!qrValue) // If input is empty, stop
        return;

    generateBtn.innerText = "Encrypting and Generating QR Code...";

    // Encrypting input text with RSA
    const encryptedText = encryptWithRSA(qrValue);

    // Generate QR code with the encrypted text
    imgURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(encryptedText)}`;
    qrImg.src = imgURL;

    qrImg.addEventListener("load", () => {
        generatorDiv.classList.add("active");
        generateBtn.innerText = "Generate QR Code";
    });
});

// Download QR Code
downloadBtn.addEventListener("click", () => {
    if (!imgURL) return;
    fetchImage(imgURL);
});

function fetchImage(url) {
    fetch(url).then(res => res.blob()).then(file => {
        let tempFile = URL.createObjectURL(file);
        let file_name = url.split("/").pop().split(".")[0];
        let extension = file.type.split("/")[1];
        download(tempFile, file_name, extension);
    })
    .catch(() => imgURL = '');
}

function download(tempFile, file_name, extension) {
    let a = document.createElement('a');
    a.href = tempFile;
    a.download = `${file_name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Reset active state if input is cleared
qrInput.addEventListener("input", () => {
    if (!qrInput.value.trim())
        generatorDiv.classList.remove("active");
});
