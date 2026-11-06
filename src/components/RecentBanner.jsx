import React from "react";

export default function RecentBanner({ onStartSeries }) {
  return (
    <section className="recent-banner" aria-label="Exercise series">
      <div className="recent-banner-copy">
        <h2>Mix it up with a series</h2>
        <p>
          Chain several moves back to back, tune the reps for each, and run them
          as one varied session.
        </p>
        <p className="recent-banner-benefits">
          Combining exercises keeps sessions engaging, trains more muscle groups
          per workout, and reduces repetitive strain — all while keeping your
          rest and reps flexible.
        </p>
      </div>
      <div className="recent-banner-action">
        <button className="series-cta" onClick={onStartSeries}>
          Start series setup →
        </button>
      </div>
    </section>
  );
}
