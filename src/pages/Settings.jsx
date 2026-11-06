import React, { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { CircleHelp } from "lucide-react";

const VOICE_DEMO = ["Start", "Pause", "Resume", "End"];

function HelpTip({ text }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className="help-tip-btn"
          aria-label={`About: ${text}`}
        >
          <CircleHelp size={15} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="ui-tooltip"
          sideOffset={8}
          collisionPadding={12}
        >
          {text}
          <Tooltip.Arrow className="ui-tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function SettingRow({ title, tip, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-label">
        <span className="settings-row-heading">
          <strong>{title}</strong>
          <HelpTip text={tip} />
        </span>
      </div>
      <div className="settings-control">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <Switch.Root
      className="ui-switch"
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
    >
      <Switch.Thumb className="ui-switch-thumb" />
    </Switch.Root>
  );
}

export default function Settings({ settings, onChange }) {
  const [demoBusy, setDemoBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const volumePct = Math.round((settings.volume ?? 0.7) * 100);

  function patch(partial) {
    onChange({ ...settings, ...partial });
  }

  function speak(text, { onEnd, onError } = {}) {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume ?? 0.7;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function testSpeech() {
    if (testBusy) return;
    setTestBusy(true);
    const ok = speak("Three remaining. Rest. Sixty seconds.", {
      onEnd: () => setTestBusy(false),
      onError: () => setTestBusy(false),
    });
    if (!ok) setTestBusy(false);
  }

  function tryVoiceDemo() {
    if (demoBusy) return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setDemoBusy(true);
    let index = 0;
    const speakNext = () => {
      if (index >= VOICE_DEMO.length) {
        setDemoBusy(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(VOICE_DEMO[index++]);
      utterance.volume = settings.volume ?? 0.7;
      utterance.onend = speakNext;
      utterance.onerror = () => setDemoBusy(false);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }

  return (
    <Tooltip.Provider delayDuration={250}>
      <header>
        <h1>Make it feel like you.</h1>
        <p>Simple preferences for a more comfortable workout.</p>
      </header>

      <section className="card settings-card">
        <h2>Feedback & display</h2>
        <p className="settings-lead">
          Tune spoken cues and the on-screen guide so workouts stay clear
          without clutter.
        </p>
        <div className="settings-list">
          <SettingRow
            title="Spoken counts and alerts"
            tip="Hear remaining reps, rest prompts, pause and completion cues while you train."
          >
            <Toggle
              checked={!!settings.speech}
              label="Spoken counts and alerts"
              onChange={(speech) => patch({ speech })}
            />
          </SettingRow>

          <SettingRow
            title="Speech volume"
            tip="Set how loud spoken feedback plays. Applies to workout cues and demos."
          >
            <div className="volume-control">
              <Slider.Root
                className="ui-slider"
                min={0}
                max={100}
                step={5}
                value={[volumePct]}
                onValueChange={([value]) => patch({ volume: value / 100 })}
              >
                <Slider.Track className="ui-slider-track">
                  <Slider.Range className="ui-slider-range" />
                </Slider.Track>
                <Slider.Thumb
                  className="ui-slider-thumb"
                  aria-label="Speech volume"
                />
              </Slider.Root>
              <span className="volume-value" aria-hidden="true">
                {volumePct}%
              </span>
            </div>
          </SettingRow>

          <SettingRow
            title="Test spoken feedback"
            tip="Play a short sample so you can check volume and voice before a workout."
          >
            <button
              type="button"
              className="settings-action"
              disabled={testBusy}
              onClick={testSpeech}
            >
              {testBusy ? "Playing…" : "Test speech"}
            </button>
          </SettingRow>

          <SettingRow
            title="Skeleton overlay"
            tip="Show pose guide lines on the exercise preview to help keep form on track."
          >
            <Toggle
              checked={settings.overlay !== false}
              label="Skeleton overlay"
              onChange={(overlay) => patch({ overlay })}
            />
          </SettingRow>
        </div>
      </section>

      <section className="card settings-card">
        <h2>Controls & devices</h2>
        <p className="settings-lead">
          Designed for hands-free exercise, with familiar controls as a
          fallback.
        </p>
        <div className="settings-list">
          <SettingRow
            title="Keyboard shortcut"
            tip="Press Space to pause or resume the active workout."
          >
            <span className="key-badge">Space</span>
          </SettingRow>

          <SettingRow
            title="Camera and microphone"
            tip="This lightweight prototype uses animated tracking and simulated voice commands. No devices are accessed."
          >
            <span className="status-badge">Demo mode</span>
          </SettingRow>

          <SettingRow
            title="Voice command demonstration"
            tip="Hear the Start, Pause, Resume and End command flow used in the hands-free demo."
          >
            <button
              type="button"
              className="settings-action"
              disabled={demoBusy}
              onClick={tryVoiceDemo}
            >
              {demoBusy ? "Playing…" : "Try demo"}
            </button>
          </SettingRow>
        </div>
      </section>
    </Tooltip.Provider>
  );
}
