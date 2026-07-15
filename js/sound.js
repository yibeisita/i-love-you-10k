let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function playPunchSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        const bufferSize = Math.floor(ctx.sampleRate * 0.04);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.12));
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1400;
        noiseFilter.Q.value = 0.8;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.06);

        const thud = ctx.createOscillator();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(200, now);
        thud.frequency.exponentialRampToValueAtTime(70, now + 0.07);

        const thudGain = ctx.createGain();
        thudGain.gain.setValueAtTime(0.35, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        thud.connect(thudGain);
        thudGain.connect(ctx.destination);
        thud.start(now);
        thud.stop(now + 0.1);
    } catch {
        // Audio unavailable; fail silently
    }
}
