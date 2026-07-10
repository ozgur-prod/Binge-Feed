import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, favoritesAPI, listsAPI, progressAPI } from '../services/api';

function relativeDay(date) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
}

// group the flat watch history (newest first) into ordered day->show blocks, each holding
// that show's seasons/episodes watched on that day. Keeps chronology and stays compact.
function buildDiary(entries) {
  const blocks = [];
  const byKey = new Map();
  for (const e of entries) {
    const d = new Date(e.watchedAt);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const key = `${dayKey}|${e.showId}`;
    let block = byKey.get(key);
    if (!block) {
      block = {
        dayKey,
        dayLabel: relativeDay(d),
        dateISO: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        showId: e.showId,
        showName: e.showName,
        posterUrl: e.posterUrl,
        count: 0,
        seasons: [],
        seasonMap: new Map(),
      };
      byKey.set(key, block);
      blocks.push(block);
    }
    block.count += 1;
    let season = block.seasonMap.get(e.season);
    if (!season) {
      season = { season: e.season, episodes: [] };
      block.seasonMap.set(e.season, season);
      block.seasons.push(season);
    }
    season.episodes.push(e.episode);
  }
  for (const block of blocks) {
    block.seasons.sort((a, b) => a.season - b.season);
    for (const s of block.seasons) s.episodes.sort((a, b) => a - b);
  }
  return blocks;
}

// loads a profile and returns its data plus the actions to change it
// with no handle it loads your own profile, with a handle it loads that user's (read-only unless it is you)
export function useProfile(handle) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadedKey, setLoadedKey] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryTotal, setDiaryTotal] = useState(0);
  const [diaryShowCount, setDiaryShowCount] = useState(0);
  const [diaryHasMore, setDiaryHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const editable = !handle || Boolean(user?.isSelf);
  // derived loading flag (avoids resetting state synchronously inside the effect on route change)
  const routeKey = handle || '@me';
  const loading = loadedKey !== routeKey;
  const diaryBlocks = useMemo(() => buildDiary(diaryEntries), [diaryEntries]);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const key = handle || '@me';
    const load = handle ? usersAPI.getUserByHandle(handle) : usersAPI.getMe();
    load
      .then(({ user: u }) => {
        if (cancelled) return;
        setError('');
        setUser(u);
        setFavorites([]);
        setLists([]);
        setDiaryEntries([]);
        const canEdit = !handle || u.isSelf;
        favoritesAPI
          .list(u.id)
          .then((f) => !cancelled && setFavorites(f.favorites))
          .catch(console.error);
        listsAPI
          .list(u.id)
          .then((l) => !cancelled && setLists(l.lists))
          .catch(console.error);
        (canEdit ? progressAPI.history() : progressAPI.userHistory(u.id))
          .then((h) => {
            if (cancelled) return;
            setDiaryEntries(h.diary);
            setDiaryTotal(h.total);
            setDiaryShowCount(h.showCount);
            setDiaryHasMore(h.hasMore);
          })
          .catch(console.error);
      })
      .catch((err) => {
        if (cancelled) return;
        setUser(null);
        if (!handle && (err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('auth'))) {
          navigate('/login');
        } else {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(key);
      });

    return () => {
      cancelled = true;
    };
  }, [handle, navigate]);

  async function toggleFollow() {
    if (!user) return;
    setBusy(true);
    try {
      if (user.isFollowing) {
        await usersAPI.unfollow(user.id);
        setUser((u) => ({ ...u, isFollowing: false, followersCount: u.followersCount - 1 }));
      } else {
        await usersAPI.follow(user.id);
        setUser((u) => ({ ...u, isFollowing: true, followersCount: u.followersCount + 1 }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeFavorite(showId) {
    await favoritesAPI.remove(showId);
    setFavorites((prev) => prev.filter((f) => f.showId !== showId));
  }

  async function addFavorite(show) {
    await favoritesAPI.add({ showId: show.id });
    setFavorites((prev) => [
      {
        showId: show.id,
        showName: show.name,
        posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : null,
      },
      ...prev,
    ]);
  }

  function reloadDiary() {
    progressAPI
      .history()
      .then((h) => {
        setDiaryEntries(h.diary);
        setDiaryTotal(h.total);
        setDiaryShowCount(h.showCount);
        setDiaryHasMore(h.hasMore);
      })
      .catch(console.error);
  }

  async function deleteDiaryEntry(entry) {
    try {
      await progressAPI.unmark({ showId: entry.showId, season: entry.season, episode: entry.episode });
      reloadDiary();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMoreDiary() {
    if (!user) return;
    setLoadingMore(true);
    try {
      const h = editable
        ? await progressAPI.history({ skip: diaryEntries.length })
        : await progressAPI.userHistory(user.id, { skip: diaryEntries.length });
      setDiaryEntries((prev) => [...prev, ...h.diary]);
      setDiaryHasMore(h.hasMore);
      setDiaryTotal(h.total);
      setDiaryShowCount(h.showCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  function saveProfile(updatedUser) {
    setUser(updatedUser);
    const storage = localStorage.getItem('user') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(updatedUser));
  }

  return {
    user,
    editable,
    loading,
    error,
    busy,
    favorites,
    addFavorite,
    removeFavorite,
    lists,
    setLists,
    diaryBlocks,
    diaryTotal,
    diaryShowCount,
    diaryHasMore,
    loadingMore,
    reloadDiary,
    deleteDiaryEntry,
    loadMoreDiary,
    toggleFollow,
    saveProfile,
  };
}
