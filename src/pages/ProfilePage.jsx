import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import Header from '../components/Header';
import AdBox from '../components/AdBox';
import ProfileHeader from '../components/ProfileHeader';
import ProfileFavorites from '../components/ProfileFavorites';
import ProfileDiary from '../components/ProfileDiary';
import ProfileLists from '../components/ProfileLists';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';
import FavoritesModal from '../components/FavoritesModal';
import ListsModal from '../components/ListsModal';
import DiaryModal from '../components/DiaryModal';
import LogModal from '../components/LogModal';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { handle } = useParams(); // present on /user/:handle, absent on /profile (own profile)
  const p = useProfile(handle);

  // modal / view state (data lives in the hook)
  const [showEdit, setShowEdit] = useState(false);
  const [followModal, setFollowModal] = useState(null);
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [showLists, setShowLists] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryStartManage, setDiaryStartManage] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  return (
    <div className="profile-page">
      <Header active={p.editable ? 'profile' : undefined} />

      <div className="profile-layout">
        <div className="feed-ad-col">
          <AdBox className="feed-ad" />
          <AdBox className="feed-ad" text="Another ad could be here" />
        </div>

        <main className="profile-main">
          <div className="profile-content">
            {p.loading ? (
              <p className="profile-loading">Loading…</p>
            ) : p.error ? (
              <p className="profile-error">{p.error}</p>
            ) : p.user ? (
              <>
                <ProfileHeader
                  key={p.user.id}
                  user={p.user}
                  editable={p.editable}
                  busy={p.busy}
                  onEdit={() => setShowEdit(true)}
                  onFollow={p.toggleFollow}
                  onOpenFollowers={() => setFollowModal('followers')}
                  onOpenFollowing={() => setFollowModal('following')}
                />

                <ProfileFavorites
                  favorites={p.favorites}
                  editable={p.editable}
                  onManage={() => setShowAllFavorites(true)}
                />

                <ProfileDiary
                  blocks={p.diaryBlocks}
                  total={p.diaryTotal}
                  showCount={p.diaryShowCount}
                  hasMore={p.diaryHasMore}
                  editable={p.editable}
                  onLog={() => setShowLog(true)}
                  onManageAll={() => { setDiaryStartManage(true); setShowDiary(true); }}
                  onViewAll={() => { setDiaryStartManage(false); setShowDiary(true); }}
                />

                {p.editable && p.user.tier === 'premium' && (
                  <button className="cancel-premium-btn" onClick={() => navigate('/premium/cancel')}>
                    Cancel Premium
                  </button>
                )}
              </>
            ) : null}
          </div>

          <aside className="profile-sidebar">
            <AdBox />
            {!p.loading && p.user && (
              <ProfileLists lists={p.lists} editable={p.editable} onManage={() => setShowLists(true)} />
            )}
          </aside>
        </main>

        <div className="feed-ad-col">
          <AdBox className="feed-ad" />
          <AdBox className="feed-ad" text="Another ad could be here" />
        </div>
      </div>

      {showEdit && p.editable && p.user && (
        <EditProfileModal user={p.user} onClose={() => setShowEdit(false)} onSaved={p.saveProfile} />
      )}

      {followModal && p.user && (
        <FollowListModal userId={p.user.id} type={followModal} onClose={() => setFollowModal(null)} />
      )}

      {showAllFavorites && p.editable && (
        <FavoritesModal
          favorites={p.favorites}
          onAdd={p.addFavorite}
          onRemove={p.removeFavorite}
          onClose={() => setShowAllFavorites(false)}
        />
      )}

      {showLists && (
        <ListsModal lists={p.lists} setLists={p.setLists} readOnly={!p.editable} onClose={() => setShowLists(false)} />
      )}

      {showDiary && (
        <DiaryModal
          blocks={p.diaryBlocks}
          total={p.diaryTotal}
          showCount={p.diaryShowCount}
          hasMore={p.diaryHasMore}
          loadingMore={p.loadingMore}
          onLoadMore={p.loadMoreDiary}
          onEditEpisode={setEditEntry}
          onDeleteEpisode={p.deleteDiaryEntry}
          initialManage={diaryStartManage}
          canManage={p.editable}
          onClose={() => setShowDiary(false)}
        />
      )}

      {(showLog || editEntry) && p.editable && (
        <LogModal
          initial={editEntry}
          onSaved={p.reloadDiary}
          onClose={() => { setShowLog(false); setEditEntry(null); }}
        />
      )}
    </div>
  );
}

export default ProfilePage;
