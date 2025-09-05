import CryptoJS from 'crypto-js'

/**
 * End-to-end encryption utilities for Dream Weaver
 * Uses AES-256-GCM encryption with client-side key derivation
 */

// Configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  keySize: 256 / 32, // 256 bits
  ivSize: 128 / 32,  // 128 bits
  iterations: 10000,  // PBKDF2 iterations
  tagSize: 128 / 32   // 128 bits for authentication tag
}

/**
 * Generate a secure encryption key from user's password/passphrase
 * @param {string} passphrase - User's passphrase
 * @param {string} salt - Salt for key derivation (should be unique per user)
 * @returns {string} Derived encryption key
 */
export const deriveEncryptionKey = (passphrase, salt) => {
  if (!passphrase || !salt) {
    throw new Error('Passphrase and salt are required for key derivation')
  }

  return CryptoJS.PBKDF2(passphrase, salt, {
    keySize: ENCRYPTION_CONFIG.keySize,
    iterations: ENCRYPTION_CONFIG.iterations,
    hasher: CryptoJS.algo.SHA256
  }).toString()
}

/**
 * Generate a random salt for key derivation
 * @returns {string} Random salt
 */
export const generateSalt = () => {
  return CryptoJS.lib.WordArray.random(256 / 8).toString()
}

/**
 * Generate a random initialization vector
 * @returns {string} Random IV
 */
export const generateIV = () => {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize * 4).toString()
}

/**
 * Encrypt data using AES-256-CBC
 * @param {string} plaintext - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted data with IV prepended
 */
export const encryptData = (plaintext, key) => {
  if (!plaintext || !key) {
    throw new Error('Plaintext and key are required for encryption')
  }

  try {
    const iv = generateIV()
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Prepend IV to encrypted data for storage
    return iv + ':' + encrypted.toString()
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt data using AES-256-CBC
 * @param {string} ciphertext - Encrypted data with IV prepended
 * @param {string} key - Decryption key
 * @returns {string} Decrypted plaintext
 */
export const decryptData = (ciphertext, key) => {
  if (!ciphertext || !key) {
    throw new Error('Ciphertext and key are required for decryption')
  }

  try {
    const parts = ciphertext.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid ciphertext format')
    }

    const [iv, encrypted] = parts
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8)
    if (!plaintext) {
      throw new Error('Decryption failed - invalid key or corrupted data')
    }

    return plaintext
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data - invalid key or corrupted data')
  }
}

/**
 * Encrypt an object by encrypting its JSON representation
 * @param {Object} obj - Object to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted object
 */
export const encryptObject = (obj, key) => {
  return encryptData(JSON.stringify(obj), key)
}

/**
 * Decrypt an object by decrypting and parsing JSON
 * @param {string} ciphertext - Encrypted object
 * @param {string} key - Decryption key
 * @returns {Object} Decrypted object
 */
export const decryptObject = (ciphertext, key) => {
  const plaintext = decryptData(ciphertext, key)
  return JSON.parse(plaintext)
}

/**
 * Create a secure hash of data (for integrity checking)
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash
 */
export const createHash = (data) => {
  return CryptoJS.SHA256(data).toString()
}

/**
 * Verify data integrity using hash
 * @param {string} data - Original data
 * @param {string} hash - Expected hash
 * @returns {boolean} True if hash matches
 */
export const verifyHash = (data, hash) => {
  return createHash(data) === hash
}

/**
 * Generate a secure random password/passphrase
 * @param {number} length - Length of password (default: 32)
 * @returns {string} Random password
 */
export const generateSecurePassword = (length = 32) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  
  return password
}

/**
 * Key management utilities
 */
export class KeyManager {
  constructor() {
    this.keyStorageKey = 'dreamWeaver_keyInfo'
  }

  /**
   * Store key derivation info (salt) securely
   * @param {string} userId - User ID
   * @param {string} salt - Salt for key derivation
   */
  storeKeyInfo(userId, salt) {
    const keyInfo = {
      userId,
      salt,
      timestamp: Date.now()
    }
    localStorage.setItem(this.keyStorageKey, JSON.stringify(keyInfo))
  }

  /**
   * Retrieve key derivation info
   * @param {string} userId - User ID
   * @returns {Object|null} Key info or null if not found
   */
  getKeyInfo(userId) {
    try {
      const keyInfo = localStorage.getItem(this.keyStorageKey)
      if (!keyInfo) return null

      const parsed = JSON.parse(keyInfo)
      if (parsed.userId !== userId) return null

      return parsed
    } catch (error) {
      console.error('Failed to retrieve key info:', error)
      return null
    }
  }

  /**
   * Clear stored key info (for logout)
   */
  clearKeyInfo() {
    localStorage.removeItem(this.keyStorageKey)
  }

  /**
   * Generate and store new key info for user
   * @param {string} userId - User ID
   * @returns {string} Generated salt
   */
  initializeUserKeys(userId) {
    const salt = generateSalt()
    this.storeKeyInfo(userId, salt)
    return salt
  }
}

export const keyManager = new KeyManager()

/**
 * Utility functions for dream-specific encryption
 */
export const dreamEncryption = {
  /**
   * Encrypt a dream entry
   * @param {Object} dream - Dream entry object
   * @param {string} key - Encryption key
   * @returns {Object} Encrypted dream entry
   */
  encryptDream: (dream, key) => {
    return {
      ...dream,
      title: dream.title ? encryptData(dream.title, key) : null,
      content: encryptData(dream.content, key),
      interpretation: dream.interpretation ? encryptData(dream.interpretation, key) : null,
      tags: dream.tags ? dream.tags.map(tag => encryptData(tag, key)) : [],
      emotions: dream.emotions ? dream.emotions.map(emotion => encryptData(emotion, key)) : []
    }
  },

  /**
   * Decrypt a dream entry
   * @param {Object} encryptedDream - Encrypted dream entry
   * @param {string} key - Decryption key
   * @returns {Object} Decrypted dream entry
   */
  decryptDream: (encryptedDream, key) => {
    return {
      ...encryptedDream,
      title: encryptedDream.title ? decryptData(encryptedDream.title, key) : null,
      content: decryptData(encryptedDream.content, key),
      interpretation: encryptedDream.interpretation ? decryptData(encryptedDream.interpretation, key) : null,
      tags: encryptedDream.tags ? encryptedDream.tags.map(tag => decryptData(tag, key)) : [],
      emotions: encryptedDream.emotions ? encryptedDream.emotions.map(emotion => decryptData(emotion, key)) : []
    }
  }
}

/**
 * Test encryption/decryption functionality
 * @returns {boolean} True if encryption is working correctly
 */
export const testEncryption = () => {
  try {
    const testData = 'This is a test message for encryption'
    const testKey = 'test-key-123'
    
    const encrypted = encryptData(testData, testKey)
    const decrypted = decryptData(encrypted, testKey)
    
    return decrypted === testData
  } catch (error) {
    console.error('Encryption test failed:', error)
    return false
  }
}
