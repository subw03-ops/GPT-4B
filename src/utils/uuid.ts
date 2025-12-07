/**
 * 보안 컨텍스트(HTTPS, localhost)가 아닌 환경에서도 작동하는 UUID 생성 함수
 * 
 * 문제: 내부 IP(192.168.x.x 등)로 접속 시 브라우저가 비보안 컨텍스트로 판단하여
 * crypto.randomUUID()를 제공하지 않아 앱이 죽는 문제
 * 
 * 해결: crypto.randomUUID() 사용 가능 여부를 체크하고, 불가능하면 폴백 사용
 */

/**
 * UUID v4 생성 함수 (보안 컨텍스트 폴백 포함)
 */
export function generateUUID(): string {
  // 1. crypto.randomUUID()가 사용 가능하면 사용 (가장 안전)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // 보안 컨텍스트 에러 발생 시 폴백으로 이동
    }
  }

  // 2. crypto.getRandomValues()를 사용한 폴백 (대부분의 브라우저에서 지원)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    
    // UUID v4 형식으로 변환
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
    
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // 3. 최후의 폴백: Math.random() 기반 (권장하지 않지만 앱이 죽지는 않음)
  console.warn('[UUID] crypto API를 사용할 수 없어 Math.random() 폴백을 사용합니다.');
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default generateUUID;

