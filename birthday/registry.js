// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    runTransaction,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-qp06ZHKGCFwp5o4DktfaMdvp0tp8GZs",
  authDomain: "sc-gift.firebaseapp.com",
  projectId: "sc-gift",
  storageBucket: "sc-gift.firebasestorage.app",
  messagingSenderId: "874994172442",
  appId: "1:874994172442:web:7b562d1e9af08d77b507a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const giftListElement = document.getElementById('gift-list');

// Function to load and render gifts
async function loadGifts() {
    try {
        const querySnapshot = await getDocs(collection(db, "gifts"));
        
        // Clear loading text
        giftListElement.innerHTML = '';

        if (querySnapshot.empty) {
            giftListElement.innerHTML = '<p>No gifts found in the registry.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const gift = doc.data();
            renderGiftCard(doc.id, gift);
        });

    } catch (error) {
        console.error("Error loading gifts: ", error);
        giftListElement.innerHTML = '<p>Error loading registry. Please try again later.</p>';
    }
}

// Function to render a single gift card
function renderGiftCard(id, gift) {
    const card = document.createElement('div');
    card.className = `gift-card ${gift.reserved ? 'reserved' : ''}`;

    const statusBadge = gift.reserved 
        ? `<span class="badge taken">Taken by ${escapeHtml(gift.reservedByName)}</span>` 
        : `<span class="badge available">Available</span>`;

    const actionButton = gift.reserved
        ? `<button class="btn-reserve" disabled>Reserved</button>`
        : `<button class="btn-reserve" onclick="window.reserveGift('${id}')">Reserve This</button>`;

    card.innerHTML = `
        <div class="gift-info">
            <h4>${escapeHtml(gift.name)}</h4>
            ${gift.description ? `<p class="gift-desc">${escapeHtml(gift.description)}</p>` : ''}
            <a href="${gift.url}" target="_blank" class="view-link">View Item &rarr;</a>
        </div>
        <div class="gift-actions">
            ${statusBadge}
            ${actionButton}
        </div>
    `;

    giftListElement.appendChild(card);
}

// Make reserve function available globally so the onclick handler can find it
window.reserveGift = async function(giftId) {
    const name = prompt("Please enter your name to reserve this gift:");
    
    if (!name || name.trim() === "") {
        return; // User cancelled or entered empty name
    }

    const giftRef = doc(db, "gifts", giftId);

    try {
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(giftRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }

            const data = sfDoc.data();
            if (data.reserved) {
                throw "Sorry! This gift was just reserved by someone else.";
            }

            transaction.update(giftRef, {
                reserved: true,
                reservedByName: name.trim(),
                reservedAt: serverTimestamp()
            });
        });

        alert(`Success! You have reserved the ${name}.`);
        loadGifts(); // Reload to show updated status

    } catch (e) {
        console.error("Transaction failure: ", e);
        alert(e === "Sorry! This gift was just reserved by someone else." ? e : "Failed to reserve gift. Please try again.");
        loadGifts(); // Reload to ensure UI is in sync
    }
};

// Helper to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Initial load
loadGifts();
