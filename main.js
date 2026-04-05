// One-Time Token Verification
const VALID_TOKEN = "INCOGNITO";

// THE OLD SNARKY MESSAGES ARRAY
const rejectionMessages = [
    "Nice try. That token is as fake as your chances—come back with a real one or disappear.",
    "Nice try. That token expired before your confidence did. Try again… or don’t.",
    "Invalid token detected. Just like your effort—almost there, but still useless.",
    "That token isn’t valid… but your audacity is impressive. Unfortunately, both are not accepted here.",
    "Ladle Access denied. Even the system is tired of your guesses. Meow Ghop Ghop Ghop",
    "Wrong token. Right attitude… just aimed at the wrong place....Moye Moye"
];

// Tracks which tool the user clicked on from the Bento grid
let activeToolId = ''; 

// YOUR REQUESTED DYNAMIC LOADER MESSAGES
const loaderMessages = [
    "Authenticating secure payload...",
    "Fatching Avilable Public Data...",
    "Hold My Beer...",
    "Privacy Is A Myth Buddy",
    "Don't look at this too much...",
    "It's take a Few Minutes...."
];

const warningIconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

// --- 1. MODAL & AUTH LOGIC ---
function verifyAndEnter() {
    const inputToken = document.getElementById('modalToken').value.trim();
    const errorDiv = document.getElementById('modalError');
    
    if (inputToken === VALID_TOKEN) {
        // Success! Hide modal.
        document.getElementById('warningModal').style.opacity = '0';
        setTimeout(() => { document.getElementById('warningModal').style.display = 'none'; }, 400);
    } else {
        // Fail. Pick an old random message and show it inside the modal.
        const randomMsg = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
        
        errorDiv.style.display = 'block';
        errorDiv.innerText = randomMsg;
        
        // Shake animation for rejection
        const modalContent = document.querySelector('.modal-content');
        modalContent.style.transform = 'translateX(-10px)';
        setTimeout(() => modalContent.style.transform = 'translateX(10px)', 50);
        setTimeout(() => modalContent.style.transform = 'translateX(0)', 100);
    }
}

// --- 2. SINGLE PAGE APP LOGIC (WITH ANDROID BACK BUTTON SUPPORT) ---
function openTool(toolId, title, placeholderText) {
    activeToolId = toolId; 
    
    document.getElementById('activeToolTitle').innerText = title;
    document.getElementById('targetInput').placeholder = placeholderText;
    document.getElementById('targetInput').value = ''; 
    document.getElementById('results').innerHTML = ''; 
    document.getElementById('results').style.display = 'none';

    document.getElementById('bentoView').style.display = 'none';
    document.getElementById('toolView').style.display = 'flex';

    // Push state to history for Android physical back button
    history.pushState({ view: 'tool' }, '', '#tool');
}

// Triggers when the on-screen UI back button is pressed
function closeTool() {
    if (history.state && history.state.view === 'tool') {
        history.back(); // Triggers the window popstate event
    } else {
        executeCloseTool();
    }
}

// Executes the visual UI change
function executeCloseTool() {
    activeToolId = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('results').style.display = 'none';
    document.getElementById('toolView').style.display = 'none';
    document.getElementById('bentoView').style.display = 'grid'; 
}

// Listens for the Android physical back button
window.addEventListener('popstate', (e) => {
    if (!e.state || e.state.view !== 'tool') {
        executeCloseTool();
    }
});

// --- 3. EXTRACTION ENGINE ---
async function performLookup() {
    const inputValue = document.getElementById('targetInput').value.trim();
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    const loaderText = document.querySelector('.loader-text');

    function showError(message) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div class="glass-error compact-error appear-anim">
                <div class="error-icon">${warningIconSVG}</div>
                <div class="error-text">${message}</div>
            </div>`;
    }

    if (!inputValue) { 
        showError("Input Required. Please enter valid target data.");
        return; 
    }

    // OLD Master Self-Protection Block
    const blocked = ["8252584063", "8298709184"];
    if (blocked.some(num => inputValue.includes(num))) {
        showError("You really typed this number...and expected success ? Intresting..");
        return;
    }

    resultsDiv.style.display = 'none';
    loader.style.display = 'block';
    searchBtn.disabled = true;

    let msgIndex = 0;
    loaderText.innerText = loaderMessages[msgIndex];
    const loaderInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loaderMessages.length;
        loaderText.innerText = loaderMessages[msgIndex];
    }, 2000);

    try {
        const data = await fetchTargetData(activeToolId, inputValue); 
        displayResults(data); 
    } catch (error) {
        showError(`System Protocol Error: ${error.message}`);
    } finally {
        loader.style.display = 'none';
        searchBtn.disabled = false;
        clearInterval(loaderInterval); 
    }
}
