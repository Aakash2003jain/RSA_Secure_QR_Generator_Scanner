const forge = window.forge || require('node-forge'); 

const generatorDiv = document.querySelector(".generator");
const generateBtn = generatorDiv.querySelector(".generator-form button");
const qrInput = generatorDiv.querySelector(".generator-form input");
const qrImg = generatorDiv.querySelector(".generator-img img");
const downloadBtn = generatorDiv.querySelector(".generator-btn .btn-link");

let imgURL = '';

// RSA Key Generation (2048-bit)
const generateRSAKeys = () => {
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
    return { publicKey, privateKey };
};

// Generate AES key
const generateAESKey = () => {
    return forge.random.getBytesSync(32);  // 256-bit AES key
};

// Encrypt input with AES
function encryptWithAES(text, aesKey) {
    const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
    const iv = forge.random.getBytesSync(16);  // AES block size
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(text));
    cipher.finish();
    const encryptedData = cipher.output.getBytes();
    return { encryptedData, iv };
}

// Encrypt AES key with RSA
function encryptAESKeyWithRSA(aesKey, publicKey) {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    return publicKeyObj.encrypt(aesKey, 'RSA-OAEP');
}

generateBtn.addEventListener("click", () => {
    let qrValue = qrInput.value.trim();
    if (!qrValue) // If input is empty, stop
        return;

    generateBtn.innerText = "Encrypting and Generating QR Code...";

    // Generate AES key
    const aesKey = generateAESKey();
    // Encrypt the data with AES
    const { encryptedData, iv } = encryptWithAES(qrValue, aesKey);
    // Encrypt the AES key with RSA
    const { publicKey } = generateRSAKeys();
    const encryptedAESKey = encryptAESKeyWithRSA(aesKey, publicKey);

    // Prepare encrypted data for QR code (encode in base64)
    const encryptedBase64 = forge.util.encode64(encryptedData);
    const ivBase64 = forge.util.encode64(iv);
    const encryptedAESKeyBase64 = forge.util.encode64(encryptedAESKey);

    // Combine the encrypted AES key and encrypted data (to decode later)
    const combinedData = {
        encryptedAESKey: encryptedAESKeyBase64,
        encryptedData: encryptedBase64,
        iv: ivBase64
    };

    // Generate QR code with the combined encrypted data
    imgURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(combinedData))}`;
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
