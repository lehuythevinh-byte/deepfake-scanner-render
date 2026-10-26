import React, { useCallback, useEffect, useState } from 'react';
import { Eye, LayoutTemplate, Palette, RotateCcw, Save, Settings2, Type, RefreshCw } from 'lucide-react';
import { DEFAULT_SITE_CONFIG, SITE_CONFIG_TEXT_LIMITS, SiteConfig } from '../lib/siteConfig';

const fieldClass = 'mt-1 block w-full rounded-lg border border-[#35506d] bg-[#0e1a2d] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50';
const panelClass = 'rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden';
const headingClass = 'text-base font-bold text-white flex items-center gap-2';

async function readJson(response: Response): Promise<any> {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw new Error(response.status === 404
      ? 'Render chưa có API cấu hình website mới. Hãy deploy phiên bản code mới trước.'
      : `Máy chủ không trả JSON (HTTP ${response.status}).`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) throw new Error(body.message || `Yêu cầu thất bại (${response.status}).`);
  return body;
}

export const SiteCustomizerAdminPanel: React.FC = () => {
  const [draft, setDraft] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [savedDraft, setSavedDraft] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setNotice(null);
    try {
      const response = await fetch('/api/admin/site-config', { credentials: 'same-origin', cache: 'no-store' });
      const body = await readJson(response);
      const config = { ...DEFAULT_SITE_CONFIG, ...(body.config || {}) } as SiteConfig;
      setDraft(config); setSavedDraft(config);
    } catch (e: any) {
      setError(e?.message || 'Không tải được cấu hình website.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice(null);
  };

  const save = async () => {
    setSaving(true); setError(null); setNotice(null);
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: draft }),
      });
      const body = await readJson(response);
      const config = { ...DEFAULT_SITE_CONFIG, ...(body.config || draft) } as SiteConfig;
      setDraft(config); setSavedDraft(config);
      window.dispatchEvent(new CustomEvent('df-site-config-updated', { detail: config }));
      setNotice('Đã lưu cấu hình vào PostgreSQL. Nội dung trang chủ đã cập nhật ngay trên trình duyệt này.');
    } catch (e: any) {
      setError(e?.message || 'Không lưu được cấu hình.');
    } finally { setSaving(false); }
  };

  const reset = async () => {
    if (!window.confirm('Khôi phục toàn bộ nội dung, màu sắc và phần hiển thị về mặc định? Thao tác này sẽ lưu cấu hình mới lên website.')) return;
    setDraft(DEFAULT_SITE_CONFIG);
    setSaving(true); setError(null); setNotice(null);
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: DEFAULT_SITE_CONFIG }),
      });
      const body = await readJson(response);
      const config = { ...DEFAULT_SITE_CONFIG, ...(body.config || {}) } as SiteConfig;
      setDraft(config); setSavedDraft(config);
      window.dispatchEvent(new CustomEvent('df-site-config-updated', { detail: config }));
      setNotice('Đã khôi phục cấu hình mặc định.');
    } catch (e: any) { setError(e?.message || 'Không khôi phục được cấu hình.'); }
    finally { setSaving(false); }
  };

  const field = (key: keyof SiteConfig, label: string, hint?: string, multiline = false) => {
    const value = String(draft[key] ?? '');
    const maxLength = SITE_CONFIG_TEXT_LIMITS[key];
    return <label key={key} className="block text-sm text-slate-300">{label}
      {multiline ? <textarea value={value} maxLength={maxLength} rows={3} onChange={(e) => update(key, e.target.value as SiteConfig[typeof key])} className={`${fieldClass} resize-y`} /> :
        <input value={value} maxLength={maxLength} onChange={(e) => update(key, e.target.value as SiteConfig[typeof key])} className={fieldClass} />}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}{maxLength ? ` · tối đa ${maxLength} ký tự` : ''}</span>}
    </label>;
  };

  const toggle = (key: keyof SiteConfig, label: string, detail: string) => (
    <label key={key} className="flex items-start gap-3 rounded-xl border border-[#243956] bg-[#0e1a2d] p-3 cursor-pointer">
      <input type="checkbox" checked={Boolean(draft[key])} onChange={(e) => update(key, e.target.checked as SiteConfig[typeof key])} className="mt-1 h-4 w-4 accent-cyan-400" />
      <span><span className="block text-sm font-medium text-slate-100">{label}</span><span className="mt-0.5 block text-xs text-slate-500">{detail}</span></span>
    </label>
  );

  return (
    <section className={panelClass} aria-labelledby="site-customizer-heading">
      <div className="border-b border-[#243956] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="site-customizer-heading" className={headingClass}><LayoutTemplate className="w-5 h-5 text-[#55DDF2]" /> Chỉnh sửa website không cần sửa code</h2>
          <p className="mt-1 text-xs text-slate-400">Đổi nội dung trang chủ, tên thương hiệu, màu chủ đạo, thông báo và ẩn/hiện các khu vực. Cấu hình được lưu trong PostgreSQL.</p>
        </div>
        <button onClick={() => void load()} disabled={loading || saving} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại</button>
      </div>

      {error && <div role="alert" className="m-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}
      {notice && <div role="status" className="m-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</div>}

      {loading ? <div className="p-8 text-center text-sm text-slate-400"><RefreshCw className="mr-2 inline h-4 w-4 animate-spin" />Đang tải cấu hình…</div> : (
        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#243956] p-4 space-y-4">
              <h3 className={headingClass}><Type className="h-4 w-4 text-[#55DDF2]" /> Thương hiệu & thông báo</h3>
              {field('siteName', 'Tên website', 'Hiện ở thanh điều hướng và chân trang')}
              {field('brandSubtitle', 'Dòng mô tả thương hiệu')}
              <div className="grid sm:grid-cols-[auto_1fr] items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={draft.announcementEnabled} onChange={(e) => update('announcementEnabled', e.target.checked)} className="h-4 w-4 accent-cyan-400" /> Bật thông báo</label>
                <span className="text-xs text-slate-500">Hiện thông báo ở đầu trang chủ</span>
              </div>
              {field('announcementText', 'Nội dung thông báo', 'Chỉ hiển thị dạng văn bản, không chạy HTML/script', true)}
            </div>

            <div className="rounded-xl border border-[#243956] p-4 space-y-4">
              <h3 className={headingClass}><Palette className="h-4 w-4 text-[#55DDF2]" /> Giao diện & màu sắc</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm text-slate-300">Màu nhấn chính<div className="mt-2 flex items-center gap-3"><input type="color" value={draft.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="h-11 w-16 rounded border border-[#35506d] bg-transparent p-1" /><code className="text-sm text-slate-200">{draft.accentColor}</code></div><span className="mt-1 block text-xs text-slate-500">Màu nút chính và các điểm nhấn</span></label>
                <label className="block text-sm text-slate-300">Màu nền website<div className="mt-2 flex items-center gap-3"><input type="color" value={draft.backgroundColor} onChange={(e) => update('backgroundColor', e.target.value)} className="h-11 w-16 rounded border border-[#35506d] bg-transparent p-1" /><code className="text-sm text-slate-200">{draft.backgroundColor}</code></div><span className="mt-1 block text-xs text-slate-500">Màu nền chính</span></label>
              </div>
              <div className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: draft.backgroundColor }}>
                <div className="text-xs font-semibold tracking-widest" style={{ color: draft.accentColor }}>{draft.heroEyebrow || 'Tiêu đề phụ'}</div>
                <div className="mt-2 text-xl font-extrabold text-white">{draft.heroTitle}</div>
                <div className="text-xl font-extrabold" style={{ color: draft.accentColor }}>{draft.heroAccentTitle}</div>
                <p className="mt-2 text-sm text-slate-300">{draft.heroDescription}</p>
                <span className="mt-3 inline-block rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: draft.accentColor, color: '#06101d' }}>{draft.primaryCtaLabel}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#243956] p-4 space-y-4">
            <h3 className={headingClass}><Settings2 className="h-4 w-4 text-[#55DDF2]" /> Nội dung trang chủ</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              {field('heroEyebrow', 'Dòng chữ nhỏ phía trên tiêu đề')}
              {field('heroTitle', 'Tiêu đề chính — dòng 1')}
              {field('heroAccentTitle', 'Tiêu đề nhấn — dòng 2')}
              {field('heroDescription', 'Mô tả dưới tiêu đề', undefined, true)}
              {field('primaryCtaLabel', 'Nhãn nút chính')}
              {field('secondaryCtaLabel', 'Nhãn nút phụ')}
              {field('aboutEyebrow', 'Nhãn phần giới thiệu')}
              {field('aboutTitle', 'Tiêu đề phần giới thiệu')}
              {field('aboutDescription', 'Mô tả phần giới thiệu', undefined, true)}
            </div>
          </div>

          <div className="rounded-xl border border-[#243956] p-4 space-y-4">
            <h3 className={headingClass}><Settings2 className="h-4 w-4 text-[#55DDF2]" /> Thẻ giới thiệu & chức năng nổi bật</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              {field('introCard1Title', 'Thẻ giới thiệu 1 — tiêu đề')}
              {field('introCard1Description', 'Thẻ giới thiệu 1 — mô tả', undefined, true)}
              {field('introCard2Title', 'Thẻ giới thiệu 2 — tiêu đề')}
              {field('introCard2Description', 'Thẻ giới thiệu 2 — mô tả', undefined, true)}
              {field('introCard3Title', 'Thẻ giới thiệu 3 — tiêu đề')}
              {field('introCard3Description', 'Thẻ giới thiệu 3 — mô tả', undefined, true)}
              {field('featuresEyebrow', 'Nhãn nhỏ của phần tính năng')}
              {field('featuresTitle', 'Tiêu đề phần tính năng')}
              {field('featuresDescription', 'Mô tả phần tính năng', undefined, true)}
              {field('feature1Title', 'AI Scanner — tiêu đề')}
              {field('feature1Description', 'AI Scanner — mô tả', undefined, true)}
              {field('feature1ActionLabel', 'AI Scanner — nhãn nút')}
              {field('feature2Title', 'Link Scanner — tiêu đề')}
              {field('feature2Description', 'Link Scanner — mô tả', undefined, true)}
              {field('feature2ActionLabel', 'Link Scanner — nhãn nút')}
              {field('feature3Title', 'SafeBot — tiêu đề')}
              {field('feature3Description', 'SafeBot — mô tả', undefined, true)}
              {field('feature3ActionLabel', 'SafeBot — nhãn nút')}
            </div>
          </div>

          <div className="rounded-xl border border-[#243956] p-4 space-y-4">
            <h3 className={headingClass}><Type className="h-4 w-4 text-[#55DDF2]" /> Câu hỏi thường gặp (FAQ)</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              {field('faqTitle', 'Tiêu đề FAQ')}
              {field('faqDescription', 'Mô tả FAQ', undefined, true)}
              {field('faqQ1', 'Câu hỏi 1')}{field('faqA1', 'Trả lời 1', undefined, true)}
              {field('faqQ2', 'Câu hỏi 2')}{field('faqA2', 'Trả lời 2', undefined, true)}
              {field('faqQ3', 'Câu hỏi 3')}{field('faqA3', 'Trả lời 3', undefined, true)}
              {field('faqQ4', 'Câu hỏi 4')}{field('faqA4', 'Trả lời 4', undefined, true)}
            </div>
          </div>

          <div className="rounded-xl border border-[#243956] p-4 space-y-3">
            <h3 className={headingClass}><Eye className="h-4 w-4 text-[#55DDF2]" /> Ẩn hoặc hiện phần trang chủ</h3>
            <p className="text-xs text-slate-500">Bỏ dấu tích để ẩn khu vực tương ứng khỏi trang chủ. Không làm mất dữ liệu và có thể bật lại bất kỳ lúc nào.</p>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {toggle('showHero', 'Khu vực mở đầu (Hero)', 'Tiêu đề lớn, mô tả và nút bắt đầu')}
              {toggle('showAbout', 'Giới thiệu', 'Mục tiêu và mô tả dự án')}
              {toggle('showFeatures', 'Các chức năng nổi bật', 'Những công cụ và khả năng chính')}
              {toggle('showAiLimitations', 'Giới hạn của AI', 'Nội dung minh bạch về độ chính xác AI')}
              {toggle('showHowItWorks', 'Cách sử dụng', 'Quy trình sử dụng theo từng bước')}
              {toggle('showSafetyGuide', 'Cẩm nang an toàn', 'Hướng dẫn xử lý khi nghi ngờ deepfake')}
              {toggle('showPrivacy', 'Cam kết quyền riêng tư', 'Thông tin về dữ liệu và bảo mật')}
              {toggle('showFaq', 'Câu hỏi thường gặp', 'Các câu hỏi và câu trả lời trên trang chủ')}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#243956] pt-4">
            <button onClick={() => setPreview((v) => !v)} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-4 py-2.5 text-sm text-slate-200 hover:bg-[#172941]"><Eye className="h-4 w-4" />{preview ? 'Ẩn xem trước' : 'Xem trước nội dung'}</button>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void reset()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-400/10 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Khôi phục mặc định</button>
              <button onClick={() => void save()} disabled={saving || (JSON.stringify(draft) === JSON.stringify(savedDraft))} className="inline-flex items-center gap-2 rounded-lg bg-[#55DDF2] px-5 py-2.5 text-sm font-bold text-[#06101d] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">{saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
            </div>
          </div>
          {preview && <div className="rounded-2xl border border-[#35506d] overflow-hidden" style={{ backgroundColor: draft.backgroundColor }}><div className="p-6 sm:p-10 text-center"><div className="text-xs font-bold tracking-[0.25em]" style={{ color: draft.accentColor }}>{draft.heroEyebrow}</div><h3 className="mt-4 text-3xl font-extrabold text-white">{draft.heroTitle}<br /><span style={{ color: draft.accentColor }}>{draft.heroAccentTitle}</span></h3><p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300">{draft.heroDescription}</p><div className="mt-5 flex justify-center gap-2"><span className="rounded-lg px-4 py-2 text-sm font-bold" style={{ color: '#06101d', backgroundColor: draft.accentColor }}>{draft.primaryCtaLabel}</span>{draft.secondaryCtaLabel && <span className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white">{draft.secondaryCtaLabel}</span>}</div></div></div>}
          <p className="text-[11px] text-slate-500">Lưu ý: cấu hình quản trị thay đổi nội dung và hiển thị trang chủ; không thay thế các biện pháp bảo mật backend và không cho phép chỉnh sửa mã JavaScript/HTML từ trình duyệt.</p>
        </div>
      )}
    </section>
  );
};
