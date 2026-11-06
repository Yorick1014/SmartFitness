import React, { useState } from "react";
import { exercises, findExercises } from "../domain/library";
import Preview from "../components/Preview";
import * as Tabs from "@radix-ui/react-tabs";
import { Star } from "lucide-react";
import FilterSelect from "../components/FilterSelect";
export default function Library({ data, onFavorite, onSelect, onDetails }) {
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
      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="tabs" aria-label="Exercise shortcuts">
          <Tabs.Trigger value="recent">Recently used</Tabs.Trigger>
          <Tabs.Trigger value="favorites">Favourites</Tabs.Trigger>
        </Tabs.List>
        {["recent", "favorites"].map((key) => (
          <Tabs.Content key={key} value={key} className="shortcuts">
            {data[key].map((id) => {
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
            {!data[key].length && (
              <p className="muted">Star an exercise to keep it here.</p>
            )}
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <div className="section-heading">
        <h2>All exercises</h2>
        <span role="status" aria-atomic="true">
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
        <FilterSelect
          label="Muscle group"
          value={muscle}
          onChange={setMuscle}
          options={[
            { value: "all", label: "All muscle groups" },
            ...[...new Set(exercises.map((e) => e.group))].map((g) => ({
              value: g,
              label: g,
            })),
          ]}
        />
        <FilterSelect
          label="Equipment"
          value={equipment}
          onChange={setEquipment}
          options={[
            { value: "all", label: "All equipment" },
            ...[...new Set(exercises.map((e) => e.equipment))].map((g) => ({
              value: g,
              label: g,
            })),
          ]}
        />
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
                <Star
                  size={21}
                  strokeWidth={1.7}
                  fill={data.favorites.includes(e.id) ? "currentColor" : "none"}
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
