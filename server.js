const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());


const db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error(err.message);
    else console.log("Connected to SQLite database.");
});

// Získání všech produktů
app.get("/products", (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Vytvoření tabulek
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);
    
  
    
db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
});

// Přidání uživatele
app.post("/users", (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO users (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
});

// Přidání produktu
app.post("/products", (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO products (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
});

// Vytvoření objednávky
app.post("/orders", (req, res) => {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({ error: "Musíte zadat user_id a product_id" });
    }

    const sql = "INSERT INTO orders (user_id, product_id) VALUES (?, ?)";
    db.run(sql, [user_id, product_id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: `Objednávka vytvořena s ID: ${this.lastID}`, id: this.lastID });
    });
});


// Získání všech uživatelů
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Získání produktů podle jména (SELECT WHERE)
app.get("/products/search", (req, res) => {
    const { name } = req.query;
    db.all("SELECT * FROM products WHERE name LIKE ?", [`%${name}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Získání objednávek s informacemi o uživateli a produktu (JOIN)
app.get("/orders", (req, res) => {
    db.all(
        `SELECT orders.id, users.name AS user_name, products.name AS product_name 
        FROM orders 
        JOIN users ON orders.user_id = users.id 
        JOIN products ON orders.product_id = products.id`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows); // Zobrazí všechny řádky (objednávky)
        }
    );
});


// Aktualizace uživatele
app.put("/users/:id", (req, res) => {
    const { name } = req.body;
    db.run("UPDATE users SET name = ? WHERE id = ?", [name, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// Smazání uživatele
app.delete("/users/:id", (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

app.listen(3001, () => console.log("Server running on port 3001"));
