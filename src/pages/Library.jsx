import React, { useState } from "react";
import { exercises, findExercises } from "../domain/library";
import Preview from "../components/Preview";
import RecentBanner from "../components/RecentBanner";
export default function Library({
  data,
  onFavorite,
  onSelect,
  onDetails,
  onStartSeries,
}) {
  const [query, setQuery] = useState(""),
    [muscle, setMuscle] = useState("all"),
    [equipment, setEquipment] = useState("all"),
    [tab, setTab] = useState("recent");
  const list = findExercises({ query, muscle, equipment });
  return (
    <>
      <header>
        <h1>Exercise library</h1>
        <p>Find your next move.</p>
      </header>
      <RecentBanner onStartSeries={onStartSeries} />
      <div className="tabs">
        <button
          aria-pressed={tab === "recent"}
          onClick={() => setTab("recent")}
        >
          Recently used
        </button>
        <button
          aria-pressed={tab === "favorites"}
          onClick={() => setTab("favorites")}
        >
          Favourites
        </button>
      </div>
      <div className="shortcuts">
        {data[tab].map((id) => {
          const e = exercises.find((e) => e.id === id);
          return (
            e && (
              <button key={id} onClick={() => onSelect(e)}>
                <strong>{e.name}</strong>
                <span>{e.equipment} →</span>
              </button>
            )
          );
        })}
        {!data[tab].length && (
          <p className="muted">Star an exercise to keep it here.</p>
        )}
      </div>
      <div className="section-heading">
        <h2>All exercises</h2>
        <span>
          {list.length} of {exercises.length}
        </span>
      </div>
      <div className="filters">
        <input
          type="search"
          aria-label="Search exercises"
          placeholder="Search exercises or muscles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Muscle group"
          value={muscle}
          onChange={(e) => setMuscle(e.target.value)}
        >
          <option value="all">All muscle groups</option>
          {[...new Set(exercises.map((e) => e.group))].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select
          aria-label="Equipment"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
        >
          <option value="all">All equipment</option>
          {[...new Set(exercises.map((e) => e.equipment))].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="exercise-grid">
        {list.map((e) => (
          <article className="exercise-card" key={e.id}>
            <div className={`exercise-art ${e.tone}`}>
              <button
                className="favorite"
                aria-label={`Favourite ${e.name}`}
                aria-pressed={data.favorites.includes(e.id)}
                onClick={() => onFavorite(e.id)}
              >
                {data.favorites.includes(e.id) ? "★" : "☆"}
              </button>
              <button
                className="art-button"
                aria-label={`View ${e.name}`}
                onClick={() => onDetails(e)}
              >
                <Preview exercise={e} />
              </button>
            </div>
            <div className="exercise-body">
              <h3>{e.name}</h3>
              <p className="accent">{e.primary.join(" · ")}</p>
              <p>{e.desc}</p>
              <div className="meta">
                {e.equipment} · {e.view}
              </div>
              <div className="actions">
                <button onClick={() => onDetails(e)}>Details</button>
                <button className="primary" onClick={() => onSelect(e)}>
                  Start setup →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!list.length && (
        <div className="card empty">
          <h2>No exercises found</h2>
          <button
            onClick={() => {
              setQuery("");
              setMuscle("all");
              setEquipment("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
