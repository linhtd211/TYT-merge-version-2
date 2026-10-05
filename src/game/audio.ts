/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ========================================================
// HỆ THỐNG ÂM THANH WEB AUDIO API PROCEDURAL
// Tự tạo sóng âm thanh trong trẻo, êm tai, hoàn toàn không phụ thuộc
// vào file ngoài (không sợ lỗi 404 hoặc mạng yếu trên mobile).
// Hỗ trợ bật/tắt SFX và Nhạc Nền (BGM), có cooldown chống ồn va chạm.
// ========================================================

class SoundController {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;

  private lastBounceTime: number = 0;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // Tải cấu hình âm thanh đã lưu từ bộ nhớ máy
    try {
      const savedSfx = localStorage.getItem('tram_yte_sfx');
      const savedMusic = localStorage.getItem('tram_yte_music');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
    } catch {
      // Bỏ qua nếu lỗi localStorage
    }
  }

  /**
   * Khởi động AudioContext khi người chơi chạm màn hình lần đầu (tránh policy tự phát của trình duyệt)
   */
  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
    try {
      localStorage.setItem('tram_yte_sfx', enabled.toString());
    } catch {
      //
    }
  }

  public setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    try {
      localStorage.setItem('tram_yte_music', enabled.toString());
    } catch {
      //
    }
    if (enabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }

  /**
   * ÂM THANH 1: Thả vật phẩm từ tay bác sĩ (drop)
   */
  public playDrop() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * ÂM THANH 2: Va chạm nhẹ (bounce) có cooldown 90ms để không bị spam ồn ào
   */
  public playBounce(impactVelocity: number = 1.0) {
    if (!this.sfxEnabled) return;
    const now = performance.now();
    if (now - this.lastBounceTime < 90) return; // Cooldown 90ms
    this.lastBounceTime = now;

    this.initContext();
    if (!this.ctx) return;

    const volume = Math.min(0.18, Math.max(0.04, impactVelocity * 0.03));
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * ÂM THANH 3: Hợp nhất (merge pop) vui tai, cao độ tăng theo cấp vật phẩm
   */
  public playMerge(level: number) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Tần số nốt nhạc thăng tiến vui tươi
    const baseFreq = 300 + level * 35;

    // Âm pop 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.16);

    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.17);

    // Âm hòa âm 2 tạo cảm giác 'bubble pop' mềm mại
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, t + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, t + 0.18);

    gain2.gain.setValueAtTime(0.18, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t + 0.02);
    osc2.stop(t + 0.19);
  }

  /**
   * ÂM THANH 4: Chuỗi Combo liên hoàn (combo chime)
   */
  public playCombo(comboCount: number) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // Đô Rê Mi Son La Đố
    const noteFreq = notes[Math.min(notes.length - 1, Math.max(0, comboCount - 2))];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, t);
    osc.frequency.exponentialRampToValueAtTime(noteFreq * 1.25, t + 0.22);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * ÂM THANH 5: Cảnh báo quá tải sắp Game Over (warning beep)
   */
  public playWarning() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(660, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  /**
   * ÂM THANH 6: Kho quá tải - Hết lượt chơi (game over)
   */
  public playGameOver() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 392, 349, 293];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.21);
    });
  }

  /**
   * ÂM THANH 7: Khám phá vật phẩm mới trong bộ sưu tập (fanfare)
   */
  public playNewItem() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Hợp âm rạng rỡ Đô - Mi - Son - Đố
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * ÂM THANH 8: Dùng vật phẩm hỗ trợ / Power-up (sparkle)
   */
  public playPowerUp() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.25);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.27);
  }

  /**
   * ÂM THANH 9: Mở hộp quà tiếp tế y tế (fanfare mở quà rực rỡ)
   */
  public playGiftBox() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.26, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.39);
    });
  }

  /**
   * ÂM THANH 10: Nhận Xu thưởng nhiệm vụ (tiếng xu leng keng lấp lánh)
   */
  public playCoin() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, t + 0.08); // B6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.33);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.33);
  }

  /**
   * ÂM THANH 11: Mặc trang phục mới (tiếng chuông biến hình kỳ diệu)
   */
  public playEquipSkin() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.29);
    });
  }

  /**
   * NHẠC NỀN CHILL CHIBI (BGM loop)
   * Giai điệu ngũ cung nhẹ nhàng êm tai, thư giãn như ở phòng khám ấm áp.
   */
  public startBGM() {
    if (!this.musicEnabled) return;
    if (this.bgmInterval !== null) return;
    this.initContext();

    // Chuỗi nốt nhạc lofi dịu êm
    const melody = [261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 392.0];
    this.bgmStep = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      const freq = melody[this.bgmStep % melody.length];
      this.bgmStep++;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Âm lượng nhạc nền rất khẽ (0.035) để không lấn át tiếng merge
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    }, 450);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = new SoundController();
