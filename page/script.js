// -----------------------------------------------------------------
// 1. Typewriter Effect
// -----------------------------------------------------------------
const typewriterText = document.getElementById('typewriter-text');
const fullText = 'Merry Christmas & Happy New Year';
let i = 0;

function typeWriter() {
    if (i < fullText.length) {
        typewriterText.innerHTML += fullText.charAt(i);
        i++;
        setTimeout(typeWriter, 100); // Typing speed
    } else {
        // Start blinking cursor animation after typing is done
        const cursor = document.querySelector('.cursor');
        cursor.style.animation = 'blink 0.75s step-end infinite';
        cursor.style.opacity = 1;
    }
}

// Start the typing when the page loads
window.addEventListener('load', () => {
    typeWriter();
    // Add CSS keyframe for blinking in JS so it only runs after typing
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = "@keyframes blink { from, to { opacity: 0; } 50% { opacity: 1; } }";
    document.head.appendChild(styleSheet);
    
    // *** FIX C: CALL THE INITIALIZATION FUNCTION ***
    initializeCloudBase(); 
});

// -----------------------------------------------------------------
// 2. Mouse Trail Effect
// -----------------------------------------------------------------
const mouseTrail = document.getElementById('mouse-trail');

document.addEventListener('mousemove', (e) => {
    // OLD: mouseTrail.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // NEW: Add +25px to X and Y to push text away from the tree cursor
    mouseTrail.style.transform = `translate(${e.clientX + 25}px, ${e.clientY + 25}px)`;
});
// -----------------------------------------------------------------
// 3. Background Digit Snowing Effect (Dynamic Particle Spawner)
// -----------------------------------------------------------------
const gameScreen = document.getElementById('game-screen');
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function createSnowDigit() {
    const digit = document.createElement('div');
    digit.classList.add('snow-digit');
    digit.textContent = digits[Math.floor(Math.random() * digits.length)];
    
    // Random horizontal starting position
    digit.style.left = `${Math.random() * 100}vw`;
    
    // Random animation duration for varied speed
    digit.style.animationDuration = `${Math.random() * 10 + 5}s`;
    
    // Slight random delay
    digit.style.animationDelay = `${Math.random() * 5}s`;

    gameScreen.appendChild(digit);

    // Clean up old elements to prevent memory leak
    setTimeout(() => {
        digit.remove();
    }, parseFloat(digit.style.animationDuration) * 1000);
}

// Continuously spawn snow digits
setInterval(createSnowDigit, 300); // Adjust interval for density

// -----------------------------------------------------------------
// 4. Interactive Piling & Transformation Logic (Foundation)
// -----------------------------------------------------------------
// -----------------------------------------------------------------
// 4. LOGIC: Pump-Action Scroll & Click Breakdown
// -----------------------------------------------------------------
const pilingArea = document.getElementById('piling-area');
const cloudSize = 20; 
const verticalSpacing = 18; 
const maxBaseClouds = 10; 
const maxPilingLayer = 10; 

// --- GAME STATE VARIABLES ---
let currentPilingLayer = 1; 
let isTreeComplete = false;
let isLogoMode = false;
let isDisassembling = false; // Mode where clicking removes layers

// --- SCROLL GESTURE VARIABLES ---
// To add a layer, user must scroll down past 'downThreshold' 
// AND THEN scroll back up past 'upThreshold'
let hasScrolledDown = false;
const downThreshold = 100; // Pixel value to scroll down
const upThreshold = 20;    // Pixel value to return to (near top)

// Store cloud pieces
const allCloudPieces = {}; 

// --- Layer Functions ---

function addSnowLayer(layerIndex) {
    if (layerIndex <= 0 || layerIndex > maxPilingLayer || allCloudPieces[layerIndex]) return;

    const cloudsInLayer = Math.max(1, maxBaseClouds - (layerIndex - 1));
    const bottomPos = (layerIndex - 1) * verticalSpacing; 
    
    const screenCenter = pilingArea.clientWidth / 2;
    const layerWidth = cloudsInLayer * cloudSize;
    const startX = screenCenter - (layerWidth / 2); 

    const layerPieces = [];

    for (let i = 0; i < cloudsInLayer; i++) {
        const piece = document.createElement('div');
        piece.classList.add('snow-piece', 'cloud-original'); 
        piece.dataset.layer = layerIndex;
        
        const leftPos = startX + (i * cloudSize);
        
        piece.style.bottom = `${bottomPos}px`;
        piece.style.left = `${leftPos}px`;
        
        pilingArea.appendChild(piece);
        layerPieces.push(piece);

        // Simple pop-in animation
        setTimeout(() => { piece.style.opacity = 1; }, 10 + Math.random() * 100);
    }
    allCloudPieces[layerIndex] = layerPieces;
    currentPilingLayer = layerIndex;
    
    console.log(`Added Layer ${layerIndex}`);
}

function removeSnowLayer(layerIndex) {
    const piecesToRemove = allCloudPieces[layerIndex];
    if (piecesToRemove) {
        piecesToRemove.forEach(piece => {
            // Drop effect
            piece.style.transition = 'opacity 0.3s ease-in, transform 0.3s ease-in';
            piece.style.opacity = 0;
            piece.style.transform = 'translateY(50px) rotate(20deg)'; 
            
            setTimeout(() => { piece.remove(); }, 300);
        });
        delete allCloudPieces[layerIndex];
        currentPilingLayer = layerIndex - 1;
        console.log(`Removed Layer ${layerIndex}`);
    }
}

function initializeCloudBase() {
    addSnowLayer(1);
}
// --- Transformation Functions (UNCHANGED) ---

function switchToLogoMode() {
    const pieces = document.querySelectorAll('.snow-piece');
    
    pieces.forEach(piece => {
        piece.classList.add('logo-shape');
        piece.classList.remove('cloud-original');
        piece.style.transform = 'scale(0.7) rotate(15deg)'; 
        piece.style.backgroundColor = 'transparent'; 
    });

    isLogoMode = true;
    console.log("Transformation: 'n' Logo Mode Active. Click to revert.");
}

function switchToTreeMode() {
    const pieces = document.querySelectorAll('.snow-piece');
    
    pieces.forEach(piece => {
        piece.classList.remove('logo-shape');
        piece.classList.add('cloud-original');
        piece.style.backgroundColor = 'transparent'; 
        piece.style.transform = 'none';
    });
    
    isLogoMode = false;
    console.log("Transformation: Reverted to Tree Mode Active.");
}

function revertToCloudVisuals() {
    const pieces = document.querySelectorAll('.snow-piece');
    pieces.forEach(piece => {
        piece.classList.remove('logo-shape');
        piece.classList.add('cloud-original');
        piece.style.transform = 'none';
    });
    isLogoMode = false;
    console.log("Reverted to Clouds.");
}

// -----------------------------------------------------------------
// 5. EVENT LISTENERS
// -----------------------------------------------------------------

// --- SCROLL: Controls BUILDING (Pump Action) ---
document.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // We only build if the tree is NOT complete and NOT currently being broken down
    if (!isTreeComplete && !isDisassembling) {
        
        // Step 1: Detect Scroll Down (Cocking the trigger)
        if (currentScrollY > downThreshold) {
            if (!hasScrolledDown) {
                console.log("Ready to build! Scroll Up now.");
                hasScrolledDown = true;
            }
        }

        // Step 2: Detect Scroll Up (Firing the trigger)
        if (currentScrollY < upThreshold && hasScrolledDown) {
            // Trigger the action: Add ONE layer
            if (currentPilingLayer < maxPilingLayer) {
                addSnowLayer(currentPilingLayer + 1);
                
                // Reset the trigger
                hasScrolledDown = false; 

                // Check completion
                if (currentPilingLayer === maxPilingLayer) {
                    isTreeComplete = true;
                    console.log("Tree Complete! Click to interact.");
                }
            }
        }
    }
});

// --- CLICK: Controls TRANSFORMATION & DISASSEMBLY ---
document.addEventListener('click', () => {
    
    // Only interact if the tree was fully built
    if (isTreeComplete) {
        
        // STATE 1: Logo Transformation
        if (!isLogoMode && !isDisassembling) {
            switchToLogoMode();
            return; // Stop here for this click
        }

        // STATE 2: Start Disassembly (Revert visuals & Remove top layer)
        if (isLogoMode && !isDisassembling) {
            revertToCloudVisuals();
            isDisassembling = true; // Enter disassembly mode
            
            // Remove the top layer immediately
            removeSnowLayer(currentPilingLayer);
            return;
        }

        // STATE 3: Continue Disassembly (Remove next layer)
        if (isDisassembling) {
            if (currentPilingLayer > 1) {
                removeSnowLayer(currentPilingLayer);
            }
            
            // RESET: If we reach the bottom (Layer 1)
            if (currentPilingLayer === 1) {
                console.log("Back to base. Scroll Down+Up to rebuild!");
                isTreeComplete = false;
                isLogoMode = false;
                isDisassembling = false;
                hasScrolledDown = false; // Reset scroll trigger
            }
        }
    } else {
        console.log(`Scroll Down & Up to add layers! (Layer ${currentPilingLayer}/${maxPilingLayer})`);
    }
});





