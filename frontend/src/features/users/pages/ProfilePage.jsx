import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../../../components/layout/AppNavbar';
import AvatarWithFrame from '../../../components/common/AvatarWithFrame';
import useAuth from '../../../hooks/useAuth';
import userService from '../userService';
import libraryService from '../../library/libraryService';
import { getFrameStyle } from '../../../utils/avatarFrames';

const PLATFORM_OPTIONS = ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch', 'Mobile'];

function FlameIcon({ className = 'w-4 h-4 text-amber-500 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.316.492-.474.966-.567 1.344-.197.802-.13 1.49.014 2.008-.67-.33-1.398-.82-1.946-1.516a1 1 0 00-1.709.757C5.7 7.07 5.6 8.5 6.13 9.878c-.674-.187-1.33-.518-1.87-.978a1 1 0 00-1.608.82C2.65 11.835 3.37 13.9 4.7 15.357 6.13 16.924 8.01 17.75 10 17.75c2.08 0 4.02-.876 5.42-2.486 1.37-1.572 1.95-3.75 1.47-5.88-.36-1.6-1.3-2.99-2.58-3.95-.58-.43-1.18-.74-1.72-.94a7.9 7.9 0 00-.195-1.941zM10 16.25c-1.56 0-3-.64-4.08-1.83-.98-1.078-1.48-2.59-1.29-4.13.43.34.93.61 1.47.81a1 1 0 001.21-.49c.27-.58.33-1.36.19-2.12-.11-.6-.29-1.13-.53-1.61.42.44.92.83 1.48 1.15a1 1 0 001.44-.65c.18-.72.33-1.6.33-2.54 0-.17-.01-.33-.03-.49.33.22.65.48.94.79 1.1 1.17 1.7 2.68 1.54 4.2-.14 1.32-.85 2.47-1.88 3.12a1 1 0 00-.47.86c0 .4.24.75.6.9.4.17.85.12 1.2-.13.38-.28.71-.62.98-1.02-.19 1.58-.99 2.95-2.18 3.95-.87.73-1.88 1.12-2.98 1.12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CoinIcon({ className = 'w-4 h-4 text-amber-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.94c-.391-.127-.68-.312-.843-.504a1 1 0 10-1.514 1.312c.563.649 1.411 1.085 2.357 1.25V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.153c.391.127.68.312.843.504a1 1 0 101.514-1.312C12.794 5.696 11.946 5.26 11 5.092V5z" />
    </svg>
  );
}

function CrownIcon({ className = 'w-4 h-4 text-emerald-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

function CalendarIcon({ className = 'w-4 h-4 text-zinc-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GamepadIcon({ className = 'w-4 h-4 text-emerald-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'w-4 h-4 text-sky-400 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM13.707 8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function getGamerTitle(level = 1) {
  if (level >= 100) return 'Bất Tử Tối Cao (Celestial Sovereign)';
  if (level >= 90) return 'Chí Tôn Huyền Thoại (Mythic Grandmaster)';
  if (level >= 70) return 'Đại Tướng Lĩnh (Supreme Warlord)';
  if (level >= 40) return 'Chiến Tướng Tinh Anh (Elite Vanguard)';
  if (level >= 20) return 'Dũng Sĩ Dày Dạn (Battle Knight)';
  if (level >= 10) return 'Thợ Săn Phiêu Lưu (Ranger Scout)';
  return 'Tân Binh Khởi Đầu (Novice Adventurer)';
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(user);
  const [framesData, setFramesData] = useState(null);
  const [libSummary, setLibSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
  const gamerId = (profile?._id || '7789a0').slice(-6).toUpperCase();
  const gamerTitle = getGamerTitle(level);

  const totalGames = libSummary?.total ?? 0;
  const totalHours = libSummary?.totalHours ?? 0;
  const completedGames = libSummary?.byStatus?.completed ?? 0;
  const playingGames = libSummary?.byStatus?.playing ?? 0;
  const backlogGames = libSummary?.byStatus?.backlog ?? 0;
  const completionRate = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
          {banner && (
            <div
              role="status"
              className={`px-4 py-3 rounded-2xl text-sm font-semibold ${
                banner.type === 'error'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              }`}
            >
              {banner.text}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              <div className="h-72 rounded-3xl bg-zinc-200 dark:bg-zinc-900" />
              <div className="h-96 rounded-3xl bg-zinc-200 dark:bg-zinc-900" />
            </div>
          ) : (
            <>
              {/* GAMER PASSPORT / THẺ CĂN CƯỚC GAME THỦ */}
              <section
                data-ui="gamer-passport"
                className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 sm:p-8"
              >
                {/* Top Passport Header: Chip, ID & Status */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6">
                  <div className="flex items-center gap-3">
                    {/* Simulated Smart Chip */}
                    <div
                      className="w-11 h-8 rounded-lg bg-amber-500 p-1 shrink-0 flex items-center justify-center"
                      title="Microchip căn cước PixelLog"
                      aria-hidden="true"
                    >
                      <div className="w-full h-full bg-amber-600 rounded-xs grid grid-cols-2 gap-0.5 opacity-80">
                        <div className="bg-amber-700" />
                        <div className="bg-amber-700" />
                        <div className="bg-amber-700" />
                        <div className="bg-amber-600" />
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-zinc-400">
                        Căn cước game thủ chính thức
                      </div>
                      <div className="text-sm font-bold text-amber-400 tabular-nums">
                        ID: PLG-{gamerId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Đã xác thực
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
                      Bản bảo mật v3.4
                    </span>
                  </div>
                </div>

                {/* Main Identity Block */}
                <div className="relative z-10 pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                  {/* Left: Avatar & Gamer Dossier */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 min-w-0">
                    <div className="shrink-0 flex justify-center">
                      <AvatarWithFrame user={profile} size="lg" showLevelBadge />
                    </div>

                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                          {profile?.username}
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300">
                          {profile?.authProvider || 'local'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300">
                          <GamepadIcon className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{profile?.favoritePlatform || 'PC'}</span>
                        </span>
                      </div>

                      <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                        <span className="text-zinc-400 font-normal">Danh hiệu:</span>
                        <span className="text-zinc-100">{gamerTitle}</span>
                      </div>

                      <p className="text-xs text-zinc-400">
                        {profile?.email}
                      </p>

                      {profile?.bio ? (
                        <p className="text-sm text-zinc-300 italic pt-1 max-w-xl leading-relaxed">
                          "{profile.bio}"
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-500 italic pt-1">
                          Chưa cập nhật phương châm game thủ. Vào tab Cài đặt để thêm lời giới thiệu.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Daily Check-in Button inside Passport */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={!profile?.canCheckInToday || checkingIn}
                      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                        profile?.canCheckInToday
                          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-[0.98]'
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <ShieldCheckIcon className="w-5 h-5 shrink-0 text-zinc-950" />
                      <span>
                        {checkingIn
                          ? 'Đang xác thực...'
                          : profile?.canCheckInToday
                          ? 'Điểm danh hôm nay (+150 Xu & +1 XP)'
                          : 'Đã điểm danh hôm nay'}
                      </span>
                    </button>

                    {!profile?.canCheckInToday && profile?.nextCheckInAt && (
                      <p className="text-xs text-zinc-400">
                        Lượt kế: {new Date(profile.nextCheckInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(profile.nextCheckInAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Level EXP Progress Bar */}
                <div className="relative z-10 mt-8 pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        Cấp độ {level} / {maxLevel}
                      </span>
                      {level < maxLevel && (
                        <span className="text-xs text-zinc-400">
                          (Mốc mở khung kế tiếp: Cấp {nextMilestone})
                        </span>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-400 tabular-nums">
                      {level >= maxLevel
                        ? 'Đã đạt cấp độ tối đa'
                        : `${progress} / ${required} lần điểm danh để lên Cấp ${level + 1}`}
                    </span>
                  </div>

                  <div
                    className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Tiến độ lên cấp"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 4 Bottom KPI Metric Strips */}
                <dl className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 rounded-2xl bg-zinc-800/80 flex flex-col justify-between">
                    <dt className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <FlameIcon className="w-4 h-4 text-amber-500" />
                      <span>Chuỗi điểm danh</span>
                    </dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-amber-400">
                      {profile?.checkInStreak || 0} <span className="text-sm font-medium text-zinc-400">ngày</span>
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-800/80 flex flex-col justify-between">
                    <dt className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-zinc-400" />
                      <span>Tổng ngày điểm danh</span>
                    </dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-white">
                      {profile?.totalCheckIns || 0} <span className="text-sm font-medium text-zinc-400">lần</span>
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-800/80 flex flex-col justify-between">
                    <dt className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <CoinIcon className="w-4 h-4 text-amber-400" />
                      <span>Ví PixelCoins</span>
                    </dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-amber-400">
                      {(profile?.coinBalance ?? 0).toLocaleString()} <span className="text-sm font-medium text-zinc-400">Xu</span>
                    </dd>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-800/80 flex flex-col justify-between">
                    <dt className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                      <CrownIcon className="w-4 h-4 text-emerald-400" />
                      <span>Khung Avatar</span>
                    </dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-black tabular-nums text-emerald-400">
                      {unlockedCount} / 10 <span className="text-sm font-medium text-zinc-400">mở</span>
                    </dd>
                  </div>
                </dl>
              </section>

              {/* TABBED NAVIGATION HEADER */}
              <div className="flex items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Tổng quan và thành tích</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('frames')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'frames'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <CrownIcon className="w-4 h-4" />
                  <span>Kho khung avatar ({unlockedCount}/10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Cài đặt và bảo mật</span>
                </button>
              </div>

              {/* TAB 1: OVERVIEW & ACHIEVEMENTS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Library Snapshot & Completion Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Library Overview Card */}
                    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                            <GamepadIcon className="w-5 h-5 text-emerald-600" />
                            <span>Tổng quan thư viện</span>
                          </h2>
                          <Link
                            to="/library"
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Vào thư viện →
                          </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-5">
                          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Tổng game</div>
                            <div className="text-2xl font-black tabular-nums text-zinc-900 dark:text-white mt-0.5">
                              {totalGames}
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Giờ chơi</div>
                            <div className="text-2xl font-black tabular-nums text-zinc-900 dark:text-white mt-0.5">
                              {totalHours}h
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">Hoàn thành</div>
                            <div className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {completedGames}
                            </div>
                          </div>
                        </div>

                        {/* Story Completion Rate */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-zinc-600 dark:text-zinc-300">
                              Tỷ lệ hoàn thành cốt truyện:
                            </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {completionRate}% ({completedGames}/{totalGames || 1} game)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Đang chơi: {playingGames} game</span>
                        <span>Chờ chơi: {backlogGames} game</span>
                      </div>
                    </div>

                    {/* Gamer Dossier & Milestone Badges */}
                    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
                            <span>Huy hiệu thành tích</span>
                          </h2>
                          <Link
                            to="/analytics"
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Xem thống kê chi tiết →
                          </Link>
                        </div>

                        <div className="space-y-3">
                          {/* Badge 1 */}
                          <div className={`p-3 rounded-xl flex items-center gap-3.5 ${
                            (profile?.totalCheckIns || 0) >= 1
                              ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 opacity-60'
                          }`}>
                            <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
                              L1
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                Tân thủ tận tâm
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Thực hiện lần điểm danh đầu tiên trên nền tảng.
                              </div>
                            </div>
                          </div>

                          {/* Badge 2 */}
                          <div className={`p-3 rounded-xl flex items-center gap-3.5 ${
                            (profile?.checkInStreak || 0) >= 7
                              ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 opacity-60'
                          }`}>
                            <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                              <FlameIcon className="w-4 h-4 text-zinc-950" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                Chiến binh bền bỉ
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Giữ vững chuỗi điểm danh 7 ngày liên tục.
                              </div>
                            </div>
                          </div>

                          {/* Badge 3 */}
                          <div className={`p-3 rounded-xl flex items-center gap-3.5 ${
                            totalGames >= 5
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 opacity-60'
                          }`}>
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <GamepadIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                Nhà sưu tập tiềm năng
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Thêm tối thiểu 5 trò chơi vào thư viện cá nhân.
                              </div>
                            </div>
                          </div>

                          {/* Badge 4 */}
                          <div className={`p-3 rounded-xl flex items-center gap-3.5 ${
                            level >= 10
                              ? 'bg-sky-100/70 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 opacity-60'
                          }`}>
                            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                              <CrownIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                Chiến tướng khởi điểm
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                Chinh phục Cấp 10 và mở khóa Khung Avatar đầu tiên.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        Hệ thống tự động kích hoạt huy hiệu khi người dùng đạt chỉ số yêu cầu.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AVATAR FRAMES VAULT */}
              {activeTab === 'frames' && (
                <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                        Bộ sưu tập Khung Avatar (Mốc Cấp 10 – 100)
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Tự động mở khóa khi tài khoản của bạn đạt các mốc cấp độ danh giá chia hết cho 10.
                      </p>
                    </div>
                    {profile?.equippedFrame && (
                      <button
                        type="button"
                        onClick={() => handleEquipFrame(profile.equippedFrame)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
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
                          className={`rounded-2xl p-6 flex flex-col items-center text-center justify-between gap-4 transition-colors ${
                            frame.equipped
                              ? 'bg-emerald-50 dark:bg-emerald-950/50'
                              : frame.unlocked
                              ? 'bg-zinc-50 dark:bg-zinc-800/60'
                              : 'bg-zinc-100/60 dark:bg-zinc-900/60 opacity-75'
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
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[2.5rem]">
                              {frame.description}
                            </p>
                          </div>

                          {frame.unlocked ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleEquipFrame(frame.id)}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${
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
                            <div className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 inline-flex items-center justify-center gap-1.5">
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
              )}

              {/* TAB 3: SETTINGS & SECURITY */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Edit Profile Form */}
                  <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-5">
                    <div className="pb-3">
                      <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                        Chỉnh sửa thông tin game thủ
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Cập nhật ảnh đại diện, nền tảng yêu thích và khẩu hiệu cá nhân.
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label
                          htmlFor="profile-avatar-url"
                          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                        >
                          URL ảnh đại diện
                        </label>
                        <div className="flex items-center gap-3">
                          <AvatarWithFrame
                            user={{
                              ...profile,
                              avatarUrl: editForm.avatarUrl.trim() || null,
                            }}
                            size="md"
                            showLevelBadge={false}
                          />
                          <div className="flex-1 min-w-0">
                            <input
                              id="profile-avatar-url"
                              type="url"
                              value={editForm.avatarUrl}
                              onChange={(e) =>
                                setEditForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                              }
                              placeholder="Dán link ảnh (.png, .jpg, .webp)"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              Xem trước trực tiếp cùng khung avatar đang sử dụng.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="profile-platform"
                          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                        >
                          Nền tảng sở trường
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          Khẩu hiệu hoặc giới thiệu bản thân
                        </label>
                        <textarea
                          id="profile-bio"
                          rows="3"
                          maxLength={300}
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          placeholder="Chia sẻ gu game, tựa game yêu thích hoặc phương châm của bạn..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </form>
                  </section>

                  {/* Security: Change Password */}
                  <div className="space-y-6">
                    {profile?.authProvider === 'local' ? (
                      <section className="rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-4">
                        <div className="pb-3">
                          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                            Bảo mật và đổi mật khẩu
                          </h2>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Cập nhật mật khẩu định kỳ để bảo vệ tài sản và kho game cá nhân.
                          </p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Mật khẩu hiện tại
                            </label>
                            <input
                              type="password"
                              required
                              value={pwForm.oldPassword}
                              onChange={(e) =>
                                setPwForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                              }
                              placeholder="Nhập mật khẩu hiện tại"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Mật khẩu mới
                              </label>
                              <input
                                type="password"
                                required
                                minLength={6}
                                value={pwForm.newPassword}
                                onChange={(e) =>
                                  setPwForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                }
                                placeholder="Ít nhất 6 ký tự"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Xác nhận mật khẩu mới
                              </label>
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
                                placeholder="Nhập lại mật khẩu"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {changingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                          </button>
                        </form>
                      </section>
                    ) : (
                      <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-6 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 mb-2">
                          <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                          Tài khoản liên kết Google
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                          Tài khoản của bạn được bảo mật thông qua dịch vụ đăng nhập Google OAuth. Mật khẩu được quản lý trực tiếp bởi Google.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
