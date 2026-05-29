import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Generates a 32-byte key from standard config or fallback
const ENCRYPTION_KEY = process.env.PROMPT_ENCRYPTION_KEY
  ? crypto.scryptSync(process.env.PROMPT_ENCRYPTION_KEY, "codecrate-salt-string", 32)
  : Buffer.from("f5e7b8a9d0c1b2a3f5e7b8a9d0c1b2a3"); // 32-byte default for development convenience

const IV_LENGTH = 16; // Block size for AES

export function encryptPrompt(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptPrompt(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      // If it doesn't match iv:encrypted format, assume it was stored as plaintext during seed/migration and return safely
      return encryptedText;
    }
    const [ivHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Crypto Decryption Error, fallback to raw format:", error);
    return encryptedText;
  }
}
