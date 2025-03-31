const userForm = document.getElementById("userForm");
const usernameInput = document.getElementById("username");
const userList = document.getElementById("userList");

const API_URL = "http://localhost:3001";

// Načítání uživatelů
async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        console.log("Načtení uživatelů:", users);
        userList.innerHTML = "";
        users.forEach(user => {
            const li = document.createElement("li");
            li.innerHTML = `${user.name} <button class="delete" onclick="deleteUser(${user.id})">X</button>`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error("Chyba při načítání uživatelů:", error);
    }
}

// Přidávání uživatele
userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (!name) return alert("Zadejte jméno!");

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        if (!res.ok) throw new Error("Chyba při přidávání uživatele");

        console.log("Uživatel přidán");
        usernameInput.value = "";
        fetchUsers();
    } catch (error) {
        console.error("Chyba:", error);
    }
});

// mazání uživatelů
async function deleteUser(id) {
    try {
        const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Chyba při mazání uživatele");
        console.log(`Uživatel ${id} smazán`);
        fetchUsers();
    } catch (error) {
        console.error("Chyba:", error);
    }
}

fetchUsers();
