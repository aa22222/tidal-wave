
export function initAudioEditor(containerId) {
  const container = document.getElementById(containerId);

  // Create elements
  const title = document.createElement("h2");
  title.textContent = "🎧 Simple Audio Editor";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "audio/*";

  const canvas = document.createElement("canvas");
  canvas.id = "waveform";
  canvas.style.background = "#222";
  canvas.style.borderRadius = "8px";
  canvas.style.width = "100%";
  canvas.style.height = "200px";
  canvas.style.marginTop = "20px";

  const controls = document.createElement("div");
  controls.id = "controls";
  controls.style.marginTop = "15px";
  controls.style.display = "flex";
  controls.style.gap = "10px";

  const buttons = ["Play", "Pause", "Stop"].map((label) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.background = "#333";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "8px 14px";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.onmouseenter = () => (btn.style.background = "#555");
    btn.onmouseleave = () => (btn.style.background = "#333");
    controls.appendChild(btn);
    return btn;
  });

  const [playBtn, pauseBtn, stopBtn] = buttons;

  container.appendChild(title);
  container.appendChild(fileInput);
  container.appendChild(canvas);
  container.appendChild(controls);

  const ctx = canvas.getContext("2d");
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  let audioBuffer = null;
  let source = null;
  let startTime = 0;
  let pausedAt = 0;
  let playing = false;

  function resizeCanvas() {
    canvas.width = container.clientWidth;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function drawWaveform(buffer) {
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#00ffcc";
    ctx.beginPath();

    for (let i = 0; i < canvas.width; i++) {
      const segment = data.slice(i * step, (i + 1) * step);
      const min = Math.min(...segment);
      const max = Math.max(...segment);
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  }

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      audioCtx.decodeAudioData(e.target.result, (buffer) => {
        audioBuffer = buffer;
        drawWaveform(buffer);
      });
    };
    reader.readAsArrayBuffer(file);
  });

  function playAudio() {
    if (!audioBuffer) return;
    source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    const offset = pausedAt || 0;
    startTime = audioCtx.currentTime - offset;
    source.start(0, offset);
    playing = true;

    source.onended = () => {
      playing = false;
      pausedAt = 0;
    };
  }

  function pauseAudio() {
    if (!playing) return;
    source.stop();
    pausedAt = audioCtx.currentTime - startTime;
    playing = false;
  }

  function stopAudio() {
    if (source) source.stop();
    pausedAt = 0;
    playing = false;
  }

  playBtn.onclick = playAudio;
  pauseBtn.onclick = pauseAudio;
  stopBtn.onclick = stopAudio;
}
