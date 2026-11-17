// 퍼스나콘 그림 암호화·복호화 공통 부분.
// 저장소에는 암호화된 assets/personacons/*.png.enc 만 두고, 원본 PNG는 .gitignore로 뺀다.
// 사이트를 만들 때만 GitHub Actions가 비밀 값 PERSONACON_KEY로 풀어서 쓴다.
// 형식: "NWPC1"(5바이트) + IV(12) + 인증 태그(16) + 암호문. AES-256-GCM, 파일 이름을 추가 인증 데이터로 묶는다.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PERSONACON_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'personacons');
const MAGIC = Buffer.from('NWPC1');

export class KeyError extends Error {}

/** PERSONACON_KEY(32바이트를 base64로 적은 값)를 읽는다. 값은 어디에도 출력하지 않는다. */
export function readKey(env = process.env) {
  const text = (env.PERSONACON_KEY ?? '').trim();
  if (!text) throw new KeyError('PERSONACON_KEY 환경 변수가 없습니다.');
  const key = Buffer.from(text, 'base64');
  if (key.length !== 32) throw new KeyError('PERSONACON_KEY 형식이 틀렸습니다(32바이트 base64여야 합니다).');
  return key;
}

export function encrypt(key, name, plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(name));
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), body]);
}

export function decrypt(key, name, data) {
  if (data.length < MAGIC.length + 28 || !data.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new KeyError(`${name}: 암호화 파일 형식이 아닙니다.`);
  }
  const iv = data.subarray(5, 17);
  const tag = data.subarray(17, 33);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(Buffer.from(name));
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(data.subarray(33)), decipher.final()]);
  } catch {
    throw new KeyError(`${name}: 풀 수 없습니다. PERSONACON_KEY가 틀렸거나 파일이 손상됐습니다.`);
  }
}

export function listFiles(ext) {
  return readdirSync(PERSONACON_DIR)
    .filter((file) => file.endsWith(ext))
    .sort();
}
