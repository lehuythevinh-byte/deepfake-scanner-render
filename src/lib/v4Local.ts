export interface LocalFinding {
  phrase: string;
  category: string;
  severity: 'medium' | 'high' | 'critical';
  explanation: string;
}

export interface LocalScamAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  findings: LocalFinding[];
  actions: string[];
  method: 'LOCAL_RULES';
  disclaimer: string;
}

const SCAM_RULES: Array<{ pattern: RegExp; category: string; severity: LocalFinding['severity']; explanation: string; weight: number }> = [
  { pattern: /\b(otp|mã xác thực|mã xác minh|mã giao dịch|one[- ]time password)\b/i, category: 'Đánh cắp OTP', severity: 'critical', explanation: 'Nội dung đề cập hoặc yêu cầu mã xác thực dùng một lần. Không chia sẻ OTP cho bất kỳ ai.', weight: 36 },
  { pattern: /(chuyển khoản|chuyển tiền|nộp tiền|đóng phí|phí xác minh|phí nhận quà|phí hồ sơ)/i, category: 'Yêu cầu chuyển tiền', severity: 'high', explanation: 'Có yêu cầu chuyển tiền hoặc thanh toán trước. Cần xác minh qua kênh chính thức độc lập.', weight: 26 },
  { pattern: /(tài khoản.*(khóa|đóng băng|tạm ngưng)|khóa tài khoản|phong tỏa tài khoản)/i, category: 'Đe dọa khóa tài khoản', severity: 'high', explanation: 'Kẻ lừa đảo thường tạo áp lực bằng thông báo khóa tài khoản để buộc nạn nhân hành động vội.', weight: 22 },
  { pattern: /(công an|viện kiểm sát|tòa án|cơ quan điều tra).*(điều tra|liên quan|vi phạm|bắt giữ|xử lý)/i, category: 'Giả danh cơ quan chức năng', severity: 'high', explanation: 'Có dấu hiệu giả danh cơ quan chức năng hoặc dùng áp lực pháp lý. Hãy tự tìm số điện thoại chính thức để xác minh.', weight: 26 },
  { pattern: /(cài (đặt )?app|ứng dụng.*(hỗ trợ|điều khiển)|anydesk|teamviewer|ultraviewer|chia sẻ màn hình)/i, category: 'Dụ cài ứng dụng điều khiển', severity: 'critical', explanation: 'Yêu cầu cài phần mềm điều khiển hoặc chia sẻ màn hình có thể giúp người khác chiếm quyền thiết bị.', weight: 34 },
  { pattern: /(trúng thưởng|nhận quà|quà tặng|hoàn tiền|trợ cấp|nhận tiền miễn phí)/i, category: 'Mồi nhận thưởng', severity: 'medium', explanation: 'Lời mời nhận tiền hoặc quà bất ngờ cần được xác minh; đặc biệt cảnh giác nếu phải nộp phí hoặc cung cấp OTP.', weight: 14 },
  { pattern: /(lợi nhuận.*(cam kết|đảm bảo)|lãi.*(100%|mỗi ngày|mỗi tuần)|đầu tư.*không rủi ro)/i, category: 'Cam kết lợi nhuận bất thường', severity: 'high', explanation: 'Cam kết lợi nhuận cao hoặc không có rủi ro là dấu hiệu cảnh báo đầu tư đáng ngờ.', weight: 26 },
  { pattern: /(khẩn cấp|ngay lập tức|trong vòng \d+ phút|không được nói với ai|giữ bí mật)/i, category: 'Tạo áp lực thời gian', severity: 'medium', explanation: 'Ngôn ngữ thúc ép hoặc yêu cầu giữ bí mật có thể làm giảm khả năng kiểm chứng độc lập.', weight: 15 },
  { pattern: /(mật khẩu|password|số thẻ|cvv|mã pin|pin ngân hàng)/i, category: 'Thu thập thông tin nhạy cảm', severity: 'critical', explanation: 'Có đề cập thông tin đăng nhập hoặc tài chính nhạy cảm. Không gửi mật khẩu, mã PIN hay CVV qua tin nhắn.', weight: 35 },
  { pattern: /(link|đường dẫn|bấm vào|nhấn vào|truy cập vào).*(xác minh|đăng nhập|nhận quà|nhận tiền|cập nhật)/i, category: 'Dụ truy cập liên kết', severity: 'medium', explanation: 'Có lời kêu gọi mở liên kết để xác minh hoặc nhận lợi ích. Hãy kiểm tra tên miền trước khi truy cập.', weight: 18 },
];

export function analyzeScamLocally(text: string): LocalScamAssessment {
  const input = String(text || '').slice(0, 12000);
  const findings: LocalFinding[] = [];
  let score = 0;
  for (const rule of SCAM_RULES) {
    const match = input.match(rule.pattern);
    if (match) {
      score += rule.weight;
      findings.push({
        phrase: match[0].slice(0, 180),
        category: rule.category,
        severity: rule.severity,
        explanation: rule.explanation,
      });
    }
  }
  const unique = findings.filter((item, index) => findings.findIndex((other) => other.category === item.category) === index);
  score = Math.min(100, score);
  const level: LocalScamAssessment['level'] = score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low';
  const actions = [
    'Dừng thao tác và không phản hồi theo yêu cầu gây áp lực.',
    'Không cung cấp OTP, mật khẩu, mã PIN hoặc thông tin thẻ.',
    'Tự tìm website/số điện thoại chính thức để xác minh bằng một kênh độc lập.',
    'Nếu đã chuyển tiền hoặc lộ thông tin, liên hệ ngân hàng qua số chính thức ngay và lưu lại bằng chứng.',
  ];
  if (unique.length === 0) actions.unshift('Chưa phát hiện mẫu rủi ro phổ biến trong bộ quy tắc cục bộ; điều này không chứng minh tin nhắn an toàn.');
  return {
    score,
    level,
    findings: unique,
    actions,
    method: 'LOCAL_RULES',
    disclaimer: 'Đây là sàng lọc bằng quy tắc cục bộ, không phải kết luận pháp lý hoặc xác minh danh tính người gửi. Kẻ lừa đảo có thể dùng cách diễn đạt mới chưa có trong bộ quy tắc.',
  };
}

export async function sha256File(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function ascii(view: DataView, offset: number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(view.getUint8(offset + i));
  return out;
}

function readTiffValue(view: DataView, base: number, offset: number, type: number, count: number, little: boolean): string | number | null {
  const sizes: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
  const size = sizes[type];
  if (!size || count < 1 || count > 256) return null;
  const bytes = size * count;
  const ptr = bytes <= 4 ? offset : base + view.getUint32(offset, little);
  if (ptr < 0 || ptr + bytes > view.byteLength) return null;
  if (type === 2) return ascii(view, ptr, Math.min(count, 256)).replace(/\0+$/, '').trim();
  if (type === 3) return view.getUint16(ptr, little);
  if (type === 4) return view.getUint32(ptr, little);
  if (type === 9) return view.getInt32(ptr, little);
  if (type === 5 || type === 10) {
    const numerator = type === 5 ? view.getUint32(ptr, little) : view.getInt32(ptr, little);
    const denominator = type === 5 ? view.getUint32(ptr + 4, little) : view.getInt32(ptr + 4, little);
    return denominator ? numerator / denominator : null;
  }
  return view.getUint8(ptr);
}

export async function readJpegExif(file: File): Promise<Record<string, string | number | null> | null> {
  if (!/jpe?g/i.test(file.type)) return null;
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2, false);
    if (length < 2 || offset + 2 + length > view.byteLength) break;
    const dataOffset = offset + 4;
    const dataLength = length - 2;
    if (marker === 0xe1 && dataLength >= 14 && ascii(view, dataOffset, 6) === 'Exif\0\0') {
      const tiff = dataOffset + 6;
      const endian = ascii(view, tiff, 2);
      const little = endian === 'II';
      if (!little && endian !== 'MM') return { exifFound: 'Có vùng EXIF nhưng thứ tự byte không được hỗ trợ' };
      if (view.getUint16(tiff + 2, little) !== 42) return null;
      const ifd0 = tiff + view.getUint32(tiff + 4, little);
      if (ifd0 + 2 > view.byteLength) return null;
      const count = Math.min(view.getUint16(ifd0, little), 200);
      const result: Record<string, string | number | null> = { exifFound: 'Có' };
      const tags: Record<number, string> = { 0x010f: 'Make', 0x0110: 'Model', 0x0132: 'DateTime', 0x0131: 'Software', 0x0112: 'Orientation', 0x9003: 'DateTimeOriginal' };
      for (let i = 0; i < count; i += 1) {
        const entry = ifd0 + 2 + i * 12;
        if (entry + 12 > view.byteLength) break;
        const tag = view.getUint16(entry, little);
        if (tags[tag]) {
          const value = readTiffValue(view, tiff, entry + 8, view.getUint16(entry + 2, little), view.getUint32(entry + 4, little), little);
          result[tags[tag]] = value;
        }
        if (tag === 0x8825) result.GPSMetadata = 'Có GPS metadata (tọa độ không được hiển thị mặc định vì lý do riêng tư)';
      }
      return result;
    }
    if (marker === 0xda || marker === 0xd9) break;
    offset += 2 + length;
  }
  return { exifFound: 'Không tìm thấy EXIF chuẩn trong JPEG này' };
}

const DB_NAME = 'deepfake-scanner-v4-evidence';
const STORE_NAME = 'files';

function openEvidenceDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('Trình duyệt không hỗ trợ lưu trữ cục bộ.'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Không mở được kho cục bộ.'));
  });
}

async function deriveEvidenceKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function saveEvidenceBlob(id: string, ownerId: string, file: File, passphrase: string): Promise<void> {
  if (passphrase.length < 12) throw new Error('Mật khẩu Vault cần ít nhất 12 ký tự.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEvidenceKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());
  const db = await openEvidenceDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({
        id, ownerId, cipher: encrypted, salt: Array.from(salt), iv: Array.from(iv),
        originalType: file.type || 'application/octet-stream', savedAt: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Không lưu được file đã mã hóa vào trình duyệt.'));
      tx.onabort = () => reject(tx.error || new Error('Giao dịch lưu file bị hủy.'));
    });
  } finally { db.close(); }
}

export async function getEvidenceBlob(id: string, ownerId: string, passphrase: string): Promise<Blob | null> {
  const db = await openEvidenceDb();
  try {
    const record = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Không đọc được file cục bộ.'));
    });
    if (!record || record.ownerId !== ownerId) return null;
    const key = await deriveEvidenceKey(passphrase, new Uint8Array(record.salt));
    try {
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv) }, key, record.cipher);
      return new Blob([plain], { type: record.originalType || 'application/octet-stream' });
    } catch {
      throw new Error('Không giải mã được file. Hãy kiểm tra mật khẩu Vault; mật khẩu không được lưu trên máy chủ.');
    }
  } finally { db.close(); }
}

export async function deleteEvidenceBlob(id: string, ownerId: string): Promise<void> {
  const db = await openEvidenceDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => {
        if (request.result?.ownerId === ownerId) store.delete(id);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Không xóa được file cục bộ.'));
    });
  } finally { db.close(); }
}
