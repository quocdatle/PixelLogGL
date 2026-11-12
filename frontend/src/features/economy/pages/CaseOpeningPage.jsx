import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppNavbar from '../../../components/layout/AppNavbar';
import CaseAnimation from '../components/CaseAnimation';
import CasePoolModal from '../components/CasePoolModal';
import economyService from '../economyService';
import useAuth from '../../../hooks/useAuth';

export default function CaseOpeningPage() {
  const { updateUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [cases, setCases] = useState([]);
  const [recentDrops, setRecentDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingState, setOpeningState] = useState(null); // { caseInfo, wonItem, isNew, reelItems, targetIndex }
  const [isOpening, setIsOpening] = useState(false);
  const [buyingKeyCaseId, setBuyingKeyCaseId] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState('standard');
  const [inspectingCase, setInspectingCase] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [walletData, casesData, dropsData] = await Promise.all([
          economyService.getWallet().catch(() => null),
          economyService.getCases().catch(() => []),
          economyService.getRecentDrops().catch(() => []),
        ]);

        if (!ignore) {
          if (walletData) setWallet(walletData);
          if (casesData) setCases(casesData);
          if (dropsData) setRecentDrops(dropsData);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu mở hòm:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Điểm danh nhận Xu hàng ngày
  const handleClaimDaily = async () => {
    try {
      const data = await economyService.claimDailyReward();
      setWallet((prev) => ({
        ...prev,
        balance: data.balance,
        keys: data.keys ?? prev?.keys,
        canClaimDaily: false,
        nextDailyAt: data.nextDailyAt,
      }));
      if (data.user) {
        updateUser(data.user);
      }
      setActionMessage({ type: 'success', text: data.message });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể nhận thưởng hôm nay';
      setActionMessage({ type: 'error', text: msg });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Mua chìa khóa mở rương bằng Xu
  const handleBuyKey = async (caseIdToBuy, quantity = 1) => {
    const targetCaseId = caseIdToBuy || selectedCaseId;
    const targetCase = cases.find((c) => c.id === targetCaseId);

    if (!targetCase || buyingKeyCaseId) return;

    const totalCost = targetCase.cost * quantity;
    if (wallet && wallet.balance < totalCost) {
      setActionMessage({
        type: 'error',
        text: `Bạn không đủ Xu để mua ${quantity} ${targetCase.keyName || 'chìa khóa'}. Cần ${totalCost} Xu nhưng chỉ có ${wallet.balance} Xu.`,
      });
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }

    setBuyingKeyCaseId(targetCaseId);
    setActionMessage(null);

    try {
      const result = await economyService.buyKey(targetCaseId, quantity);
      setWallet((prev) => ({
        ...prev,
        balance: result.balance,
        totalSpent: result.totalSpent ?? ((prev?.totalSpent || 0) + totalCost),
        keys: result.keys,
      }));
      setActionMessage({ type: 'success', text: result.message });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể mua chìa khóa. Vui lòng thử lại!';
      setActionMessage({ type: 'error', text: msg });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setBuyingKeyCaseId(null);
    }
  };

  // Mở hòm (tiêu thụ 1 chìa khóa tương ứng)
  const handleOpenCase = async (caseIdToOpen) => {
    const targetCaseId = caseIdToOpen || selectedCaseId;
    const targetCase = cases.find((c) => c.id === targetCaseId);

    if (!targetCase) return;

    const currentKeyCount = wallet?.keys?.[targetCaseId] ?? 0;
    if (wallet && currentKeyCount < 1) {
      setActionMessage({
        type: 'error',
        text: `Bạn chưa có ${targetCase.keyName || 'chìa khóa'} để mở ${targetCase.name}. Hãy mua chìa khóa bằng Xu trước!`,
      });
      setTimeout(() => setActionMessage(null), 4000);
      return;
    }

    setSelectedCaseId(targetCaseId);
    setIsOpening(true);
    setActionMessage(null);

    try {
      const result = await economyService.openCase(targetCaseId);

      // Cập nhật số dư chìa khóa sau khi mở rương
      setWallet((prev) => ({
        ...prev,
        balance: result.remainingBalance ?? prev?.balance,
        keys: result.remainingKeys ?? {
          ...(prev?.keys || {}),
          [targetCaseId]: Math.max(0, (prev?.keys?.[targetCaseId] ?? 1) - 1),
        },
      }));

      // Chuyển sang màn hình animation roulette
      setOpeningState({
        caseInfo: targetCase,
        wonItem: result.wonItem,
        isNew: result.isNew,
        reelItems: result.reelItems,
        targetIndex: result.targetIndex,
      });

      // Tải lại các lượt mở gần nhất
      economyService.getRecentDrops().then(setRecentDrops).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi mở hòm. Vui lòng thử lại!';
      setActionMessage({ type: 'error', text: msg });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsOpening(false);
    }
  };

  // Reset khi bấm mở tiếp
  const handleResetOpening = () => {
    const currentCaseId = openingState?.caseInfo?.id || selectedCaseId;
    setOpeningState(null);
    handleOpenCase(currentCaseId);
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors duration-150">
      <div>
        <AppNavbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Top Banner & Wallet Status */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Minigame Gacha
                </span>
                <span className="text-xs text-zinc-400">• Tỷ lệ minh bạch 100%</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
                <span>🎁</span> Rương Báu PixelLog
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                Dùng Xu ảo để mua chìa khóa tương ứng và mở các bảo vật, vũ khí, danh hiệu huyền thoại từ thế giới game.
              </p>
            </div>

            {/* Wallet Panel & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Wallet Pill */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                  🪙
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Số dư PixelCoins
                  </div>
                  <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 leading-tight tabular-nums">
                    {wallet ? `${wallet.balance.toLocaleString()} Xu` : '...'}
                  </div>
                </div>
              </div>

              {/* Daily Check-in Button */}
              {wallet && (
                <button
                  type="button"
                  onClick={handleClaimDaily}
                  disabled={!wallet.canClaimDaily}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
                    wallet.canClaimDaily
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-amber-900/20 active:scale-95'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-800'
                  }`}
                  title={
                    wallet.canClaimDaily
                      ? 'Điểm danh nhận 150 Xu miễn phí'
                      : 'Bạn đã nhận xu hôm nay rồi'
                  }
                >
                  <span>{wallet.canClaimDaily ? '✨' : '⏳'}</span>
                  <span>{wallet.canClaimDaily ? 'Điểm danh (+150 Xu)' : 'Đã điểm danh'}</span>
                </button>
              )}

              {/* Link to Collection Page */}
              <Link
                to="/economy/collection"
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center gap-2 border border-zinc-200 dark:border-zinc-700/80"
              >
                <span>🎒</span>
                <span>Bộ sưu tập của tôi</span>
              </Link>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {actionMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-200 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <span>{actionMessage.type === 'success' ? '🎉' : '⚠️'}</span>
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* ACTIVE SPINNING ROULETTE STAGE */}
          {openingState ? (
            <div className="mb-10 animate-in fade-in zoom-in-95 duration-200">
              <CaseAnimation
                caseInfo={openingState.caseInfo}
                reelItems={openingState.reelItems}
                targetIndex={openingState.targetIndex}
                wonItem={openingState.wonItem}
                isNew={openingState.isNew}
                remainingKeys={wallet?.keys?.[openingState.caseInfo?.id] ?? 0}
                onReset={handleResetOpening}
              />
            </div>
          ) : null}

          {/* CASE SELECTION CARDS */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Chọn rương muốn mở
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Mỗi rương mang chủ đề và tỷ lệ rơi vật phẩm cao cấp riêng biệt.
                </p>
              </div>

              {/* Keys Pouch Pill */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs self-start sm:self-auto"
                title="Số lượng chìa khóa mở rương bạn đang sở hữu"
              >
                <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                  Chìa khóa
                </div>
                <div className="flex items-center gap-2">
                  {(cases.length > 0
                    ? cases
                    : [
                        { id: 'standard', name: 'Rương Tân Thủ', keyIcon: '🗝️' },
                        { id: 'cyber', name: 'Rương Cyberpunk', keyIcon: '🔑' },
                        { id: 'mythic', name: 'Rương Thần Thoại', keyIcon: '🔱' },
                      ]
                  ).map((c) => (
                    <span
                      key={c.id}
                      title={`${c.keyName || c.name}: ${wallet?.keys?.[c.id] ?? 0}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-extrabold text-zinc-800 dark:text-zinc-200 tabular-nums"
                    >
                      <span>{c.keyIcon || '🔑'}</span>
                      <span>{wallet ? (wallet.keys?.[c.id] ?? 0) : '-'}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-3xl bg-zinc-200/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const keyCount = wallet?.keys?.[c.id] ?? 0;
                  const hasKey = keyCount >= 1;
                  const canBuy1 = wallet ? wallet.balance >= c.cost : false;
                  const canBuy5 = wallet ? wallet.balance >= c.cost * 5 : false;
                  const isBuyingThisKey = buyingKeyCaseId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`relative rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-white dark:bg-zinc-900 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Top Case Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {c.englishName}
                        </span>

                        <div
                          className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border tabular-nums ${
                            hasKey
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                              : 'text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          <span>{c.keyIcon || '🔑'}</span>
                          <span>Có: {keyCount}</span>
                        </div>
                      </div>

                      {/* Icon & Name */}
                      <div className="text-center py-4">
                        <div className="w-24 h-24 mx-auto rounded-3xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-6xl shadow-inner mb-4 hover:scale-105 transition-transform">
                          <span className="select-none filter drop-shadow">{c.icon}</span>
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                          {c.name}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 min-h-[32px]">
                          {c.description}
                        </p>
                      </div>

                      {/* Probabilities preview */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mb-5">
                        <div className="text-[11px] font-semibold text-zinc-400 mb-2">Tỷ lệ rơi:</div>
                        <div className="grid grid-cols-5 gap-1 text-center">
                          <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-lg p-1">
                            <div className="text-[9px] text-zinc-400 font-bold">Xám</div>
                            <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                              {c.displayChances?.common || '0%'}
                            </div>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-lg p-1 border border-emerald-500/20">
                            <div className="text-[9px] text-emerald-500 font-bold">Lục</div>
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                              {c.displayChances?.uncommon || '0%'}
                            </div>
                          </div>
                          <div className="bg-sky-50 dark:bg-sky-950/40 rounded-lg p-1 border border-sky-500/20">
                            <div className="text-[9px] text-sky-500 font-bold">Lam</div>
                            <div className="text-[10px] font-bold text-sky-600 dark:text-sky-300">
                              {c.displayChances?.rare || '0%'}
                            </div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-lg p-1 border border-purple-500/20">
                            <div className="text-[9px] text-purple-500 font-bold">Tím</div>
                            <div className="text-[10px] font-bold text-purple-600 dark:text-purple-300">
                              {c.displayChances?.epic || '0%'}
                            </div>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/40 rounded-lg p-1 border border-amber-500/30">
                            <div className="text-[9px] text-amber-500 font-bold">Vàng</div>
                            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-300">
                              {c.displayChances?.legendary || '0%'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingCase(c);
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Xem vật phẩm &amp; tỷ lệ ({c.itemCount ?? c.pool?.length ?? 0})</span>
                        </button>

                        {/* Buy Key Box */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1 truncate">
                              <span>{c.keyIcon || '🔑'}</span>
                              <span className="truncate">{c.keyName || 'Chìa khóa'}</span>
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
                              {c.cost} Xu/chìa
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyKey(c.id, 1);
                              }}
                              disabled={!canBuy1 || isBuyingThisKey}
                              className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 transition-colors cursor-pointer disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-500 disabled:cursor-not-allowed tabular-nums"
                            >
                              {isBuyingThisKey ? 'Đang mua...' : `+1 Chìa (${c.cost})`}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyKey(c.id, 5);
                              }}
                              disabled={!canBuy5 || isBuyingThisKey}
                              className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-amber-600/15 hover:bg-amber-600/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-700 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed tabular-nums"
                            >
                              +5 Chìa ({(c.cost * 5).toLocaleString()})
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCase(c.id);
                          }}
                          disabled={isOpening || !hasKey}
                          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-150 cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                            !hasKey
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none'
                              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-900/20 hover:scale-[1.02]'
                          }`}
                        >
                          {isOpening && selectedCaseId === c.id ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Đang chuẩn bị...</span>
                            </>
                          ) : !hasKey ? (
                            <>
                              <span>🔒</span>
                              <span>Cần 1 {c.keyName || 'Chìa khóa'}</span>
                            </>
                          ) : (
                            <>
                              <span>Mở ngay (-1 {c.keyIcon || '🔑'})</span>
                              <span>🎲</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RECENT DROPS LIVE FEED */}
          {recentDrops.length > 0 && (
            <div className="mt-8 rounded-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    Bảng tin mở hòm thời gian thực
                  </h3>
                </div>
                <span className="text-xs text-zinc-400">Cập nhật liên tục</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {recentDrops.slice(0, 5).map((drop, i) => (
                  <div
                    key={drop.id || i}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2.5"
                  >
                    <div className="text-2xl shrink-0">{drop.item?.icon || '🎁'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {drop.item?.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        Người chơi: {drop.user?.username || 'Ẩn danh'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-xs text-zinc-500 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-900">
        PixelLog GL Minigame Engine © 2026. Tỷ lệ mở hòm được quản lý độc quyền tại Backend.
      </footer>

      {/* Case Pool & Drop Rate Modal */}
      {inspectingCase && (
        <CasePoolModal
          key={inspectingCase.id}
          caseInfo={inspectingCase}
          isOpen={!!inspectingCase}
          onClose={() => setInspectingCase(null)}
          onOpenCase={handleOpenCase}
          onBuyKey={handleBuyKey}
          keyCount={wallet?.keys?.[inspectingCase.id] ?? 0}
          canOpen={wallet ? (wallet.keys?.[inspectingCase.id] ?? 0) >= 1 : false}
          canBuyKey={wallet ? wallet.balance >= inspectingCase.cost : false}
          isBuyingKey={buyingKeyCaseId === inspectingCase.id}
          isOpening={isOpening}
        />
      )}
    </div>
  );
}
