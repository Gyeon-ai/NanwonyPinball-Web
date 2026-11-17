// 빌드 전에 assets/personacons/*.png.enc 를 PNG로 푼다(키: 환경 변수 PERSONACON_KEY).
// - 키가 있으면: 모든 .enc를 풀어 PNG를 새로 쓴다. 키가 틀리면 멈춘다.
// - 키가 없으면: 이 컴퓨터에 원본 PNG가 모두 있을 때만 그대로 쓰고, 하나라도 없으면 멈춘다.
// 빈 그림이나 일부 그림만으로 사이트가 만들어지지 않게 하려는 것이다. 키 값은 출력하지 않는다.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { decrypt, KeyError, listFiles, PERSONACON_DIR, readKey } from './personacon-crypto.mjs';

try {
  const sealedFiles = listFiles('.png.enc');
  if (sealedFiles.length === 0) throw new KeyError(`${PERSONACON_DIR}에 암호화된 퍼스나콘(.png.enc)이 없습니다.`);
  const hasKey = Boolean((process.env.PERSONACON_KEY ?? '').trim());
  if (hasKey) {
    const key = readKey();
    for (const file of sealedFiles) {
      const plain = decrypt(key, file.slice(0, -4), readFileSync(join(PERSONACON_DIR, file)));
      writeFileSync(join(PERSONACON_DIR, file.slice(0, -4)), plain);
    }
    console.log(`퍼스나콘 ${sealedFiles.length}장을 풀었습니다.`);
  } else {
    const missing = sealedFiles.map((file) => file.slice(0, -4)).filter((file) => !existsSync(join(PERSONACON_DIR, file)));
    if (missing.length > 0) {
      throw new KeyError(
        `PERSONACON_KEY 환경 변수가 없고 원본 PNG ${missing.length}장(${missing.join(', ')})도 없습니다. 키를 넣고 다시 빌드하세요.`
      );
    }
    console.log(`PERSONACON_KEY 없음: 이 컴퓨터의 원본 PNG ${sealedFiles.length}장을 그대로 씁니다.`);
  }
} catch (error) {
  console.error(`[퍼스나콘 복호화 실패] ${error.message}`);
  console.error('빌드를 멈춥니다. 공 그림 없이 사이트를 만들지 않습니다.');
  process.exit(1);
}
