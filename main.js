// ==========================================
// 🛠️ CUSTOMIZATION ZONE 
// ==========================================

// 1. Authorization Token
const VALID_TOKEN = "INCOGNITO";

// 2. Number Protection (Blocked Numbers & Warning Message)
const BLOCKED_NUMBERS = ["8252584063", "8298709184" , "7050644110" ,];

// 👇 CHANGE THIS TO YOUR CUSTOM WARNING MESSAGE! 👇
const NUMBER_PROTECTION_MESSAGE = "You really typed This number...and expected success? Interesting."; 

// 3. Dynamic Loader Messages
const loaderMessages = [
    "Authenticating secure payload...",
    "Fatching Avilable Public Data...",
    "Privacy Is A Myth Buddy...",
    "Hold My Beer...",
    "It's take a Few Minutes....",
    "Don't look at this too much...",
    "Privacy is a myth..."
];

// 4. Invalid Token Rejection Messages
const rejectionMessages = [
    "Nice try. That token is as fake as your chances—come back with a real one or disappear.",
    "Nice try. That token expired before your confidence did. Try again… or don’t.",
    "Invalid token detected. Just like your effort—almost there, but still useless.",
    "That token isn’t valid… but your audacity is impressive. Unfortunately, both are not accepted here.",
    "Ladle Access denied. Even the system is tired of your guesses. Meow Ghop Ghop Ghop",
    "Wrong token. Right attitude… just aimed at the wrong place....Moye Moye"
];

// ==========================================
// 🚀 SYSTEM LOGIC (DO NOT TOUCH BELOW THIS LINE)
// ==========================================

let activeToolId = ''; 

const warningIconSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;

// --- 1. TWO-STEP MODAL LOGIC ---
function showAuthView() {
    document.getElementById('warningView').style.display = 'none';
    document.getElementById('warningModal').classList.add('auth-mode');
    document.getElementById('authView').style.display = 'block';
}

function verifyToken() {
    const inputToken = document.getElementById('modalToken').value.trim();
    const errorDiv = document.getElementById('modalError');
    
    if (inputToken === VALID_TOKEN) {
        document.getElementById('warningModal').style.opacity = '0';
        setTimeout(() => { document.getElementById('warningModal').style.display = 'none'; }, 400);
    } else {
        const randomMsg = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
        errorDiv.style.display = 'block';
        errorDiv.innerText = randomMsg;
        
        const authView = document.getElementById('authView');
        authView.style.transform = 'translateX(-10px)';
        setTimeout(() => authView.style.transform = 'translateX(10px)', 50);
        setTimeout(() => authView.style.transform = 'translateX(0)', 100);
    }
}

// --- 2. SINGLE PAGE APP LOGIC ---
function openTool(toolId, title, placeholderText) {
    activeToolId = toolId; 
    
    document.getElementById('activeToolTitle').innerText = title;
    document.getElementById('targetInput').placeholder = placeholderText;
    document.getElementById('targetInput').value = ''; 
    document.getElementById('results').innerHTML = ''; 
    document.getElementById('results').style.display = 'none';

    document.getElementById('bentoView').style.display = 'none';
    document.getElementById('toolView').style.display = 'flex';

    history.pushState({ view: 'tool' }, '', '#tool');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeTool() {
    if (history.state && history.state.view === 'tool') {
        history.back(); 
    } else {
        executeCloseTool();
    }
}

function executeCloseTool() {
    activeToolId = '';
    document.getElementById('results').innerHTML = '';
    document.getElementById('results').style.display = 'none';
    document.getElementById('toolView').style.display = 'none';
    document.getElementById('bentoView').style.display = 'grid'; 
}

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

    // Protection check using the Customization Zone variables
    if (BLOCKED_NUMBERS.some(num => inputValue.includes(num))) {
        showError(NUMBER_PROTECTION_MESSAGE);
        return;
    }

    resultsDiv.style.display = 'none';
    loader.style.display = 'block';
    searchBtn.disabled = true;
    document.getElementById('targetInput').blur(); // Close keyboard automatically while loading

    let msgIndex = 0;
    loaderText.innerText = loaderMessages[msgIndex];
    const loaderInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loaderMessages.length;
        loaderText.innerText = loaderMessages[msgIndex];
    }, 2000);

    try {
        const data = await fetchTargetData(activeToolId, inputValue); 
        displayResults(data); 
        
        setTimeout(() => {
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } catch (error) {
        showError(`System Protocol Error: ${error.message}`);
    } finally {
        loader.style.display = 'none';
        searchBtn.disabled = false;
        clearInterval(loaderInterval); 
    }
}
