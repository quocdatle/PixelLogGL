import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../../../components/layout/AppNavbar';
import AvatarWithFrame from '../../../components/common/AvatarWithFrame';
import useAuth from '../../../hooks/useAuth';
import userService from '../userService';
import libraryService from '../../library/libraryService';
import { getFrameStyle } from '../../../utils/avatarFrames';

const PLATFORM_OPTIONS = ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch', 'Mobile'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(user);
  const [framesData, setFramesData] = useState(null);
  const [libSummary, setLibSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkingIn, setCheckingIn] = useState(false);
  const [equippingId, setEquippingId] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [banner, setBanner] = useState(null);
  const [editForm, setEditForm] = useState({
    avatarUrl: '',
    bio: '',
    favoritePlatform: 'PC',
  });
  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let ignore = false;
    async function loadAll() {
      try {
        const [prof, frames, summary] = await Promise.all([
          userService.getProfile(),
          userService.getAvatarFrames(),
          libraryService.getSummary().catch(() => null),
        ]);
        if (ignore) return;

        setProfile(prof);
        updateUser(prof);
        setFramesData(frames);
        setLibSummary(summary);
        setEditForm({
          avatarUrl: prof.avatarUrl || '',
          bio: prof.bio || '',
          favoritePlatform: prof.favoritePlatform || 'PC',
        });
      } catch (err) {
        console.error('Lỗi tải hồ sơ cá nhân:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAll();
    return () => {
      ignore = true;
    };
  }, [updateUser]);

  const showBanner = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  async function handleCheckIn() {
    if (checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await userService.dailyCheckIn();
      if (res.user) {
        const updatedProfile = {
          ...res.user,
          coinBalance: res.balance,
        };
        setProfile(updatedProfile);
        updateUser(res.user);
      }
      const frames = await userService.getAvatarFrames();
      setFramesData(frames);
      showBanner('success', res.message || 'Điểm danh thành công!');
    } catch (err) {
      showBanner(
        'error',
        err.response?.data?.message || 'Không thể điểm danh lúc này.'
      );
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleEquipFrame(frameId) {
    if (equippingId) return;
    const isCurrentlyEquipped = profile?.equippedFrame === frameId;
    const nextFrame = isCurrentlyEquipped ? null : frameId;
    setEquippingId(frameId);

    try {
      const updated = await userService.updateProfile({ equippedFrame: nextFrame });
      setProfile((prev) => ({ ...prev, ...updated }));
      updateUser(updated);
      setFramesData((prev) =>
        prev
          ? {
              ...prev,
              equippedFrame: nextFrame,
              frames: prev.frames.map((f) => ({
                ...f,
                equipped: f.id === nextFrame,
              })),
            }
          : prev
      );
      showBanner(
        'success',
        nextFrame ? 'Đã trang bị khung avatar mới!' : 'Đã gỡ khung avatar.'
      );
    } catch (err) {
      showBanner(
        'error',
        err.response?.data?.message || 'Không thể cập nhật khung avatar.'
      );
    } finally {
      setEquippingId(null);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile({
        avatarUrl: editForm.avatarUrl.trim() || null,
        bio: editForm.bio,
        favoritePlatform: editForm.favoritePlatform,
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      updateUser(updated);
      showBanner('success', 'Đã lưu thông tin hồ sơ cá nhân.');
    } catch (err) {
      showBanner(
        'error',
        err.response?.data?.message || 'Không thể lưu hồ sơ.'
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      showBanner('error', 'Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showBanner('error', 'Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await userService.changePassword({
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showBanner('success', res.message || 'Đổi mật khẩu thành công.');
    } catch (err) {
      showBanner(
        'error',
        err.response?.data?.message || 'Không thể đổi mật khẩu.'
      );
    } finally {
      setChangingPassword(false);
    }
  }

  const level = profile?.level || 1;
  const maxLevel = profile?.maxLevel || 100;
  const progress = profile?.checkInProgress || 0;
  const required = profile?.requiredCheckIns || 1;
  const progressPercent =
    level >= maxLevel ? 100 : Math.min(100, Math.round((progress / required) * 100));

  const nextMilestone = level >= 100 ? 100 : Math.ceil((level + 1) / 10) * 10;
  const unlockedCount = framesData?.frames?.filter((f) => f.unlocked).length || 0;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
          {banner && (
            <div
              role="status"
              className={`px-4 py-3 rounded-2xl text-sm font-semibold border shadow-xs ${
                banner.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
              }`}
            >
              {banner.text}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-52 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 motion-safe:animate-pulse" />
              <div className="h-72 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 motion-safe:animate-pulse" />
            </div>
          ) : (
            <>
              {/* Hero Profile + Daily Check-in Leveling Section */}
              <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Avatar with Frame & Identity */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                    <AvatarWithFrame user={profile} size="lg" showLevelBadge />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                          {profile?.username}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {profile?.authProvider || 'local'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                          {profile?.favoritePlatform || 'PC'}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {profile?.email}
                      </p>

                      {profile?.bio && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-xl pt-1">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Check-in CTA */}
                  <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={!profile?.canCheckInToday || checkingIn}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        profile?.canCheckInToday
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white active:scale-[0.98]'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {checkingIn
                          ? 'Đang điểm danh...'
                          : profile?.canCheckInToday
                          ? 'Điểm danh hôm nay (+150 Xu & +1 XP)'
                          : 'Đã điểm danh hôm nay'}
                      </span>
                    </button>

                    {!profile?.canCheckInToday && profile?.nextCheckInAt && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Lần điểm danh tiếp theo:{' '}
                        {new Date(profile.nextCheckInAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="mt-7 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        Cấp độ {level} / {maxLevel}
                      </span>
                      {level < maxLevel && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          (Mốc khung tiếp theo: Cấp {nextMilestone})
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {level >= maxLevel
                        ? 'Đã đạt cấp độ tối đa!'
                        : `${progress} / ${required} lần điểm danh để lên Cấp ${level + 1}`}
                    </span>
                  </div>

                  <div
                    className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Tiến độ lên cấp"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Cấp càng cao số lần điểm danh yêu cầu mỗi cấp càng tăng (tối đa cấp 100). Mỗi cột mốc chia hết cho 10 sẽ mở khóa một khung avatar độc quyền.
                  </p>
                </div>

                {/* KPI Strip */}
                <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">Chuỗi điểm danh</dt>
                    <dd className="mt-1 text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white">
                      {profile?.checkInStreak || 0} ngày
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">Tổng ngày điểm danh</dt>
                    <dd className="mt-1 text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white">
                      {profile?.totalCheckIns || 0}
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">Số dư PixelCoins</dt>
                    <dd className="mt-1 text-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                      {(profile?.coinBalance ?? 0).toLocaleString()} Xu
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">Khung avatar đã mở</dt>
                    <dd className="mt-1 text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {unlockedCount} / 10
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Milestone Avatar Frames Gallery (Lv 10 -> Lv 100) */}
              <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      Bộ sưu tập Khung Avatar (Mốc Cấp 10 – 100)
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Mở khóa tự động khi tài khoản đạt các cấp 10, 20, 30, 40, 50, 60, 70, 80, 90 và 100.
                    </p>
                  </div>
                  {profile?.equippedFrame && (
                    <button
                      type="button"
                      onClick={() => handleEquipFrame(profile.equippedFrame)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                    >
                      Tháo khung đang dùng
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(framesData?.frames || []).map((frame) => {
                    const styleInfo = getFrameStyle(frame.id);
                    const isBusy = equippingId === frame.id;

                    return (
                      <div
                        key={frame.id}
                        className={`rounded-2xl p-6 border flex flex-col items-center text-center justify-between gap-4 transition-all ${
                          frame.equipped
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-400 dark:border-emerald-700 shadow-sm'
                            : frame.unlocked
                            ? 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            : 'bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-200/70 dark:border-zinc-800/70 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3 w-full">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              styleInfo?.badgeClass || 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            Cấp {frame.milestoneLevel} • {frame.tier}
                          </span>

                          <div className="my-2 flex items-center justify-center">
                            <AvatarWithFrame
                              user={profile}
                              frameId={frame.id}
                              size="preview"
                              previewLevel={frame.milestoneLevel}
                              showLevelBadge
                            />
                          </div>

                          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                            {frame.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[2.25rem]">
                            {frame.description}
                          </p>
                        </div>

                        {frame.unlocked ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleEquipFrame(frame.id)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                              frame.equipped
                                ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300'
                            }`}
                          >
                            {isBusy
                              ? 'Đang xử lý...'
                              : frame.equipped
                              ? 'Đang trang bị'
                              : 'Trang bị khung'}
                          </button>
                        ) : (
                          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 inline-flex items-center justify-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Mở tại Cấp {frame.milestoneLevel}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Library Snapshot & Account Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Edit Profile Form */}
                <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    Chỉnh sửa hồ sơ
                  </h2>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label
                        htmlFor="profile-avatar-url"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        URL Ảnh đại diện
                      </label>
                      <input
                        id="profile-avatar-url"
                        type="url"
                        value={editForm.avatarUrl}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                        }
                        placeholder="https://example.com/avatar.png"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="profile-platform"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Nền tảng chơi chính
                      </label>
                      <select
                        id="profile-platform"
                        value={editForm.favoritePlatform}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            favoritePlatform: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:border-emerald-500"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="profile-bio"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        id="profile-bio"
                        rows="3"
                        maxLength={300}
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        placeholder="Chia sẻ gu game hoặc tựa game yêu thích của bạn..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                </section>

                {/* Library Quick Overview + Change Password */}
                <div className="space-y-6">
                  <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                        Tổng quan kho game
                      </h2>
                      <Link
                        to="/library"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Mở thư viện
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Tổng game</div>
                        <div className="text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white mt-0.5">
                          {libSummary?.total ?? 0}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Giờ chơi</div>
                        <div className="text-xl font-extrabold tabular-nums text-zinc-900 dark:text-white mt-0.5">
                          {libSummary?.totalHours ?? 0}h
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Hoàn thành</div>
                        <div className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {libSummary?.byStatus?.completed ?? 0}
                        </div>
                      </div>
                    </div>
                  </section>

                  {profile?.authProvider === 'local' && (
                    <section className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
                      <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                        Đổi mật khẩu
                      </h2>

                      <form onSubmit={handleChangePassword} className="space-y-3">
                        <input
                          type="password"
                          required
                          value={pwForm.oldPassword}
                          onChange={(e) =>
                            setPwForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                          }
                          placeholder="Mật khẩu hiện tại"
                          aria-label="Mật khẩu hiện tại"
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={pwForm.newPassword}
                            onChange={(e) =>
                              setPwForm((prev) => ({ ...prev, newPassword: e.target.value }))
                            }
                            placeholder="Mật khẩu mới"
                            aria-label="Mật khẩu mới"
                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={pwForm.confirmPassword}
                            onChange={(e) =>
                              setPwForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            placeholder="Nhập lại mật khẩu mới"
                            aria-label="Xác nhận mật khẩu mới"
                            className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>
                      </form>
                    </section>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="py-8 px-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        PixelLog GL © 2026. Nền tảng quản lý game và trợ lý AI thông minh.
      </footer>
    </div>
  );
}
