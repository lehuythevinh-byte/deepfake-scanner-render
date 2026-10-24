# PROMPT CHI TIẾT — NÂNG CẤP DEEPFAKE SCANNER: TRUNG TÂM AN TOÀN SỐ

Bạn là một kỹ sư full-stack cấp cao, chuyên gia AI ứng dụng, an toàn thông tin, UX/UI và kiểm thử phần mềm giáo dục. Hãy làm việc trực tiếp trên toàn bộ repository **DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ** hiện có. Đây là sản phẩm giáo dục/STEM tiếng Việt dành cho học sinh THCS, phụ huynh và giáo viên, giúp nhận diện dấu hiệu lừa đảo, mạo danh và nội dung nghi là deepfake.

## A. Mục tiêu tổng thể

Hãy biến source hiện tại thành một ứng dụng rõ ràng, ổn định, dễ sử dụng, có thể build và deploy, đồng thời **trung thực về năng lực AI**. Không chỉ viết kế hoạch hay bản demo: đọc source, sửa trực tiếp các tệp, kết nối các luồng giao diện với API đang có, chạy kiểm tra, sửa tiếp các lỗi phát hiện được và bàn giao đầy đủ source.

Không viết lại toàn bộ dự án từ đầu nếu có thể sửa có mục tiêu. Giữ các phân hệ và dữ liệu hợp lệ đang có. Trước khi sửa, lập sơ đồ cấu trúc dự án và xác định component, type, API, route và CSS liên quan để tránh phá vỡ chức năng cũ.

## B. Công nghệ và các tệp nền tảng

- Frontend: React, TypeScript, Tailwind CSS, Lucide React.
- Dev server/build: Vite.
- Backend API: Express + TypeScript runtime `tsx`.
- AI: Google GenAI SDK, dùng model cấu hình qua biến môi trường `GEMINI_MODEL` và API key phía server.
- Các điểm cần kiểm tra: `package.json`, `tsconfig.json`, `vite.config.ts`, `server.ts`, `src/App.tsx`, các component trong `src/components/`, `src/data/`, `src/types/`, `README.md`, `netlify.toml`, `render.yaml`.
- Không đưa API key vào code frontend, localStorage, source map, URL hoặc repository.

## C. Các lỗi đã biết cần giữ trạng thái đã sửa và kiểm tra hồi quy

1. Đồng bộ Vite/esbuild và các dependency để cài đặt không phát sinh `ERESOLVE`; giữ `tsx` ở dependencies nếu lệnh production `npm start` cần nó.
2. Vite config là ESM, không dùng `__dirname` theo cách CommonJS.
3. Schema phản hồi JSON của Gemini phải hợp lệ, đặc biệt `sourcesAndEvidence.analyzedLinks` không được lồng lặp.
4. Khi API key/model/quota/mạng có lỗi, kết quả dự phòng phải ghi rõ chỉ sàng lọc heuristic văn bản. Không bịa nhận xét về pixel, mắt, ánh sáng, viền mặt hoặc âm thanh.
5. Không kết luận ảnh thật/giả chỉ từ một heuristic; phải hỗ trợ trạng thái `inconclusive`.
6. Không tự gắn cảnh báo chỉ vì người dùng chọn chế độ quét bài đăng. Từ “gấp/khẩn cấp” đứng riêng không đủ kết luận lừa đảo.
7. Phân biệt dữ liệu minh họa N=320 với dữ liệu khảo sát thật. Không cho form trả lời sẵn rồi vô tình ghi thành dữ liệu hợp lệ. CSV và báo cáo phải có nhãn nguồn dữ liệu.
8. Giới hạn đầu vào phải nhất quán ở giao diện và server; xử lý MIME type, base64, dữ liệu rỗng, JSON lỗi và request quá lớn.
9. Backend Express và frontend tĩnh phải được triển khai theo cấu hình đúng; không trỏ `/api/*` tới Functions không tồn tại.

## D. Chức năng cần hoàn thiện

### D1. Social Threat Scanner — trung tâm quét

Có ba chế độ độc lập, giao diện chuyển chế độ dễ hiểu:

- **Quét ảnh:** tải ảnh lên hoặc kéo-thả; hỗ trợ PNG/JPEG/WEBP; hiển thị xem trước, tên tệp, kích thước, trạng thái upload, nút xóa và thay ảnh. Xử lý ảnh lỗi, ảnh quá lớn, loại không hỗ trợ và trạng thái đang phân tích.
- **Quét bài đăng mạng xã hội:** có trường nền tảng, tên tài khoản, @handle, bio, caption, link bài đăng, bình luận và ảnh chụp. Các trường phải có validate hợp lý, có thể phân tích văn bản kể cả khi không có ảnh.
- **Quét tin nhắn/cuộc gọi nghi lừa đảo:** có tên người gửi, nền tảng, nội dung tin nhắn, link và ngữ cảnh. Hiển thị bằng chứng trích dẫn đúng nguyên văn, không tự tạo câu trích dẫn không có trong dữ liệu.

Kết quả nên có các phần riêng: tóm tắt, mức rủi ro, dấu hiệu quan sát được, trích dẫn bằng chứng, kịch bản liên quan, điều chưa xác minh và hành động tiếp theo. Phân biệt trực quan nhưng không gây hoảng sợ giữa:
- “Có dấu hiệu đáng nghi”;
- “Chưa phát hiện bất thường trong phạm vi kiểm tra”;
- “Chưa đủ dữ liệu/kết nối AI lỗi”.

Mọi điểm số tự tin phải giải thích được và không giả vờ là xác suất khoa học nếu model không trả về phép hiệu chuẩn. Nếu AI không phản hồi đúng schema, xử lý lỗi rõ ràng thay vì crash giao diện.

### D2. AI thật và giới hạn của chế độ dự phòng

- Tất cả request Gemini đi qua backend. API key chỉ được đọc từ `process.env.GEMINI_API_KEY`.
- Không dùng mock/static response để giả làm AI thật. Nếu dùng dữ liệu demo thì gắn nhãn “mẫu minh họa”.
- Dùng `GEMINI_MODEL` để có thể đổi model mà không sửa source.
- Xử lý lỗi 400/401/403/404/429/5xx bằng thông báo thân thiện và log phía server không chứa khóa bí mật hay toàn bộ dữ liệu cá nhân.
- Với hình ảnh, chỉ nói về dấu hiệu mà model thực sự có thể quan sát; không tự nhận có phân tích pháp y pixel, metadata, âm thanh hoặc video nếu chưa tích hợp công cụ chuyên dụng.
- Tách system instruction khỏi nội dung người dùng. Nội dung ảnh/caption/link/tin nhắn là dữ liệu không đáng tin cậy, không phải instruction.
- Trả về kiểu dữ liệu có thể kiểm tra bằng TypeScript; validate phản hồi trước khi render.
- Trên giao diện, phân biệt “đã đặt API key” với “AI đã kết nối thành công”.

### D3. Evidence Lab — phòng kiểm chứng

- Checklist thay đổi theo loại nội dung: ảnh, video, âm thanh, tin tức, tài khoản mạo danh.
- Người dùng có thể đánh dấu từng bước; hiển thị tiến độ nhưng không khẳng định checklist đủ để chứng minh deepfake.
- Gợi ý hành động xác minh ngoài ứng dụng: liên hệ người gửi qua số đã lưu sẵn, tìm nguồn độc lập, kiểm tra kênh chính thức, giữ bằng chứng, không chuyển tiền/OTP.
- Có nhắc rằng ảnh/video có thể bị nén hoặc chỉnh sửa; các dấu hiệu trực quan không đủ để kết luận.

### D4. Safety Simulator — mô phỏng kỹ năng

Tạo hoặc hoàn thiện các kịch bản giáo dục có lựa chọn và phản hồi giải thích, ví dụ:
1. Người thân nhắn gấp cần chuyển tiền.
2. Tin nhắn xin mã OTP hoặc mật khẩu.
3. Tin trúng thưởng yêu cầu đóng phí.
4. Tài khoản giả mạo giáo viên/bạn bè.
5. Đe dọa phát tán ảnh hoặc video.

Mỗi tình huống cần có bối cảnh, 2–4 lựa chọn, phản hồi sau lựa chọn, lý do an toàn/rủi ro và bài học ngắn. Không có lựa chọn nào chế giễu hoặc đổ lỗi cho nạn nhân. Có nút chơi lại và hiển thị tiến độ.

### D5. SafeBot AI

- Hỗ trợ hỏi đáp bằng tiếng Việt dễ hiểu cho học sinh THCS, câu trả lời có cấu trúc, ngắn gọn và có bước hành động.
- Hạn chế độ dài hội thoại gửi server, lọc schema, hiển thị loading/error/retry và trạng thái fallback.
- Với tình huống tống tiền, bắt nạt, nguy cơ trực tiếp hoặc chia sẻ ảnh riêng tư, trả lời bình tĩnh, khẳng định học sinh không có lỗi khi bị đe dọa, khuyến khích lưu bằng chứng và báo ngay cho người lớn đáng tin cậy. Không yêu cầu người dùng tải ảnh nhạy cảm lên hệ thống.
- Không tự nhận là cơ quan điều tra, luật sư hoặc chuyên gia tâm lý lâm sàng. Các số điện thoại/tổ chức hỗ trợ phải được kiểm tra chính xác trước khi đưa vào bản release.

### D6. Research Dashboard và báo cáo STEM

- Tách rõ: dữ liệu minh họa, dữ liệu người dùng gửi cục bộ, và dữ liệu nghiên cứu đã thu thập hợp lệ.
- Mặc định không điền sẵn câu trả lời khảo sát. Báo thiếu câu bắt buộc; cho biết việc gửi phiếu lưu ở đâu.
- Nếu dữ liệu chỉ nằm trong localStorage trên trình duyệt, ghi rõ “chỉ lưu trên thiết bị này/chưa đồng bộ về máy chủ”.
- Xuất CSV có tiêu đề cột rõ, UTF-8 BOM, escape dấu phẩy/dấu nháy/xuống dòng đúng, và ghi nhãn nguồn/loại dữ liệu.
- Không tự dựng số liệu thực nghiệm trước-sau. Cần ghi: mục tiêu, cỡ mẫu, thời gian, trường/đối tượng, cách chọn mẫu, câu hỏi, cách chấm điểm, dữ liệu thiếu, giới hạn nghiên cứu. Chỉ tính phần trăm từ dữ liệu thực sự được nhập.
- Báo cáo nghiên cứu chỉ được diễn giải số đã xác minh; ví dụ demo phải có nhãn nổi bật “minh họa, không phải kết quả khảo sát thật”.

## E. UX/UI và thiết kế trực quan

Giữ phong cách hiện đại, chất lượng cao, phù hợp một dự án khoa học công nghệ cho học sinh:

- Theme an toàn số: nền navy/slate tối có tương phản cao, cyan làm màu nhấn, màu cảnh báo vàng/đỏ chỉ dùng khi đúng trạng thái. Hạn chế gradient, glow và hiệu ứng gây rối.
- Typography tiếng Việt dễ đọc; tiêu đề, nhãn trường, hướng dẫn, báo lỗi và nội dung kết quả có phân cấp rõ ràng.
- Layout ưu tiên quy trình tác vụ: chọn chế độ → nhập/tải nội dung → phân tích → đọc bằng chứng → hành động tiếp theo.
- Tương thích desktop, tablet và mobile; không tràn ngang; vùng bấm đủ lớn; mọi modal/tabpanel có thể thao tác bằng bàn phím.
- Có trạng thái loading, empty, error, success, disabled, retry và fallback nhất quán.
- Đảm bảo accessibility cơ bản: label gắn đúng input, alt cho ảnh, aria-live cho trạng thái, focus ring, màu tương phản và không chỉ dùng màu để truyền đạt rủi ro.
- Không thêm animation nặng hoặc biểu đồ giả. Tránh card trùng lặp và thanh điều hướng quá nhiều chức năng; ưu tiên thông tin cần ra quyết định.
- Giữ nội dung Việt ngữ tự nhiên, thống nhất thuật ngữ “deepfake”, “mạo danh”, “chưa xác minh”. Không để các chuỗi lỗi kỹ thuật/JSON/code xuất hiện trong câu trả lời AI cho người dùng.

## F. Bảo mật và riêng tư

- Thêm xác thực loại/dung lượng payload cả client và server; giới hạn số lượng request hoặc đề xuất chiến lược rate-limit phù hợp nếu có thể triển khai trong stack hiện tại.
- Không log API key, nội dung tin nhắn riêng tư, base64 ảnh hay response thô chứa thông tin cá nhân ở production.
- Bảo đảm `.env` bị ignore bởi Git; chỉ commit `.env.example` với giá trị giả.
- Nêu minh bạch khi ảnh/văn bản được gửi tới nhà cung cấp AI. Không khẳng định dữ liệu “không được lưu” nếu chưa xác minh chính sách nhà cung cấp.
- Không tự động tải link người dùng cung cấp về backend để mở/duyệt URL. Nếu tích hợp kiểm tra URL trong tương lai, cần thiết kế chống SSRF, redirect độc hại, DNS rebinding và private IP; mặc định chỉ phân tích chuỗi URL cho tới khi có cơ chế an toàn.
- Không lưu ảnh/tin nhắn lịch sử mặc định. Nếu thêm scan history, phải là opt-in, có nút xóa và mô tả nơi lưu.

## G. Kiến trúc và chất lượng code

- Giữ type chung cho payload và response API; gom constants (giới hạn file, MIME types, scan modes, status enum) để frontend/server không lệch nhau nếu có cách chia sẻ an toàn.
- Tách validator, prompt builder, fallback heuristics và route logic thành module khi điều đó làm code dễ kiểm tra hơn; tránh tạo cấu trúc thừa.
- Không để `any` lan tràn; dùng type guard cho phản hồi AI và đầu vào API.
- Xử lý lỗi API theo cấu trúc `{ error, message }`; không trả stack trace cho client.
- Không đổi package sang phiên bản “latest” bừa bãi. Giữ lockfile nếu đã có, kiểm tra tương thích và tránh cập nhật toàn bộ thư viện không cần thiết.
- Tổ chức script kiểm tra rõ: `lint`/typecheck, `build`, và test. Không ghi rằng test đã pass nếu chưa thực sự chạy.
- Nếu thư viện chưa cài do mất mạng, ghi rõ test bị chặn và đưa ra các bước kiểm tra trên máy có mạng.

## H. Các tính năng nâng cấp có thể làm theo thứ tự

### P0 — phải ổn định trước
- Build/lint sạch; kiểm tra schema AI; validation ảnh/văn bản; trạng thái lỗi; biến môi trường; deploy end-to-end.
- Bộ test cho dữ liệu rỗng, file sai MIME, ảnh quá lớn, JSON sai, thiếu API key, API quota, model không tồn tại, phản hồi AI JSON hỏng.
- Kiểm tra trên trình duyệt desktop và mobile.

### P1 — tăng chất lượng trải nghiệm
- Kết quả có thể thu gọn/mở rộng, từng bằng chứng liên kết với gợi ý hành động.
- Nút sao chép báo cáo, tải JSON/CSV có nguồn dữ liệu rõ ràng, in báo cáo thân thiện.
- Bộ demo an toàn gồm ảnh giả lập không nhạy cảm, tin nhắn ví dụ và bài test để so sánh cách dùng app; ghi rõ chúng không dùng để đánh giá độ chính xác khoa học.
- Hướng dẫn “làm gì tiếp theo” được cá nhân hóa theo loại rủi ro nhưng không thay thế xác minh ngoài đời.

### P2 — cải tiến nâng cao nếu có nguồn dữ liệu/công cụ phù hợp
- Phân tích video bằng cách trích xuất khung hình ở client hoặc worker có kiểm soát; công bố rõ chỉ phân tích mẫu khung hình chứ không phải forensic toàn video.
- Hỗ trợ âm thanh bằng mô hình/chuyên dụng riêng, kèm hạn chế rõ ràng; không chỉ dùng transcript để tuyên bố giọng giả.
- Phân tích nguồn xuất xứ/provenance (ví dụ metadata hoặc C2PA khi có dữ liệu hợp lệ) như một tín hiệu phụ, không phải bằng chứng tuyệt đối.
- URL reputation qua dịch vụ uy tín chỉ khi có API, điều khoản và bảo mật phù hợp; nói rõ có gửi URL sang bên thứ ba.
- Trang giáo viên có bài học/quiz và phân tích tổng hợp theo nhóm, tránh thu thập tên thật hay thông tin định danh học sinh nếu không cần.

## I. Kiểm thử bắt buộc và tiêu chí nghiệm thu

Trước khi kết thúc, thực hiện các bước khả thi trong môi trường hiện tại:

1. Chạy `npm install` hoặc `npm ci` nếu có lockfile.
2. Chạy `npm run lint` (hoặc typecheck tương đương); sửa hết lỗi liên quan đến source.
3. Chạy `npm run build`.
4. Chạy app và thử `/api/health`, `/api/scan`, `/api/chat`.
5. Kiểm thử 3 chế độ quét, ảnh hợp lệ, ảnh quá lớn, MIME sai, văn bản rỗng, text quá dài, thiếu API key, Gemini trả lỗi, JSON phản hồi sai schema.
6. Kiểm thử survey chưa điền đủ, survey đủ câu, reset dữ liệu, export CSV tiếng Việt và label dataset minh họa.
7. Xem lại các màn hình mobile/desktop để tìm overflow, button không hoạt động, tab sai route, loading kẹt và chuỗi lỗi hiển thị.
8. Kiểm tra `git status`, loại bỏ `.env`, log, node_modules, dist và file tạm khỏi gói source nếu không cần.

Chỉ được ghi “đã build thành công” khi `npm run build` thực sự chạy và thoát mã 0. Nếu không thể tải package hoặc thiếu credentials, nêu chính xác bước nào bị chặn, không giả vờ đã test thành công.

## J. Tài liệu và bàn giao

Bàn giao đầy đủ:
1. Source code đã sửa, không chỉ snippet minh họa.
2. `README.md` có lệnh cài/chạy/build và hướng dẫn deploy.
3. `.env.example` không chứa khóa thật.
4. Tài liệu `CHANGELOG_FIXES.md` nêu thay đổi, lỗi đã sửa và giới hạn kiểm thử.
5. Tài liệu này có thể dùng như roadmap cho những lần nâng cấp tiếp theo.
6. ZIP toàn bộ source để tải lên GitHub; loại trừ `node_modules`, `.git`, `.env` và artifacts build nếu phù hợp.
7. Báo cáo cuối gồm: tệp đã sửa, lỗi đã giải quyết, kết quả kiểm tra thật sự chạy được, vấn đề còn lại và hướng dẫn chạy từng bước.

## K. Nguyên tắc không được vi phạm

- Không bịa kết quả khảo sát, độ chính xác mô hình, số người dùng hay tỷ lệ phát hiện.
- Không trình bày heuristic từ khóa như deepfake detector thực thụ.
- Không gắn nhãn nội dung là “giả” chỉ dựa trên phong cách, lỗi chính tả, một từ khóa hoặc một bất thường đơn lẻ.
- Không lưu hoặc gửi nội dung nhạy cảm không cần thiết.
- Không xóa chức năng hiện có nếu chưa chứng minh nó lỗi hoặc không phù hợp; ưu tiên sửa nhỏ, có kiểm thử hồi quy.
- Không chỉ dừng ở ý tưởng. Hãy trực tiếp chỉnh code, kiểm tra và đóng gói kết quả.

**Bắt đầu bằng cách đọc toàn bộ cấu trúc source và `CHANGELOG_FIXES.md`, kiểm tra những bản vá đã có, rồi tiếp tục từ trạng thái hiện tại. Không hỏi lại người dùng các chi tiết đã có trong repository.**
