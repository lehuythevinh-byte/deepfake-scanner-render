import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, AuthUser } from '../types';

interface ScanItem {
  id: string;
  scanMode: string;
  engine: string;
  model: string | null;
  durationMs: number;
  createdAt: string;
  reportId: string;
  status: string;
  riskLevel: string;
  summaryLabel: string;
  fileName: string;
}

interface HistoryModuleProps {
  user: AuthUser | null;
  onTabChange: (tab: ActiveTab) => void;
}

export const HistoryModule: React.FC<HistoryModuleProps> = ({ user, onTabChange }) => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const modeParam = selectedMode !== 'all' ? `?mode=${encodeURIComponent(selectedMode)}` : '';
      const res = await fetch(`/api/auth/scans${modeParam}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể tải lịch sử quét');
      }
      setScans(Array.isArray(data.scans) ? data.scans : []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử quét.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedMode]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi lịch sử quét này?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/auth/scans/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi xóa');
      }
      setScans((prev) => prev.filter((s) => s.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err: any) {
      alert(err.message || 'Không thể xóa bản ghi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = () => {
    if (scans.length === 0) return;
    const headers = ['Mã lượt quét', 'Chế độ quét', 'Tệp / Liên kết', 'Động cơ', 'Mô hình', 'Mức độ rủi ro', 'Thời gian xử lý (ms)', 'Thời điểm'];
    const rows = scans.map((s) => [
      s.reportId,
      s.scanMode,
      s.fileName,
      s.engine,
      s.model || 'N/A',
      s.riskLevel,
      s.durationMs,
      new Date(s.createdAt).toLocaleString('vi-VN'),
    ]);
    const csvContent = '\uFEFF' + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan_history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredScans = scans.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.reportId.toLowerCase().includes(q) ||
      s.fileName.toLowerCase().includes(q) ||
      s.summaryLabel.toLowerCase().includes(q)
    );
  });

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'image':
        return 'Ảnh thị giác';
      case 'video_frame':
        return 'Khung hình video';
      case 'social_post':
        return 'Bài đăng MXH';
      case 'message_scam':
        return 'Tin nhắn lừa đảo';
      case 'link_scan':
        return 'Quét liên kết';
      default:
        return mode;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'dangerous':
      case 'suspicious':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Đáng ngờ / Nguy cơ
          </span>
        );
      case 'safe':
      case 'no_obvious_anomalies':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Chưa thấy bất thường
          </span>
        );
      case 'inconclusive':
      case 'insufficient_data':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Cần đối chiếu thêm
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Yêu Cầu Đăng Nhập Để Xem Lịch Sử</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Lịch sử quét được bảo vệ nghiêm ngặt theo tài khoản cá nhân và chỉ người dùng sở hữu mới có quyền truy cập.
        </p>
        <button
          onClick={() => {
            onTabChange('history'); // router sends signed-out users to /login?next=/app/history
          }}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-2">
            NHẬT KÝ KIỂM TRA AN TOÀN SỐ
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lịch Sử Quét Của Bạn</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chỉ lưu trữ siêu dữ liệu kỹ thuật và mã lượt quét. Không lưu trữ ảnh hoặc video riêng tư của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </button>
          <button
            onClick={handleExportCsv}
            disabled={scans.length === 0}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#142036] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'image', label: 'Ảnh' },
            { id: 'video_frame', label: 'Video' },
            { id: 'social_post', label: 'Bài đăng' },
            { id: 'message_scam', label: 'Tin nhắn' },
            { id: 'link_scan', label: 'Liên kết' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedMode === mode.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã hoặc tên tệp..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0d1626] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* History List Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải lịch sử quét...
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="p-12 bg-[#142036] rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="text-slate-500 text-sm">Chưa có bản ghi quét nào phù hợp tiêu chí.</div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onTabChange('scanner')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Quét ảnh / video ngay
            </button>
            <button
              onClick={() => onTabChange('link-scanner')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Quét liên kết
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="p-4 bg-[#142036] hover:bg-[#17253e] rounded-xl border border-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-400">{scan.reportId}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {getModeLabel(scan.scanMode)}
                  </span>
                  {getRiskBadge(scan.riskLevel)}
                </div>
                <div className="text-sm font-semibold text-white truncate max-w-md">
                  {scan.fileName}
                </div>
                {scan.summaryLabel && (
                  <p className="text-xs text-slate-400 line-clamp-1">{scan.summaryLabel}</p>
                )}
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>{new Date(scan.createdAt).toLocaleString('vi-VN')}</span>
                  <span>•</span>
                  <span>Thời gian: {scan.durationMs}ms</span>
                  <span>•</span>
                  <span>Động cơ: {scan.engine} {scan.model ? `(${scan.model})` : ''}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedScan(scan)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  Chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(scan.id)}
                  disabled={deletingId === scan.id}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  title="Xóa bản ghi"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#142036] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Chi Tiết Lượt Quét</h3>
              <button
                onClick={() => setSelectedScan(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase">Mã lượt quét</div>
                <div className="font-mono text-sm font-bold text-blue-400">{selectedScan.reportId}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#0d1626] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Chế độ</div>
                  <div className="font-semibold text-white mt-0.5">{getModeLabel(selectedScan.scanMode)}</div>
                </div>
                <div className="p-2.5 bg-[#0d1626] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Trạng thái rủi ro</div>
                  <div className="font-semibold text-white mt-0.5">{selectedScan.riskLevel}</div>
                </div>
              </div>
              <div className="p-2.5 bg-[#0d1626] rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Tệp / Địa chỉ đối tượng</div>
                <div className="font-semibold text-white mt-0.5 break-all">{selectedScan.fileName}</div>
              </div>
              {selectedScan.summaryLabel && (
                <div className="p-2.5 bg-[#0d1626] rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Nhận định tóm tắt</div>
                  <div className="text-slate-200 mt-0.5 leading-relaxed">{selectedScan.summaryLabel}</div>
                </div>
              )}
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                Thời điểm ghi nhận: {new Date(selectedScan.createdAt).toLocaleString('vi-VN')} ({selectedScan.durationMs}ms)
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Lượt quét an toàn số: ${selectedScan.reportId} - ${selectedScan.fileName}`);
                  alert('Đã sao chép mã lượt quét!');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Sao chép mã
              </button>
              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
