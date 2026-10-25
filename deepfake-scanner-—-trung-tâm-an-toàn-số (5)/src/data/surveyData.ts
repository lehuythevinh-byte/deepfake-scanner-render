import { SurveyResponseData } from '../types';

export interface SurveyQuestionOption {
  value: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  group: 'A' | 'B' | 'C' | 'D';
  groupTitle: string;
  question: string;
  type: 'radio' | 'checkbox' | 'rating';
  options?: SurveyQuestionOption[];
  description?: string;
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // Nhóm A: Thông tin chung
  {
    id: 'grade',
    group: 'A',
    groupTitle: 'Nhóm A — Thông tin nghiên cứu chung',
    question: 'Em hiện đang là học sinh khối lớp mấy (hoặc đối tượng tham gia)?',
    type: 'radio',
    options: [
      { value: 'Lớp 6', label: 'Học sinh Lớp 6 (11-12 tuổi)' },
      { value: 'Lớp 7', label: 'Học sinh Lớp 7 (12-13 tuổi)' },
      { value: 'Lớp 8', label: 'Học sinh Lớp 8 (13-14 tuổi)' },
      { value: 'Lớp 9', label: 'Học sinh Lớp 9 (14-15 tuổi)' },
      { value: 'Giáo viên / Phụ huynh', label: 'Giáo viên / Phụ huynh theo dõi' },
    ],
  },

  // Nhóm B: Mức độ tiếp xúc
  {
    id: 'hasHeardDeepfake',
    group: 'B',
    groupTitle: 'Nhóm B — Mức độ tiếp xúc với thông tin số',
    question: 'Trước khi tham gia nghiên cứu này, em đã từng nghe về thuật ngữ "Deepfake" hoặc hình ảnh/video do AI giả mạo chưa?',
    type: 'radio',
    options: [
      { value: 'Có', label: 'Đã biết rõ và hiểu cách nó hoạt động' },
      { value: 'Nghe thoáng qua', label: 'Có nghe nhắc đến trên mạng xã hội nhưng chưa hiểu rõ' },
      { value: 'Chưa', label: 'Chưa từng nghe bao giờ' },
    ],
  },
  {
    id: 'encounteredSuspicious',
    group: 'B',
    groupTitle: 'Nhóm B — Mức độ tiếp xúc với thông tin số',
    question: 'Trong quá trình lướt TikTok, Facebook, YouTube hoặc Zalo, em đã từng bắt gặp video hoặc hình ảnh nghi ngờ bị chỉnh sửa giả mạo chưa?',
    type: 'radio',
    options: [
      { value: 'Đã từng gặp', label: 'Đã từng gặp ít nhất 1-2 lần' },
      { value: 'Chưa từng', label: 'Chưa bao giờ thấy' },
      { value: 'Không chắc chắn', label: 'Không chắc chắn vì không biết cách phân biệt' },
    ],
  },
  {
    id: 'mainInformationSources',
    group: 'B',
    groupTitle: 'Nhóm B — Mức độ tiếp xúc với thông tin số',
    question: 'Em thường tiếp nhận các thông tin thời sự, xu hướng và giải trí từ những kênh nào? (Chọn các kênh thường dùng)',
    type: 'checkbox',
    options: [
      { value: 'TikTok', label: 'TikTok (Video ngắn)' },
      { value: 'Facebook / Messenger', label: 'Facebook / Tin nhắn Messenger' },
      { value: 'YouTube / Shorts', label: 'YouTube / YouTube Shorts' },
      { value: 'Zalo', label: 'Nhóm lớp, bạn bè trên Zalo' },
      { value: 'Báo chí chính thống', label: 'Báo điện tử chính thống (Tuổi trẻ, Thanh niên, VTV...)' },
      { value: 'Gia đình & Thầy cô', label: 'Qua lời kể của bố mẹ, thầy cô' },
    ],
  },
  {
    id: 'checksSourceBeforeSharing',
    group: 'B',
    groupTitle: 'Nhóm B — Mức độ tiếp xúc với thông tin số',
    question: 'Khi thấy một thông tin sốc, giật gân trên mạng, em có thói quen tìm kiếm đối chiếu nguồn tin trước khi bấm "Chia sẻ" không?',
    type: 'radio',
    options: [
      { value: 'Thường xuyên', label: 'Thường xuyên tìm kiếm kiểm chứng nguồn' },
      { value: 'Thỉnh thoảng', label: 'Thỉnh thoảng (nếu thông tin liên quan đến người quen)' },
      { value: 'Hiếm khi', label: 'Hiếm khi, chỉ lướt thấy hay là chia sẻ' },
      { value: 'Không bao giờ', label: 'Không bao giờ kiểm tra' },
    ],
  },

  // Nhóm C: Nhận thức và kỹ năng
  {
    id: 'knowsVerificationSteps',
    group: 'C',
    groupTitle: 'Nhóm C — Nhận thức và kỹ năng ứng phó',
    question: 'Em có nắm được các bước kiểm chứng một hình ảnh hoặc video nghi vấn giả mạo không?',
    type: 'radio',
    options: [
      { value: 'Biết rõ quy trình', label: 'Biết rõ quy trình (4 bước: Dừng lại - Kiểm chứng - Bảo vệ - Báo cáo)' },
      { value: 'Biết một vài cách', label: 'Biết một vài mẹo vặt (nhìn mắt, nhìn răng)' },
      { value: 'Chưa biết cách nào', label: 'Hoàn toàn chưa biết cách kiểm chứng' },
    ],
  },
  {
    id: 'understandsAiLimitations',
    group: 'C',
    groupTitle: 'Nhóm C — Nhận thức và kỹ năng ứng phó',
    question: 'Theo em, một phần mềm AI phát hiện Deepfake có thể kết luận chính xác 100% thật/giả mọi lúc mọi nơi không?',
    type: 'radio',
    options: [
      { value: 'Không', label: 'Không, AI chỉ là công cụ hỗ trợ xác suất, con người phải luôn kiểm chứng nguồn độc lập' },
      { value: 'Có', label: 'Có, AI máy tính luôn luôn đúng tuyệt đối' },
    ],
  },
  {
    id: 'actionWhenUrgentRequest',
    group: 'C',
    groupTitle: 'Nhóm C — Nhận thức và kỹ năng ứng phó',
    question: 'Nếu nhận được tin nhắn thoại giống giọng bố mẹ giục chuyển tiền gấp, phản xạ đầu tiên của em là gì?',
    type: 'radio',
    options: [
      { value: 'Gọi điện thoại SIM xác minh', label: 'Gọi lại bằng cuộc gọi thoại trực tiếp qua số SIM của bố mẹ để xác minh' },
      { value: 'Chuyển tiền hoặc đưa thẻ ngay', label: 'Chuyển tiền hoặc đưa thẻ ngay vì lo sợ bố mẹ gặp nguy hiểm' },
      { value: 'Nhắn tin hỏi lại trên ứng dụng', label: 'Nhắn tin hỏi lại trên chính tài khoản đang gửi tin' },
    ],
  },

  // Nhóm D: Đánh giá giải pháp website
  {
    id: 'wantsToUseScanner',
    group: 'D',
    groupTitle: 'Nhóm D — Đánh giá sự hữu ích của giải pháp',
    question: 'Em có thấy việc có một nền tảng như "DEEPFAKE SCANNER - TRUNG TÂM AN TOÀN SỐ" tại trường học là cần thiết không?',
    type: 'radio',
    options: [
      { value: 'Rất cần thiết', label: 'Rất cần thiết, giúp học sinh có chỗ thực hành và kiểm tra an toàn' },
      { value: 'Hơi cần thiết', label: 'Bình thường, có thì tốt' },
      { value: 'Không cần thiết', label: 'Không cần thiết' },
    ],
  },
  {
    id: 'mostValuedFeature',
    group: 'D',
    groupTitle: 'Nhóm D — Đánh giá sự hữu ích của giải pháp',
    question: 'Phân hệ nào trên website em thấy hữu ích và thiết thực nhất đối với học sinh THCS?',
    type: 'radio',
    options: [
      { value: 'AI Scanner', label: 'AI Scanner (Phân tích giám định tệp đa phương tiện)' },
      { value: 'Phòng kiểm chứng', label: 'Phòng kiểm chứng thông tin (Checklist từng bước)' },
      { value: 'Mô phỏng tình huống', label: 'Mô phỏng tình huống an toàn số (Safety Simulator)' },
      { value: 'SafeBot AI', label: 'Trợ lý SafeBot AI hướng dẫn ứng phó' },
      { value: 'Học viện kiến thức', label: 'Học viện Deepfake & Cẩm nang xử lý rủi ro' },
    ],
  },
  {
    id: 'satisfactionScore',
    group: 'D',
    groupTitle: 'Nhóm D — Đánh giá sự hữu ích của giải pháp',
    question: 'Đánh giá mức độ dễ hiểu, thân thiện và hữu ích của website (Thang điểm 1 đến 5 sao):',
    type: 'rating',
  },
];

// DỮ LIỆU MINH HỌA: N=320 và các tỷ lệ bên dưới là dữ liệu dựng sẵn để trình diễn giao diện. Không được trích dẫn như khảo sát thật; cần thay bằng dữ liệu đã thu thập và có căn cứ trước khi báo cáo.
export const RESEARCH_BENCHMARK_DATA = {
  sampleSize: 320,
  schoolType: 'Học sinh Trung học Cơ sở (Khối 6-9)',
  surveyDuration: '10/2025 - 03/2026',
  methodology: 'Khảo sát cắt ngang trước và sau can thiệp (Pre-test & Post-test evaluation), kết hợp đo lường định lượng và thực hành tình huống',
  
  gradeDistribution: [
    { name: 'Khối 6', count: 68, percentage: 21.25 },
    { name: 'Khối 7', count: 82, percentage: 25.62 },
    { name: 'Khối 8', count: 96, percentage: 30.00 },
    { name: 'Khối 9', count: 74, percentage: 23.13 },
  ],

  awarenessBaseline: [
    { category: 'Đã hiểu rõ Deepfake', count: 52, percentage: 16.25 },
    { category: 'Nghe thoáng qua', count: 184, percentage: 57.50 },
    { category: 'Chưa từng nghe', count: 84, percentage: 26.25 },
  ],

  sharingHabits: [
    { habit: 'Thường xuyên kiểm chứng', count: 38, percentage: 11.88 },
    { habit: 'Thỉnh thoảng kiểm chứng', count: 94, percentage: 29.38 },
    { habit: 'Hiếm khi kiểm chứng', count: 136, percentage: 42.50 },
    { habit: 'Không bao giờ kiểm chứng', count: 52, percentage: 16.24 },
  ],

  // So sánh kết quả Trước & Sau can thiệp (Pre-test vs Post-test)
  prePostComparison: [
    {
      metric: 'Nhận diện đúng rủi ro Deepfake trong bài kiểm tra',
      preIntervention: 28.4,
      postIntervention: 86.8,
      improvement: '+58.4%',
      unit: '% học sinh đạt',
    },
    {
      metric: 'Thực hiện quy tắc kiểm chứng (không chuyển tiền vội)',
      preIntervention: 41.2,
      postIntervention: 95.3,
      improvement: '+54.1%',
      unit: '% học sinh đạt',
    },
    {
      metric: 'Biết đến Tổng đài 111 & cách tìm trợ giúp từ người lớn',
      preIntervention: 34.1,
      postIntervention: 92.5,
      improvement: '+58.4%',
      unit: '% học sinh đạt',
    },
    {
      metric: 'Hiểu đúng rằng AI không thể phán đoán đúng 100%',
      preIntervention: 19.7,
      postIntervention: 88.2,
      improvement: '+68.5%',
      unit: '% học sinh đạt',
    },
    {
      metric: 'Áp dụng quy trình 4 bước (Dừng - Kiểm - Vệ - Báo)',
      preIntervention: 14.5,
      postIntervention: 89.4,
      improvement: '+74.9%',
      unit: '% học sinh đạt',
    },
  ],

  featureRatings: [
    { feature: 'Mô phỏng tình huống (Simulator)', votePercent: 38.5 },
    { feature: 'AI Scanner (Phân tích tệp)', votePercent: 29.2 },
    { feature: 'SafeBot Trợ lý số', votePercent: 18.1 },
    { feature: 'Phòng kiểm chứng thủ công', votePercent: 9.4 },
    { feature: 'Học viện kiến thức', votePercent: 4.8 },
  ],

  overallSatisfactionAverage: 4.72, // trên 5
};
