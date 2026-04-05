const VALID_TOKEN = "ADMIN123";

const rejectionMessages = [
    "Nice try. That token is as fake as your chances—come back with a real one or disappear.",
    "Nice try. That token expired before your confidence did. Try again… or don’t.",
    "Invalid token detected. Just like your effort—almost there, but still useless.",
    "That token isn’t valid… but your audacity is impressive. Unfortunately, both are not accepted here.",
    "Access denied. Even the system is tired of your guesses.",
    "Wrong token. Right attitude… just aimed at the wrong place....Moye Moye"
];

// Array of dynamic loader messages
const loaderMessages = [
    "Authenticating secure payload...",
    "Fetching Available Public Data...",
    "Hold My Beer...",
    "It takes a Few Minutes...",
    "Don't look at this too much...",
    "Privacy is a myth..."
];

// Re-usable SVG Warning icon scaled perfectly for the compact layout
const warningIconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

function acceptWarning() {
    const modal = document.getElementById('warningModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 400);
    }
}

async function performLookup() {
    const phoneInput = document.getElementById('phoneNumber').value.trim();
    const tokenInput = document.getElementById('accessToken').value.trim();
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    const loaderText = document.querySelector('.loader-text'); // Targets the loading text

    // Helper function to render the sleek new compact error
    function showError(message) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="glass-error compact-error appear-anim">
                <div class="error-icon">${warningIconSVG}</div>
                <div class="error-text">${message}</div>
            </div>`;
    }

    // Validation Checks
    if (!phoneInput) { 
        showError("Target MSISDN Required. Please enter a valid number.");
        return; 
    }

    if (!tokenInput) { 
        showError("Access Token Required. Retrieve a token to proceed.");
        return; 
    }

    if (tokenInput !== VALID_TOKEN) {
        const randomMsg = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
        showError(randomMsg);
        return;
    }

    // Protection Block
    const blocked = ["8252584063", "8298709184"];
    if (blocked.some(num => phoneInput.includes(num))) {
        showError("Operation Blocked: Do not attempt to run diagnostics on this number.");
        return;
    }

    // Success - Start Loading
    resultsDiv.style.display = 'none';
    loader.style.display = 'block';
    searchBtn.disabled = true;

    // --- Dynamic Loader Text Logic ---
    let msgIndex = 0;
    loaderText.innerText = loaderMessages[msgIndex]; // Reset to the first message

    // Change the text every 2 seconds (2000 milliseconds)
    const loaderInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loaderMessages.length;
        loaderText.innerText = loaderMessages[msgIndex];
    }, 2000);

    try {
        const data = await fetchTargetData(phoneInput); 
        displayResults(data); 
    } catch (error) {
        showError(`Network Protocol Error: ${error.message}`);
    } finally {
        // Stop loading and kill the text-changing interval
        loader.style.display = 'none';
        searchBtn.disabled = false;
        clearInterval(loaderInterval); 
    }
}
