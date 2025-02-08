import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const algorithm = "aes-256-gcm";

export function encrypt(text: string, key: string) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, Buffer.from(key, "hex"), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    encrypted,
    authTag: authTag.toString("hex"),
  };
}

export function decrypt(encrypted: any, key: string) {
  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(key, "hex"),
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));

  let decrypted = decipher.update(encrypted.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
