import React, { useState } from "react";
import {
  exercises,
  findExercises,
  prioritizedExercises,
} from "../domain/library";
import Preview from "../components/Preview";
import * as Tabs from "@radix-ui/react-tabs";
import { Star } from "lucide-react";
import FilterSelect from "../components/FilterSelect";
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
    [filter, setFilter] = useState("all");
  const recentIds = data.recent;
  const favoriteIds = data.favorites;
  let list = findExercises({ query, muscle, equipment });
  if (filter === "recent") list = list.filter((e) => recentIds.includes(e.id));
  else if (filter === "favorites")
    list = list.filter((e) => favoriteIds.includes(e.id));
  else list = prioritizedExercises(list, recentIds, favoriteIds);
  return (
    <>
      <header>
        <h1>Exercise library</h1>
        <p>Find your next move.</p>
      </header>
      <RecentBanner onStartSeries={onStartSeries} />
      <Tabs.Root value={filter} onValueChange={setFilter}>
        <div className="library-head">
          <div className="library-head-left">
            <div className="section-heading">
              <h2>All exercises</h2>
              <span role="status" aria-atomic="true">
                {list.length} of {exercises.length}
              </span>
            </div>
            <Tabs.List
              className="library-filters tabs"
              aria-label="Exercise library views"
            >
              <Tabs.Trigger value="all">All</Tabs.Trigger>
              <Tabs.Trigger value="recent">Recently used</Tabs.Trigger>
              <Tabs.Trigger value="favorites">Favourites</Tabs.Trigger>
            </Tabs.List>
          </div>
          <div className="filters">
            <input
              type="search"
              aria-label="Search exercises"
              placeholder="Search exercises or muscles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <FilterSelect
              label="Muscle group"
              value={muscle}
              onChange={setMuscle}
              options={[
                { value: "all", label: "All muscle groups" },
                ...[...new Set(exercises.map((e) => e.group))].map((value) => ({
                  value,
                  label: value,
                })),
              ]}
            />
            <FilterSelect
              label="Equipment"
              value={equipment}
              onChange={setEquipment}
              options={[
                { value: "all", label: "All equipment" },
                ...[...new Set(exercises.map((e) => e.equipment))].map(
                  (value) => ({ value, label: value }),
                ),
              ]}
            />
          </div>
        </div>
        <Tabs.Content value={filter}>
          <div className="exercise-grid">
            {list.map((e) => {
              const isRecent = recentIds.includes(e.id);
              const isFavorite = favoriteIds.includes(e.id);
              return (
                <article className="exercise-card" key={e.id}>
                  <div className={`exercise-art ${e.tone}`}>
                    {isRecent && (
                      <span className="badge-recent">Recently used</span>
                    )}
                    <button
                      className="favorite"
                      aria-label={
                        isFavorite
                          ? `Remove ${e.name} from favourites`
                          : `Add ${e.name} to favourites`
                      }
                      aria-pressed={isFavorite}
                      onClick={() => onFavorite(e.id)}
                    >
                      <Star
                        size={21}
                        strokeWidth={1.7}
                        fill={isFavorite ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
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
              );
            })}
          </div>
          {!list.length && (
            <div className="card empty">
              <h2>No exercises found</h2>
              <button
                onClick={() => {
                  setQuery("");
                  setMuscle("all");
                  setEquipment("all");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
