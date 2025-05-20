import CryptoJS from "crypto-js";
import bcrypt, { compare, genSaltSync, hash } from "bcrypt";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { env } from "./env";
import { sensitive } from "./key";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { CaptchaType } from "./key";
import * as svgCaptcha from "svg-captcha";
import { CustomError, UnauthorizedError } from "./error";
import { scryptSync } from "crypto";
import { logger } from "./log";

const SALT_ROUNDS = 10;

/**
 * Encrypt password with bcrypt.
 * @param password - Password to encrypt.
 * @returns Encrypted password.
 */
async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}
function encryptPassword(password: string, salt: string): string {
  const derivedKey = scryptSync(password, salt, 64); // 64字节长度的密钥
  return derivedKey.toString("hex");
}
//  使用crypto生成加密的盐 8位输出10位
const getSelfSalt = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + "==";
};

/**
 * Compare a plain password with its hashed version.
 * @param plainPassword - The plain password.
 * @param hashedPassword - The hashed password.
 * @returns Whether the plain password matches the hashed password.
 */
async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

const SECRET_KEY = env.jwt.secret; //process.env.JWT_SECRET! || "your_secret_key";
const REFRESH_SECRET_KEY = env.jwt.refreshSecret||"your_refresh_secret";
/**
 * Encrypts data using AES encryption.
 * @param data - The data to encrypt.
 * @returns The encrypted data as a string.
 */

function encryptToken(data: Record<string, any>): string {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
  return ciphertext;
}

/**
 * Decrypts an encrypted token using AES decryption.
 * @param token - The encrypted token to decrypt.
 * @returns The decrypted data as an object if successful, or null if decryption fails.
 */

function decryptToken(token: string): any | null {
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    return null;
  }
}

/**
 * Generates a JSON Web Token (JWT) for a given payload.
 * @param payload - The data to include in the token.
 * @returns A signed JWT as a string.
 */

function generateToken(payload: any) {
  let exp = new Date();
  exp.setTime(exp.getTime() + 24 * 60 * 60 * 1000);
  let exptime = exp.getTime();
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" }); // 可配置过期时间
  return { token, exptime };
}

/**
 * Verifies a JSON Web Token (JWT) signature.
 * @param token - The JWT to verify.
 * @returns The decoded payload if the token is valid, or null if verification fails.
 */
function verifyToken(token: string): any | null {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error: any) {
    logger().error({ event: "token verify error", error: error });
    throw new UnauthorizedError(error.message);
  }
}

/**
 * 刷新令牌
 */
function generateRefreshToken(payload: { id: number,role:string }) {
  let exp = new Date();
  exp.setTime(exp.getTime() + 24 * 60 * 60 * 1000);
  let refreshExptime = exp.getTime();
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  }); // 可配置过期时间
  return { refreshToken, refreshExptime:exp };
}

/**
 * 验证刷新令牌
 */
function verifyRefreshToken(token: string) : any {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY);
  } catch (error: any) {
    logger().error({ event: "token verify error", error: error });
    throw new UnauthorizedError(error.message);
  }
}

/**
 * Generates a random alphanumeric string of specified length.
 * @param length - Optional. The length of the generated string. Defaults to 16 if not provided.
 * @returns A random alphanumeric string.
 */

function radonString(length?: number) {
  let result = "";
  if (!length) length = 16;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * 脱敏敏感信息
 * @param str - 需要脱敏的字符串
 * @param type - 脱敏类型，见 {@link sensitive}
 * @returns 脱敏后的字符串
 */
const replaceSensitiveInfo = (str: string, type: sensitive): string => {
  try {
    if (!type) throw new Error("缺少参数");
    if (!str || str.length < 1) throw new Error("缺少参数");
    switch (type) {
      case sensitive.phone:
        return str.replace(/(\d{3})\d*(\d{4})/, "$1****$2");
      case sensitive.email:
        return str.replace(/(\w{1})[^@]*(@\w+\.\w+)/, "$1***$2");
      case sensitive.idCard:
        return str.replace(/(\d{4})\d*(\d{4})/, "$1****$2");
      case sensitive.bankCard:
        return str.replace(/(\d{6})\d+(\d{4})/, "$1****$2");
      case sensitive.name: {
        const length = str.length;
        switch (length) {
          case 1:
            return str; // 只有一个字符，不隐藏
          case 2:
            return str[0] + "*"; // 两个字符，只显示第一个
          case 3:
            return str[0] + "*" + str[2]; // 三个字符，隐藏中间
          default:
            return str[0] + "**" + str.slice(-1); // 其他情况，显示首尾，隐藏中间
        }
      }
      default:
        return str;
    }
  } catch (error: unknown) {
    console.error("未知错误:", error);
    const e = `未知错误:${String(error)}`;
    throw new Error(e); // 将未知错误转换为 Error
  }
};

const whiteListRegex = async (path: string): Promise<boolean> => {
  const regexesWhiteList = env.jwt.whiteList.map((paths) => {
    const escaped = paths.replace(/\//g, "\\/").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  });

  return regexesWhiteList.some((regex) => regex.test(path));
};

/**
 * Encrypts a given text using AES-256-CBC algorithm.
 *
 * @param text - The plain text to be encrypted.
 * @param key - A 32-byte key used for encryption.
 *
 * @returns The encrypted text in hexadecimal format.
 */
const encryptAES = (text: string, key: string): string => {
  try {
    if (!text || test.length < 1 || key.length < 32)
      throw new Error("字符长度错误");
    // Create a cipher instance with the specified algorithm, key, and initialization vector
    const cipher = crypto.createCipheriv("aes-256-cbc", key, key.slice(0, 16));
    // Encrypt the text and return the result in hexadecimal format
    return cipher.update(text, "utf8", "hex") + cipher.final("hex");
  } catch (error: unknown) {
    console.log(error);
    throw error;
  }
};

/**
 * Decrypts an encrypted text using AES-256-CBC algorithm.
 *
 * @param encryptedText - The text to be decrypted, in hexadecimal format.
 * @param key - A 32-byte key used for decryption.
 *
 * @returns The decrypted plain text.
 */
const decryptAES = (encryptedText: string, key: string): string => {
  try {
    if (key.length < 32) throw new Error("字符长度错误");
    // Create a decipher instance with the specified algorithm, key, and initialization vector
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      key.slice(0, 16)
    );
    // Decrypt the encrypted text and return the result in UTF-8 format
    return (
      decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8")
    );
  } catch (error: unknown) {
    console.log(error);
    throw error;
  }
};
//  使用bcrypt生成10轮加密字符串
const getSaltByBcrypt = () => {
  return genSaltSync();
};
//  使用bcrypt生成加密后的字符串
const hashPasswordBySalt = async (password: string, salt: string) => {
  const hashedPassword = await hash(password, salt);
  return hashedPassword;
};
//  使用bcrypt比较明文与散列加密后的密码一致性
const comparePassword = (password: string, hashedPassword: string) => {
  return compare(password, hashedPassword);
};

//  生成随机字符串,base64格式
const makeRandString = (length: number) => {
  return crypto.randomBytes(length).toString("base64");
};

const generateAccessToken = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result + "==";
};

/**
 * 生成验证码
 *
 * 生成4位验证码，图片宽80px，高28px，字符大小36px，2条干扰线
 * @returns {Promise<svgCaptcha.Captcha>} 验证码对象
 */
const getCaptcha = (type: CaptchaType, length?: number) => {
  try {
    let captcha;
    const size = length || 4;
    switch (type) {
      case CaptchaType.ALPHANUMERIC:
        captcha = captcha = svgCaptcha.create({
          size: size,
          ignoreChars: "0o1il",
          noise: 2,
          background: "#f2f2f2",
          color: true,
        });
        break;
      case CaptchaType.NUMERIC:
        captcha = svgCaptcha.create({
          size: size, // 长度
          ignoreChars: "0o1il", // 去除易混淆字符
          noise: 2, // 干扰线数量
          background: "#f2f2f2", // 背景色
          color: true, // 颜色
          charPreset: "0123456789", // 限制为纯数字
        });
        break;
      case CaptchaType.MATH:
        captcha = svgCaptcha.createMathExpr({
          size: size, //生成验证码长度
          width: 80, //图片宽度
          height: 28, //生成的图片高度
          color: true, //生成图片色彩度
          background: "#cc9966", //背景颜色
          noise: 3, //干扰线条数
        });
        break;
      default:
        captcha = svgCaptcha.create({
          size: size,
          ignoreChars: "0o1il",
          noise: 2,
          background: "#f2f2f2",
          color: true,
        });
        break;
    }
    const base64 = `data:image/svg+xml;base64,${Buffer.from(
      captcha.data
    ).toString("base64")}`;
    const id = uuidv4();
    return { base64, text: captcha.text as string, id };
  } catch (error: unknown) {
    console.log(error);
    throw error;
  }
};
// 格式化单个时间
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 自动识别对象中的所有 xxxAt 字段并格式化
export function autoFormatObjectDates(obj: any) {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    if ((key.endsWith("At") || key.endsWith("Time")) && obj[key]) {
      obj[key] = formatDate(obj[key]);
    }
  });
}

// 自动识别数组中的所有对象并格式化 xxxAt 字段
export function autoFormatArrayDates(arr: any[]) {
  if (!Array.isArray(arr)) return;

  arr.forEach((item) => {
    autoFormatObjectDates(item);
  });
}
export {
  encryptToken,
  decryptToken,
  generateToken,
  verifyToken,
  radonString,
  hashPassword,
  replaceSensitiveInfo,
  comparePasswords,
  whiteListRegex,
  getSelfSalt,
  hashPasswordBySalt,
  encryptPassword,
  comparePassword,
  makeRandString,
  getCaptcha,
  generateAccessToken,
  getSaltByBcrypt,
  generateRefreshToken,
  verifyRefreshToken,
};
