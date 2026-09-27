"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";

interface BookmarkItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arab: string;
  translation: string;
  createdAt: number;
}

interface QoriItem {
  id: string;
  name: string;
  category: string;
  folder: string;
}

const QORI_LIST: QoriItem[] = [
  // --- Imam Masjidil Haram (Makkah) ---
  {
    id: "al-muaiqly",
    name: "Maher Al-Muaiqly",
    category: "Imam Masjidil Haram (Makkah)",
    folder: "MaherAlMuaiqly128kbps",
  },
  {
    id: "al-dosari",
    name: "Yasser Al-Dosari",
    category: "Imam Masjidil Haram (Makkah)",
    folder: "Yasser_Ad-Dussary_128kbps",
  },
  {
    id: "as-sudais",
    name: "Abdurrahman As-Sudais",
    category: "Imam Masjidil Haram (Makkah)",
    folder: "Abdurrahmaan_As-Sudais_192kbps",
  },
  {
    id: "ash-shuraim",
    name: "Saud Asy-Syuraim",
    category: "Imam Masjidil Haram (Makkah)",
    folder: "Saood_ash-Shuraym_128kbps",
  },

  // --- Imam Masjid Nabawi (Madinah) ---
  {
    id: "muhammad-ayyoub",
    name: "Muhammad Ayyub",
    category: "Imam Masjid Nabawi (Madinah)",
    folder: "Muhammad_Ayyoub_128kbps",
  },
  {
    id: "al-budair",
    name: "Salah Al-Budair",
    category: "Imam Masjid Nabawi (Madinah)",
    folder: "Salah_Al_Budair_128kbps",
  },
  {
    id: "al-hudhaify",
    name: "Ali Al-Hudhaify",
    category: "Imam Masjid Nabawi (Madinah)",
    folder: "Hudhaify_128kbps",
  },
  {
    id: "ali-jaber",
    name: "Ali Jaber",
    category: "Imam Masjid Nabawi (Madinah)",
    folder: "Ali_Jaber_64kbps",
  },

  // --- Qari Populer & Suara Merdu ---
  {
    id: "alafasy",
    name: "Misyari Rasyid Al-Afasi",
    category: "Qari Suara Merdu",
    folder: "Alafasy_128kbps",
  },
  {
    id: "al-qatami",
    name: "Nasser Al-Qatami",
    category: "Qari Suara Merdu",
    folder: "Nasser_Alqatami_128kbps",
  },
  {
    id: "al-ghamidi",
    name: "Sa'ad Al-Ghamidi",
    category: "Qari Suara Merdu",
    folder: "Ghamadi_40kbps",
  },
  {
    id: "al-ajamy",
    name: "Ahmed Al-Ajmy",
    category: "Qari Suara Merdu",
    folder: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
  },
  {
    id: "fares-abbad",
    name: "Fares Abbad",
    category: "Qari Suara Merdu",
    folder: "Fares_Abbad_64kbps",
  },
  {
    id: "hani-rifai",
    name: "Hani Ar-Rifai",
    category: "Qari Suara Merdu",
    folder: "Hani_Rifai_192kbps",
  },
  {
    id: "ash-shaatree",
    name: "Abu Bakr Ash-Shaatree",
    category: "Qari Suara Merdu",
    folder: "Abu_Bakr_Ash-Shaatree_128kbps",
  },
  {
    id: "muhammad-jibreel",
    name: "Muhammad Jibreel",
    category: "Qari Suara Merdu",
    folder: "Muhammad_Jibreel_128kbps",
  },

  // --- Syaikhul Qura (Tartil & Tajwid) ---
  {
    id: "al-husary",
    name: "Mahmud Khalil Al-Husary",
    category: "Syaikhul Qura (Tartil & Tajwid)",
    folder: "Husary_128kbps",
  },
  {
    id: "abdul-basit",
    name: "Abdul Basit (Murattal)",
    category: "Syaikhul Qura (Tartil & Tajwid)",
    folder: "Abdul_Basit_Murattal_192kbps",
  },
  {
    id: "abdullah-basfar",
    name: "Abdullah Basfar",
    category: "Syaikhul Qura (Tartil & Tajwid)",
    folder: "Abdullah_Basfar_192kbps",
  },
];

export default function Page() {
  const [alquranData, setAlquranData] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurahId, setSelectedSurahId] = useState(1); 
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [surahDetail, setSurahDetail] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Settings & Toggles
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedAyahFilter, setSelectedAyahFilter] = useState("all");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [selectedQori, setSelectedQori] = useState("alafasy");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Playback states & Synchronization refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  // Synchronous refs to prevent stale state in audio event callbacks
  const isPlayingFullRef = useRef(false);
  const playingAyahRef = useRef<number | null>(null);
  const selectedQoriRef = useRef("alafasy");
  const surahDetailRef = useRef<any>(null);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    selectedQoriRef.current = selectedQori;
  }, [selectedQori]);
  useEffect(() => {
    surahDetailRef.current = surahDetail;
  }, [surahDetail]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    playingAyahRef.current = playingAyah;
  }, [playingAyah]);

  useEffect(() => {
    isPlayingFullRef.current = isPlayingFull;
  }, [isPlayingFull]);

  // 1. Fetch Daftar Surat (v2 untuk mendapatkan nama arab 'name_short' dan meta lengkap)
  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        const response = await axios.get("https://api.myquran.com/v2/quran/surat/semua");
        const normalized = response.data.data.map((item: any) => ({
          number: Number(item.number),
          name: item.name_id,
          name_arabic: item.name_short,
          translation: item.translation_id,
          revelation: item.revelation_id === "Makkiyyah" ? "Mekah" : "Madinah",
          number_of_ayahs: Number(item.number_of_verses),
          audio_url: item.audio_url,
        }));
        setAlquranData(normalized);
      } catch (error) {
        console.error("Gagal mengambil data surat via v2, coba fallback v3...", error);
        try {
          const fallback = await axios.get("https://api.myquran.com/v3/quran");
          setAlquranData(fallback.data.data);
        } catch (err) {
          console.error("Gagal mengambil daftar surat", err);
        }
      } finally {
        setLoadingList(false);
      }
    };

    fetchSurahList();
  }, []);

  // 2. Fetch Detail Surat & Ayat (20 per page)
  useEffect(() => {
    if (!selectedSurahId) return;

    // Stop all audio on surah change
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    setPlayingAyah(null);
    playingAyahRef.current = null;
    setIsPlayingFull(false);
    isPlayingFullRef.current = false;
    setSelectedAyahFilter("all");

    const fetchSurahDetail = async () => {
      setLoadingDetail(true);
      setPage(1);
      pageRef.current = 1;
      try {
        const response = await axios.get(
          `https://api.myquran.com/v3/quran/${selectedSurahId}?page=1&limit=20`
        );
        const data = response.data.data;
        const pagination = response.data.pagination;
        setSurahDetail(data);
        surahDetailRef.current = data;

        const total = pagination?.total || data?.number_of_ayahs || 0;
        const more = total > 20 && (data?.ayahs?.length || 0) < total;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (error) {
        console.error("Gagal mengambil detail surah", error);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchSurahDetail();
  }, [selectedSurahId]);

  // 3. Helper to load next page of ayahs
  const loadNextAyahsBatch = async (): Promise<boolean> => {
    if (loadingMoreRef.current || !hasMoreRef.current) return false;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const response = await axios.get(
        `https://api.myquran.com/v3/quran/${selectedSurahId}?page=${nextPage}&limit=20`
      );
      const newAyahs = response.data.data?.ayahs || [];
      const pagination = response.data.pagination;

      setSurahDetail((prev: any) => {
        const updated = {
          ...prev,
          ayahs: [...(prev?.ayahs || []), ...newAyahs],
        };
        surahDetailRef.current = updated;
        return updated;
      });

      setPage(nextPage);
      pageRef.current = nextPage;

      const total = pagination?.total || surahDetailRef.current?.number_of_ayahs || 0;
      const loadedCount = (surahDetailRef.current?.ayahs?.length || 0) + newAyahs.length;
      const more = loadedCount < total;
      setHasMore(more);
      hasMoreRef.current = more;
      return true;
    } catch (error) {
      console.error("Gagal memuat ayat berikutnya", error);
      return false;
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  const handleLoadMore = () => {
    loadNextAyahsBatch();
  };

  // 4. Core Audio Playback Function (Sequential & Highlight Synchronization)
  const playAyahSequential = async (
    ayahNumber: number,
    autoNext: boolean,
    qoriOverride?: string
  ) => {
    const surahNum = selectedSurahId;
    const totalAyahs = surahDetailRef.current?.number_of_ayahs || 0;

    // Check if end of surah reached
    if (totalAyahs > 0 && ayahNumber > totalAyahs) {
      isPlayingFullRef.current = false;
      setIsPlayingFull(false);
      setPlayingAyah(null);
      playingAyahRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      showToast("Surat telah selesai dibaca");
      return;
    }

    // Set active playing state
    setPlayingAyah(ayahNumber);
    playingAyahRef.current = ayahNumber;
    setIsPlayingFull(autoNext);
    isPlayingFullRef.current = autoNext;

    // Smoothly scroll the card into view so the user can follow along
    setTimeout(() => {
      const el = document.getElementById(`ayah-${ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 60);

    // If approaching the end of loaded ayahs, pre-fetch next page in background
    if (autoNext && hasMoreRef.current) {
      const currentLoadedCount = surahDetailRef.current?.ayahs?.length || 0;
      if (ayahNumber >= currentLoadedCount - 2) {
        loadNextAyahsBatch();
      }
    }

    // Stop currently running audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    // Resolve audio URL (individual verse MP3 from selected Qari)
    const surahPadded = String(surahNum).padStart(3, "0");
    const ayahPadded = String(ayahNumber).padStart(3, "0");
    const activeQoriId = qoriOverride || selectedQoriRef.current || selectedQori;
    const currentQoriObj =
      QORI_LIST.find((q) => q.id === activeQoriId) || QORI_LIST[0];
    const audioUrl = `https://everyayah.com/data/${currentQoriObj.folder}/${surahPadded}${ayahPadded}.mp3`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setAudioLoading(true);

    audio.oncanplay = () => {
      setAudioLoading(false);
    };

    // When this verse ends, automatically advance to next verse if in full mode
    audio.onended = () => {
      setAudioLoading(false);
      if (isPlayingFullRef.current) {
        playAyahSequential(ayahNumber + 1, true);
      } else {
        setPlayingAyah(null);
        playingAyahRef.current = null;
      }
    };

    audio.onerror = (e) => {
      console.error(`Gagal memutar audio ayat ${ayahNumber}`, e);
      setAudioLoading(false);
      if (isPlayingFullRef.current) {
        // Skip to next verse if one fails
        playAyahSequential(ayahNumber + 1, true);
      } else {
        setPlayingAyah(null);
        playingAyahRef.current = null;
      }
    };

    try {
      await audio.play();
    } catch (err) {
      console.error("Audio playback error:", err);
      setAudioLoading(false);
    }
  };

  // 5. Toggle Play / Pause Single Ayah Audio
  const togglePlayAyahAudio = (ayahNumber: number, _audioUrl?: string) => {
    if (playingAyah === ayahNumber) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingFull(false);
      isPlayingFullRef.current = false;
      setPlayingAyah(null);
      playingAyahRef.current = null;
    } else {
      // Play this single ayah
      playAyahSequential(ayahNumber, false);
    }
  };

  // 6. Toggle Play / Pause Full Surah Audio (Sequential Sync)
  const togglePlayFullAudio = () => {
    if (isPlayingFull) {
      // Pause full audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingFull(false);
      isPlayingFullRef.current = false;
    } else {
      // Resume from current ayah or start from beginning
      const startAyah = playingAyah || 1;
      playAyahSequential(startAyah, true);
    }
  };

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load bookmarks & saved Qori from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alquran_bookmarks");
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
      const savedQori = localStorage.getItem("alquran_selected_qori");
      if (savedQori && QORI_LIST.some((q) => q.id === savedQori)) {
        setSelectedQori(savedQori);
        selectedQoriRef.current = savedQori;
      }
    } catch (e) {
      console.error("Gagal memuat preferensi dari localStorage", e);
    }
  }, []);

  const handleQoriChange = (newQoriId: string) => {
    setSelectedQori(newQoriId);
    selectedQoriRef.current = newQoriId;
    try {
      localStorage.setItem("alquran_selected_qori", newQoriId);
    } catch (e) {
      console.error("Gagal menyimpan qori ke localStorage", e);
    }
    const qoriName = QORI_LIST.find((q) => q.id === newQoriId)?.name || "Qari";
    showToast(`Qari diubah ke ${qoriName}`);

    // If audio is currently playing, replay seamlessly with new reciter
    if (playingAyahRef.current !== null) {
      playAyahSequential(playingAyahRef.current, isPlayingFullRef.current, newQoriId);
    }
  };

  const saveBookmarksToStorage = (items: BookmarkItem[]) => {
    setBookmarks(items);
    try {
      localStorage.setItem("alquran_bookmarks", JSON.stringify(items));
    } catch (e) {
      console.error("Gagal menyimpan bookmark ke localStorage", e);
    }
  };

  // Action: Bookmark Toggle
  const toggleBookmark = (item: any) => {
    const surahNum = selectedSurahId;
    const surahName = currentSurah?.name || surahDetail?.name || `Surat ${surahNum}`;
    const id = `${surahNum}-${item.ayah_number}`;

    const exists = bookmarks.some((b) => b.id === id);
    if (exists) {
      const updated = bookmarks.filter((b) => b.id !== id);
      saveBookmarksToStorage(updated);
      showToast(`${surahName} Ayat ${item.ayah_number} dihapus dari bookmark`);
    } else {
      const newItem: BookmarkItem = {
        id,
        surahNumber: surahNum,
        surahName,
        ayahNumber: item.ayah_number,
        arab: item.arab,
        translation: item.translation,
        createdAt: Date.now(),
      };
      const updated = [newItem, ...bookmarks];
      saveBookmarksToStorage(updated);
      showToast(`${surahName} Ayat ${item.ayah_number} ditambahkan ke bookmark`);
    }
  };

  const removeBookmarkById = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarksToStorage(updated);
    showToast("Bookmark berhasil dihapus");
  };

  const clearAllBookmarks = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua bookmark?")) {
      saveBookmarksToStorage([]);
      showToast("Semua bookmark telah dibersihkan");
    }
  };

  const handleOpenBookmark = async (bookmark: BookmarkItem) => {
    setShowBookmarkModal(false);
    if (selectedSurahId !== bookmark.surahNumber) {
      setSelectedSurahId(bookmark.surahNumber);
      setTimeout(() => {
        const el = document.getElementById(`ayah-${bookmark.ayahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 700);
    } else {
      const el = document.getElementById(`ayah-${bookmark.ayahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Action: Copy
  const copyAyah = (item: any) => {
    const textToCopy = `${surahDetail?.name || ""} Ayat ${item.ayah_number}:\n\n${item.arab}\n\n${item.latin || ""}\n\nArtinya:\n"${item.translation}"`;
    navigator.clipboard.writeText(textToCopy);
    showToast(`Ayat ${item.ayah_number} berhasil disalin!`);
  };

  // Action: Share
  const shareAyah = async (item: any) => {
    const shareData = {
      title: `${surahDetail?.name || "Al-Qur'an"} - Ayat ${item.ayah_number}`,
      text: `${item.arab}\n\n"${item.translation}"`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      copyAyah(item);
    }
  };

  // Filter daftar surat berdasarkan search
  const filteredSurahs = alquranData.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.translation?.toLowerCase().includes(q) ||
      item.name_arabic?.includes(q) ||
      item.number.toString().includes(q)
    );
  });

  const currentSurah =
    alquranData.find((s) => s.number === selectedSurahId) || surahDetail;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fbf7ee] text-stone-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-600 animate-fade-in">
          <Icon icon="solar:check-circle-bold" className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop overlay saat sidebar terbuka di mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-stone-900/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR: DAFTAR SURAT ================= */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 h-screen border-r border-[#e8dfcf] bg-[#f5efe2] flex flex-col shadow-xl md:shadow-none transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0 w-[82vw] max-w-[340px]" : "-translate-x-full md:translate-x-0"
        } ${
          isDesktopSidebarOpen ? "md:w-[320px] lg:w-[360px]" : "md:hidden"
        }`}
      >
        {/* Header Sidebar */}
        <div className="p-4 sm:p-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Daftar Surat
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowBookmarkModal(true)}
                title="Buka Daftar Bookmark"
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100/70 hover:bg-amber-100 border border-amber-300/80 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs group"
              >
                <Icon icon="solar:bookmark-bold" className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Bookmark ({bookmarks.length})</span>
              </button>
              {/* Tombol Tutup Sidebar di Mobile */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#e8dfcf] transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative flex items-center">
            <Icon
              icon="solar:magnifer-linear"
              className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surat..."
              className="w-full bg-[#fdfbf7] border border-[#dcd1be] rounded-xl py-2 pl-9 pr-8 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-0.5 rounded-full"
              >
                <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* List Surat Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d6cbba] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {loadingList ? (
            <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <Icon icon="line-md:loading-loop" className="w-4 h-4 text-emerald-700" />
              <span>Memuat daftar surat...</span>
            </div>
          ) : filteredSurahs.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-400">
              Surat "{searchQuery}" tidak ditemukan
            </div>
          ) : (
            filteredSurahs.map((item) => {
              const isSelected = selectedSurahId === item.number;
              return (
                <div
                  key={item.number}
                  onClick={() => {
                    setSelectedSurahId(item.number);
                    setIsSidebarOpen(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? "border-emerald-600/80 bg-[#e6eee5] shadow-xs"
                      : "border-transparent hover:border-[#dfd5c3] hover:bg-[#eae2d2]"
                  }`}
                >
                  {/* Sisi Kiri: Nomor & Nama Latin */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-emerald-600 text-emerald-800 bg-emerald-100/70"
                          : "border-amber-400 text-amber-800 bg-amber-100/60"
                      }`}
                    >
                      {item.number}
                    </span>
                    <div>
                      <h4
                        className={`text-sm font-semibold leading-tight ${
                          isSelected ? "text-emerald-900 font-bold" : "text-stone-800"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.translation}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] bg-[#e9decb] text-stone-700 px-2 py-0.5 rounded-full border border-[#dcd0bc]">
                          {item.revelation}
                        </span>
                        <span className="text-[10px] bg-[#e9decb] text-stone-700 px-2 py-0.5 rounded-full border border-[#dcd0bc]">
                          {item.number_of_ayahs}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sisi Kanan: Nama Arab */}
                  <div className="text-right">
                    <span
                      className={`text-lg font-serif font-medium ${
                        isSelected ? "text-emerald-800" : "text-emerald-700"
                      }`}
                    >
                      {item.name_arabic || item.name}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ================= MAIN CONTENT: ISI SURAT ================= */}
      <main className="flex-1 h-screen overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 bg-[#fbf7ee] flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#d6cbba] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {/* Header Atas: Toggle Sidebar + Kembali & Daftar Bookmark */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Tombol Buka / Tutup Sidebar */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen((prev) => !prev);
                } else {
                  setIsDesktopSidebarOpen((prev) => !prev);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#fffef9] border border-[#dcd1be] hover:border-emerald-600 text-stone-700 hover:text-emerald-800 text-xs sm:text-sm font-medium shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Buka / Tutup Daftar Surat"
            >
              <Icon
                icon={
                  isDesktopSidebarOpen
                    ? "solar:sidebar-minimalistic-linear"
                    : "solar:sidebar-minimalistic-bold"
                }
                className="w-4 h-4 text-emerald-800 shrink-0"
              />
              <span className="hidden sm:inline">
                {isDesktopSidebarOpen ? "Tutup Sidebar" : "Daftar Surat"}
              </span>
              <span className="sm:hidden font-medium">Surat</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-stone-500 hover:text-emerald-800 font-medium transition-colors ml-1"
            >
              <Icon icon="solar:arrow-left-linear" className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Kembali ke Beranda</span>
              <span className="md:hidden">Beranda</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowBookmarkModal(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#fffef9] border border-[#dcd1be] hover:border-amber-400 text-stone-700 hover:text-amber-800 text-xs sm:text-sm font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer group shrink-0"
          >
            <Icon icon="solar:bookmark-bold" className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline">Daftar Bookmark</span>
            <span className="sm:hidden">Bookmark</span>
            {bookmarks.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>

        {loadingDetail ? (
          <div className="flex-1 flex flex-col justify-center items-center gap-3">
            <Icon icon="line-md:loading-loop" className="w-8 h-8 text-emerald-700" />
            <p className="text-sm text-stone-500">Memuat surat & ayat...</p>
          </div>
        ) : surahDetail ? (
          <div>
            {/* 1. Header Banner Surat */}
            <div className="bg-[#fffef9] border border-[#e8dfcf] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-9 h-9 rounded-full border border-amber-500/70 text-amber-800 font-bold flex items-center justify-center text-sm bg-amber-100/60 shrink-0">
                  {currentSurah?.number || surahDetail.number}
                </span>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span>{currentSurah?.name || surahDetail.name}</span>
                    <span className="text-stone-500 font-normal text-xs sm:text-sm">
                      • {currentSurah?.translation || surahDetail.translation}
                    </span>
                  </h1>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                    {currentSurah?.revelation || surahDetail.revelation} •{" "}
                    {currentSurah?.number_of_ayahs || surahDetail.number_of_ayahs} Ayat
                  </p>
                </div>
              </div>

              {/* Nama Arab Surat */}
              <div className="text-right flex items-center justify-end gap-1.5 self-end sm:self-auto">
                <span className="text-2xl sm:text-3xl font-serif text-emerald-800 font-medium">
                  {currentSurah?.name_arabic || surahDetail.name}
                </span>
              </div>
            </div>

            {/* 2. Control Toolbar / Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 py-2 px-1 mb-4 sm:mb-6 text-xs text-stone-600">
              {/* Dropdown: Ayat & Qari */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Dropdown: Ayat */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-stone-500 font-medium">Ayat:</span>
                  <select
                    value={selectedAyahFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedAyahFilter(val);
                      if (val !== "all") {
                        const el = document.getElementById(`ayah-${val}`);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }
                    }}
                    className="bg-[#fffef9] border border-[#dcd1be] rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-stone-700 font-medium focus:outline-none focus:border-amber-600 shadow-2xs cursor-pointer"
                  >
                    <option value="all">Semua</option>
                    {surahDetail.ayahs?.map((a: any) => (
                      <option key={a.ayah_number} value={a.ayah_number}>
                        Ayat {a.ayah_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dropdown: Qari */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-stone-500 font-medium flex items-center gap-1">
                    <Icon icon="solar:user-speak-rounded-linear" className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                    <span>Qari:</span>
                  </span>
                  <select
                    value={selectedQori}
                    onChange={(e) => handleQoriChange(e.target.value)}
                    className="bg-[#fffef9] border border-[#dcd1be] hover:border-amber-400 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-600 shadow-2xs cursor-pointer transition-colors max-w-[210px] sm:max-w-none"
                  >
                    {Array.from(new Set(QORI_LIST.map((q) => q.category))).map(
                      (category) => (
                        <optgroup
                          key={category}
                          label={category}
                          className="font-semibold text-emerald-950 bg-[#eef5ee]"
                        >
                          {QORI_LIST.filter((q) => q.category === category).map(
                            (q) => (
                              <option
                                key={q.id}
                                value={q.id}
                                className="text-stone-800 bg-[#fffef9] font-normal"
                              >
                                {q.name}
                              </option>
                            )
                          )}
                        </optgroup>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Toggle Terjemahan & Play Audio Full */}
              <div className="flex items-center gap-5 flex-wrap">
                {/* Toggle Terjemahan */}
                <button
                  type="button"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <Icon icon="solar:book-bookmark-linear" className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>Terjemahan</span>
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      showTranslation ? "bg-emerald-600" : "bg-[#d8cbb8]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        showTranslation ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </button>

                {/* Tombol Play Audio Full */}
                <button
                  type="button"
                  onClick={togglePlayFullAudio}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer shadow-xs ${
                    isPlayingFull
                      ? "bg-emerald-700 text-white shadow-emerald-800/30"
                      : "text-emerald-800 bg-[#fffef9] hover:bg-emerald-50 border border-emerald-300"
                  }`}
                >
                  {isPlayingFull ? (
                    <>
                      <Icon icon="ant-design:pause-circle-outlined" className="w-5 h-5 text-white shrink-0" />
                      <span>Jeda Audio Full</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="ant-design:play-circle-outlined" className="w-5 h-5 text-emerald-800 shrink-0" />
                      <span>{playingAyah ? "Lanjutkan Audio Full" : "Play Audio Full"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Daftar Ayat (Card Warm Cream Paper) */}
            <div className="space-y-4">
              {surahDetail.ayahs?.map((item: any) => {
                const isPlayingThisAyah = playingAyah === item.ayah_number;
                const isBookmarked = bookmarks.some(
                  (b) => b.surahNumber === selectedSurahId && b.ayahNumber === item.ayah_number
                );

                return (
                  <div
                    key={item.ayah_number}
                    id={`ayah-${item.ayah_number}`}
                    className={`bg-[#fffef9] rounded-2xl p-5 border transition-all duration-300 shadow-2xs ${
                      isPlayingThisAyah
                        ? "border-emerald-600 ring-2 ring-emerald-500/30 bg-[#f2f8f1] shadow-md scale-[1.002]"
                        : "border-[#e8dfcf] hover:border-[#d6c9b4] hover:shadow-xs"
                    }`}
                  >
                    {/* Baris Atas: Nomor Ayat + Aksi (Kiri) & Teks Arab (Kanan) */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Kontrol Kiri: Nomor + Tombol Play / Bookmark / Copy / Share */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                        {/* Nomor Ayat */}
                        <span
                          className={`w-7 h-7 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 transition-colors ${
                            isPlayingThisAyah
                              ? "border-emerald-600 text-emerald-800 bg-emerald-100 font-bold"
                              : "border-amber-400 text-amber-800 bg-amber-100/60"
                          }`}
                        >
                          {item.ayah_number}
                        </span>

                        {/* Play Icon */}
                        <button
                          type="button"
                          onClick={() => togglePlayAyahAudio(item.ayah_number, item.audio_url)}
                          title={isPlayingThisAyah ? "Jeda Audio Ayat" : "Putar Audio Ayat"}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            isPlayingThisAyah
                              ? "text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/60"
                              : "text-stone-500 hover:text-emerald-700 hover:bg-[#eee6d5]"
                          }`}
                        >
                          {audioLoading && isPlayingThisAyah ? (
                            <Icon icon="line-md:loading-loop" className="w-4 h-4 text-emerald-700" />
                          ) : isPlayingThisAyah ? (
                            <Icon icon="ant-design:pause-circle-outlined" className="w-4.5 h-4.5 text-emerald-700" />
                          ) : (
                            <Icon icon="ant-design:play-circle-outlined" className="w-4.5 h-4.5" />
                          )}
                        </button>

                        {/* Bookmark Icon */}
                        <button
                          type="button"
                          onClick={() => toggleBookmark(item)}
                          title={isBookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isBookmarked
                              ? "text-amber-500 hover:bg-amber-100/60"
                              : "text-stone-400 hover:text-amber-600 hover:bg-[#eee6d5]"
                          }`}
                        >
                          {isBookmarked ? (
                            <Icon icon="solar:bookmark-bold" className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Icon icon="solar:bookmark-linear" className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copy Icon */}
                        <button
                          type="button"
                          onClick={() => copyAyah(item)}
                          title="Salin Ayat"
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-stone-400 hover:text-stone-700 hover:bg-[#eee6d5] transition-colors cursor-pointer"
                        >
                          <Icon icon="solar:copy-linear" className="w-4 h-4" />
                        </button>

                        {/* Share Icon */}
                        <button
                          type="button"
                          onClick={() => shareAyah(item)}
                          title="Bagikan Ayat"
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-stone-400 hover:text-stone-700 hover:bg-[#eee6d5] transition-colors cursor-pointer"
                        >
                          <Icon icon="solar:share-linear" className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Teks Arab: Ukuran Besar & Rata Kanan */}
                      <div className="flex-1 text-right">
                        <p className="text-2xl md:text-3xl font-serif text-[#221f1b] leading-loose tracking-wide font-normal">
                          {item.arab}
                        </p>
                      </div>
                    </div>

                    {/* Baris Bawah: Transliterasi & Terjemahan */}
                    {(showLatin || showTranslation) && (
                      <div className="mt-4 pt-3 border-t border-[#ede5d5] space-y-1.5">
                        {showLatin && item.latin && (
                          <p className="text-sm text-emerald-900/90 italic font-serif leading-relaxed">
                            {item.latin}
                          </p>
                        )}
                        {showTranslation && (
                          <p className="text-sm text-stone-700 leading-relaxed font-sans">
                            {item.translation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 4. Tombol Muat Lebih Banyak */}
            {hasMore && (
              <div className="mt-8 flex flex-col items-center gap-2 pb-10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-medium text-sm transition-all shadow-md shadow-emerald-800/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <Icon icon="line-md:loading-loop" className="w-4 h-4 animate-spin" />
                      <span>Memuat ayat berikutnya...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:refresh-circle-linear" className="w-4 h-4" />
                      <span>Muat 20 Ayat Lebih Banyak</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-stone-500">
                  Menampilkan {surahDetail.ayahs?.length} dari{" "}
                  {currentSurah?.number_of_ayahs || surahDetail.number_of_ayahs} ayat
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-stone-400 text-sm">Pilih surat untuk melihat isi.</p>
          </div>
        )}
      </main>

      {/* ================= MODAL DAFTAR BOOKMARK ================= */}
      {showBookmarkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowBookmarkModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#fffef9] border border-[#e8dfcf] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-[#e8dfcf] bg-[#fbf7ee] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-300 shadow-2xs shrink-0">
                  <Icon icon="solar:bookmark-bold" className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                      Daftar Bookmark Ayat
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/70">
                      {bookmarks.length} Disimpan
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Tersimpan otomatis di penyimpanan lokal browser (localStorage)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBookmarkModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-[#eee6d5] transition-colors cursor-pointer"
              >
                <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal: List Bookmarks */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d6cbba] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {bookmarks.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 mb-3 shadow-inner">
                    <Icon icon="solar:bookmark-linear" className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-semibold text-stone-800 mb-1">
                    Belum ada bookmark tersimpan
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                    Tandai ayat favorit Anda dengan menekan ikon bookmark pada setiap ayat untuk menyimpannya di sini.
                  </p>
                </div>
              ) : (
                bookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#fcfaf4] hover:bg-white border border-[#e8dfcf] hover:border-amber-400/80 rounded-xl p-4 transition-all duration-200 shadow-2xs hover:shadow-xs group"
                  >
                    {/* Header Item Bookmark */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0e8db]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center border border-amber-300/60">
                          {b.ayahNumber}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-900">
                          {b.surahName}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          • Ayat {b.ayahNumber}
                        </span>
                      </div>
                      {b.createdAt && (
                        <span className="text-[11px] text-stone-400 hidden sm:inline">
                          {new Date(b.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Teks Arab */}
                    <p className="text-right text-lg sm:text-xl font-serif text-[#221f1b] leading-relaxed mb-2 font-normal">
                      {b.arab}
                    </p>

                    {/* Terjemahan */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3 font-sans">
                      "{b.translation}"
                    </p>

                    {/* Aksi */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f0e8db]">
                      <button
                        type="button"
                        onClick={() => handleOpenBookmark(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <span>Buka Ayat Ini</span>
                        <Icon icon="solar:arrow-right-linear" className="w-3.5 h-3.5 text-emerald-700" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBookmarkById(b.id)}
                        title="Hapus Bookmark"
                        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-3 sm:p-4 bg-[#fbf7ee] border-t border-[#e8dfcf] flex items-center justify-between text-xs text-stone-500">
              <div>
                {bookmarks.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllBookmarks}
                    className="text-red-600 hover:text-red-700 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Icon icon="solar:trash-bin-trash-linear" className="w-3.5 h-3.5" />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowBookmarkModal(false)}
                className="px-4 py-2 rounded-xl bg-[#fffef9] border border-[#dcd1be] hover:bg-stone-100 text-stone-700 font-medium cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
