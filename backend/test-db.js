const db = require("./config/db");

async function testConnection() {
    try {
        const [rows] = await db.query("SELECT VERSION() AS version");
        console.log("MySQL connected successfully!");
        console.log("MySQL version:", rows[0].version);
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

testConnection();
