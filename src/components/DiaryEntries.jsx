import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from './icons';

const CHIP_CAP = 12; // max episode chips per season before the "+N" toggle

function DiarySeason({ showId, showName, dateISO, season, episodes, onEditEpisode, onDeleteEpisode }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const manage = !!onEditEpisode; // in the modal we can edit/remove entries
  const hidden = episodes.length - CHIP_CAP;
  const visible = expanded ? episodes : episodes.slice(0, CHIP_CAP);

  return (
    <div className="diary-season">
      <button
        className="diary-season-label"
        onClick={() => navigate(`/show/${showId}?season=${season}`)}
      >
        Season {season}
      </button>
      <div className="diary-episodes">
        {visible.map((ep) =>
          manage ? (
            <span key={ep} className="diary-ep-manage">
              <button
                className="diary-ep-label"
                title="Edit entry"
                onClick={() => onEditEpisode({ showId, showName, season, episode: ep, dateISO })}
              >
                E{ep}
              </button>
              <button
                className="diary-ep-x"
                title="Remove entry"
                onClick={() => onDeleteEpisode({ showId, season, episode: ep })}
              >
                <XIcon size={11} />
              </button>
            </span>
          ) : (
            <button
              key={ep}
              className="diary-ep-chip"
              title={`Season ${season}, Episode ${ep}`}
              onClick={() => navigate(`/show/${showId}/season/${season}/episode/${ep}`)}
            >
              E{ep}
            </button>
          )
        )}
        {hidden > 0 && (
          <button className="diary-ep-toggle" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : `+${hidden}`}
          </button>
        )}
      </div>
    </div>
  );
}

// displays an ordered array of day->show blocks, inserting a date header when the day changes.
export default function DiaryEntries({ blocks, onEditEpisode, onDeleteEpisode }) {
  const navigate = useNavigate();

  return blocks.map((block, i) => {
    const showHeader = i === 0 || block.dayKey !== blocks[i - 1].dayKey;
    return (
      <Fragment key={`${block.dayKey}|${block.showId}`}>
        {showHeader && <div className="diary-day-header">{block.dayLabel}</div>}
        <div className="diary-show">
          {block.posterUrl && (
            <img
              className="diary-show-poster clickable"
              src={block.posterUrl}
              alt={block.showName}
              onClick={() => navigate(`/show/${block.showId}`)}
            />
          )}
          <div className="diary-show-body">
            <button className="diary-show-name" onClick={() => navigate(`/show/${block.showId}`)}>
              {block.showName}
              <span className="diary-show-count">{block.count} ep{block.count === 1 ? '' : 's'}</span>
            </button>
            {block.seasons.map((s) => (
              <DiarySeason
                key={s.season}
                showId={block.showId}
                showName={block.showName}
                dateISO={block.dateISO}
                season={s.season}
                episodes={s.episodes}
                onEditEpisode={onEditEpisode}
                onDeleteEpisode={onDeleteEpisode}
              />
            ))}
          </div>
        </div>
      </Fragment>
    );
  });
}
