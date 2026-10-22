/**
 * ============================================================================
 * HỆ THỐNG ĐIỀU KHIỂN PHÒNG HỌC TIN HỌC ẢO 360° (PHIÊN BẢN TỐI ƯU V2.0)
 * - Bộ phát giọng nói Thầy giáo Đà Nẵng ấm áp (Hỗ trợ cả Offline & Cloud TTS không bị chặn)
 * - Hiệu ứng Khởi động & Màn hình Welcome Windows 11 chuyển vào Desktop
 * - Tranh treo tường "NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!" sắc nét trong phòng 3D
 * ============================================================================
 */

// 1. BỘ VẼ TRANH TƯỜNG "NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!" & KHẨU HIỆU LỚP HỌC
const ClassroomArtGenerator = {
  initWallArt() {
    this.drawSloganBanner();
    this.drawTypingPoster();
    // Nếu giáo viên có để sẵn file poster.png trong thư mục thì tự động nạp đè lên
    this.tryLoadExternalPoster('poster.png');
  },

  drawSloganBanner() {
    const canvas = document.getElementById('slogan-banner-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#B71C1C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    ctx.fillStyle = '#FFEB3B';
    ctx.font = 'bold 54px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TIÊN HỌC LỄ  –  HẬU HỌC VĂN', canvas.width / 2, canvas.height / 2);
  },

  // Tái hiện bức tranh "NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!"
  drawTypingPoster() {
    const canvas = document.getElementById('typing-poster-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Nền bầu trời xanh và thảm cỏ xanh tươi
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#4FC3F7');
    skyGrad.addColorStop(0.72, '#E1F5FE');
    skyGrad.addColorStop(0.73, '#8BC34A');
    skyGrad.addColorStop(1, '#4CAF50');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Ông mặt trời góc phải
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.arc(W - 65, 55, 42, 0, Math.PI * 2);
    ctx.fill();

    // Tiêu đề đỏ viền trắng nổi bật: "NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!"
    ctx.font = '900 44px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.strokeText('NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!', W / 2, 48);
    ctx.fillStyle = '#D50000';
    ctx.fillText('NHỚ GÕ PHÍM BẰNG HAI TAY BẠN NHÉ!', W / 2, 48);

    // Khung cửa sổ bàn phím chính giữa
    const bx = 75, by = 78, bw = W - 170, bh = 540;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 5;
    ctx.strokeRect(bx, by, bw, bh);

    // Thanh tiêu đề xanh của khung
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(bx, by, bw, 28);
    ctx.fillStyle = '#01579B';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('  Background - Luyện gõ bàn phím bằng 10 ngón tay', bx + 8, by + 19);

    // Vẽ bàn phím QWERTY phân vùng màu sắc theo ngón tay (Đỏ, Xanh dương, Vàng, Xanh lá)
    const rows = [
      [
        { t: '`', c: '#EF5350', w: 1 }, { t: '1', c: '#EF5350', w: 1 }, { t: '2', c: '#4FC3F7', w: 1 },
        { t: '3', c: '#FFF176', w: 1 }, { t: '4', c: '#66BB6A', w: 1 }, { t: '5', c: '#66BB6A', w: 1 },
        { t: '6', c: '#4CAF50', w: 1 }, { t: '7', c: '#4CAF50', w: 1 }, { t: '8', c: '#FFF176', w: 1 },
        { t: '9', c: '#4FC3F7', w: 1 }, { t: '0', c: '#EF5350', w: 1 }, { t: '-', c: '#EF5350', w: 1 },
        { t: '=', c: '#EF5350', w: 1 }, { t: 'Back', c: '#EF5350', w: 1.5 }
      ],
      [
        { t: 'Tab', c: '#EF5350', w: 1.3 }, { t: 'Q', c: '#EF5350', w: 1 }, { t: 'W', c: '#4FC3F7', w: 1 },
        { t: 'E', c: '#FFF176', w: 1 }, { t: 'R', c: '#66BB6A', w: 1 }, { t: 'T', c: '#66BB6A', w: 1 },
        { t: 'Y', c: '#4CAF50', w: 1 }, { t: 'U', c: '#4CAF50', w: 1 }, { t: 'I', c: '#FFF176', w: 1 },
        { t: 'O', c: '#4FC3F7', w: 1 }, { t: 'P', c: '#EF5350', w: 1 }, { t: '[', c: '#EF5350', w: 1 },
        { t: ']', c: '#EF5350', w: 1 }, { t: '\\', c: '#EF5350', w: 1.2 }
      ],
      [
        { t: 'Caps', c: '#EF5350', w: 1.5 }, { t: 'A', c: '#EF5350', w: 1 }, { t: 'S', c: '#4FC3F7', w: 1 },
        { t: 'D', c: '#FFF176', w: 1 }, { t: 'F_', c: '#66BB6A', w: 1 }, { t: 'G', c: '#66BB6A', w: 1 },
        { t: 'H', c: '#4CAF50', w: 1 }, { t: 'J_', c: '#4CAF50', w: 1 }, { t: 'K', c: '#FFF176', w: 1 },
        { t: 'L', c: '#4FC3F7', w: 1 }, { t: ';', c: '#EF5350', w: 1 }, { t: "'", c: '#EF5350', w: 1 },
        { t: 'Enter', c: '#EF5350', w: 1.9 }
      ],
      [
        { t: 'Shift', c: '#EF5350', w: 1.9 }, { t: 'Z', c: '#EF5350', w: 1 }, { t: 'X', c: '#4FC3F7', w: 1 },
        { t: 'C', c: '#FFF176', w: 1 }, { t: 'V', c: '#66BB6A', w: 1 }, { t: 'B', c: '#66BB6A', w: 1 },
        { t: 'N', c: '#4CAF50', w: 1 }, { t: 'M', c: '#4CAF50', w: 1 }, { t: ',', c: '#FFF176', w: 1 },
        { t: '.', c: '#4FC3F7', w: 1 }, { t: '/', c: '#EF5350', w: 1 }, { t: 'Shift', c: '#EF5350', w: 2.3 }
      ],
      [
        { t: 'Ctrl', c: '#E1F5FE', w: 1.3 }, { t: 'Win', c: '#E1F5FE', w: 1.1 }, { t: 'Alt', c: '#E1F5FE', w: 1.1 },
        { t: 'SPACE (PHÍM CÁCH)', c: '#DCE775', w: 6.2 },
        { t: 'Alt', c: '#E1F5FE', w: 1.1 }, { t: 'Fn', c: '#E1F5FE', w: 1.1 }, { t: 'Ctrl', c: '#E1F5FE', w: 1.3 }
      ]
    ];

    const startX = bx + 20;
    let curY = by + 42;
    const unitW = 54;
    const keyH = 54;
    const gap = 5;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    rows.forEach(row => {
      let curX = startX;
      row.forEach(k => {
        const kw = k.w * unitW + (k.w - 1) * gap;
        ctx.fillStyle = k.c;
        ctx.fillRect(curX, curY, kw, keyH);
        ctx.strokeStyle = '#37474F';
        ctx.lineWidth = 2;
        ctx.strokeRect(curX, curY, kw, keyH);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(k.t, curX + kw / 2, curY + keyH / 2);
        curX += kw + gap;
      });
      curY += keyH + gap;
    });

    // Vẽ minh họa 2 bàn tay đặt dưới bàn phím tương ứng màu ngón tay
    const drawHand = (centerX, isLeft) => {
      ctx.fillStyle = '#FFCCBC';
      ctx.strokeStyle = '#D84315';
      ctx.lineWidth = 2;
      // Lòng bàn tay
      ctx.beginPath();
      ctx.arc(centerX, by + 465, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const fingerColors = isLeft
        ? ['#EF5350', '#4FC3F7', '#FFF176', '#66BB6A', '#DCE775']
        : ['#DCE775', '#4CAF50', '#FFF176', '#4FC3F7', '#EF5350'];
      const offsets = [-56, -28, 0, 28, 58];

      offsets.forEach((dx, i) => {
        const fx = centerX + dx;
        const fy = i === (isLeft ? 4 : 0) ? by + 430 : by + 392;
        // Ô màu đầu ngón tay
        ctx.fillStyle = fingerColors[i];
        ctx.fillRect(fx - 14, fy - 26, 28, 24);
        ctx.strokeRect(fx - 14, fy - 26, 28, 24);
        // Ngón tay
        ctx.fillStyle = '#FFCCBC';
        ctx.fillRect(fx - 10, fy, 20, 45);
      });
    };

    drawHand(W / 2 - 120, true);
    drawHand(W / 2 + 120, false);

    // Ghi chú bên phải giống tranh gốc
    ctx.fillStyle = '#80DEEA';
    ctx.fillRect(W - 85, 110, 72, 65);
    ctx.fillStyle = '#B71C1C';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Ghi chú', W - 49, 145);

    this.refreshAFramePosterTextures();
    // Cập nhật luôn ảnh trong hộp thoại xem tranh
    const modalImg = document.getElementById('poster-modal-img');
    if (modalImg) modalImg.src = canvas.toDataURL('image/png');
  },

  tryLoadExternalPoster(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.getElementById('typing-poster-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      this.refreshAFramePosterTextures();
      const modalImg = document.getElementById('poster-modal-img');
      if (modalImg) modalImg.src = canvas.toDataURL('image/png');
    };
    img.src = url;
  },

  refreshAFramePosterTextures() {
    ['wall-poster-front', 'wall-poster-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getObject3D('mesh')) {
        const mat = el.getObject3D('mesh').material;
        if (mat && mat.map) mat.map.needsUpdate = true;
      }
    });
  }
};

// 2. BỘ PHÁT GIỌNG NÓI THẦY GIÁO ĐÀ NẴNG ẤM ÁP (ĐẢM BẢO PHÁT ĐƯỢC 100% TRÊN MỌI TRÌNH DUYỆT)
class DaNangTeacherVoiceEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.viVoice = null;
    this.isMaleViVoice = false;
    this.audioQueue = [];
    this.currentAudio = null;
    this.lastSpokenText = '';

    this.initVoices();
  }

  initVoices() {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const viVoices = voices.filter(
        v =>
          v.lang.toLowerCase().includes('vi') ||
          v.name.toLowerCase().includes('viet') ||
          v.name.toLowerCase().includes('namminh') ||
          v.name.toLowerCase().includes('hoaimy') ||
          v.name.toLowerCase().includes('microsoft an')
      );

      if (viVoices.length > 0) {
        const maleVoice = viVoices.find(
          v =>
            v.name.toLowerCase().includes('namminh') ||
            v.name.toLowerCase().includes(' an') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('nam')
        );
        if (maleVoice) {
          this.viVoice = maleVoice;
          this.isMaleViVoice = true;
        } else {
          this.viVoice = viVoices[0];
          this.isMaleViVoice = false;
        }
      } else {
        this.viVoice = null;
      }
      this.updateDiagnosticUI();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  updateDiagnosticUI() {
    const diagEl = document.getElementById('voice-diagnostic-info');
    if (!diagEl) return;
    if (this.viVoice) {
      diagEl.innerHTML = `✅ Đang sử dụng giọng Tiếng Việt bản địa: <b>${this.viVoice.name}</b> (Đã tinh chỉnh chất giọng trầm ấm của Thầy giáo Đà Nẵng).`;
    } else {
      diagEl.innerHTML = `✅ Đang sử dụng <b>Luồng Giọng Đọc Thầy Giáo Đà Nẵng Đám Mây</b> (Tự động chia câu mượt mà, không bị chặn CORS).`;
    }
  }

  initAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.audioQueue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  // Phát giọng nói Thầy giáo Đà Nẵng ấm áp, nhẹ nhàng
  speak(daNangText) {
    if (!daNangText) return;
    this.lastSpokenText = daNangText;
    if (!this.enabled) return;

    this.stopSpeaking();

    // Tầng 1: Nếu trình duyệt có sẵn giọng Tiếng Việt (như Microsoft NamMinh trên Edge hoặc Google Tiếng Việt)
    if (this.viVoice && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(daNangText);
      utter.voice = this.viVoice;
      utter.lang = 'vi-VN';
      utter.rate = 0.92; // Nhịp đọc thong thả, nhẹ nhàng
      utter.pitch = this.isMaleViVoice ? 0.92 : 0.76; // Trầm ấm giọng thầy giáo
      utter.volume = 1.0;
      window.speechSynthesis.speak(utter);
      return;
    }

    // Tầng 2: Chia nhỏ câu văn (< 140 ký tự) và phát qua luồng Cloud Tiếng Việt không gửi Referer
    const chunks = daNangText
      .split(/(?<=[.!?।,;])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.audioQueue = chunks;
    this.playNextChunk();
  }

  playNextChunk() {
    if (!this.enabled || this.audioQueue.length === 0) return;
    const chunk = this.audioQueue.shift();
    const url = `https://translate.googleapis.com/translate_tts?client=tw-ob&ie=UTF-8&tl=vi&q=${encodeURIComponent(chunk)}`;

    const audio = new Audio();
    audio.referrerPolicy = 'no-referrer';
    audio.src = url;
    // Hạ nhẹ tốc độ và độ trầm để tạo âm sắc ấm áp của thầy giáo
    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.playbackRate = 0.90;

    this.currentAudio = audio;
    audio.onended = () => this.playNextChunk();
    audio.onerror = () => this.playNextChunk();
    audio.play().catch(() => {});
  }

  replayLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText);
    }
  }

  playTing() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(783.99, now + 0.09);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playHintTone() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(293.66, now + 0.22);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playStartupChime() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.ctx) return;
    const chords = [261.63, 329.63, 392.00, 523.25];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = this.ctx.currentTime + idx * 0.12;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  }
}

const Voice = new DaNangTeacherVoiceEngine();

// 3. LOGIC ĐIỀU KHIỂN BÀI HỌC & TƯƠNG TÁC VR 360°
const App = {
  mode: 'act1_poweron',
  isFreePractice: false,

  cpuPowerOn: false,
  monitorPowerOn: false,
  cpuShuttingDownComplete: false,

  browserOpen: true,
  rapidOpen: true,
  startMenuOpen: false,
  powerPopupOpen: false,

  correctSteps: 0,
  hintsCount: 0,
  startTime: null,

  init() {
    ClassroomArtGenerator.initWallArt();
    this.bind3DEvents();
    this.loadSavedProgress();
  },

  bind3DEvents() {
    const cpuBtn = document.getElementById('cpu-btn-3d');
    const cpuHitbox = document.getElementById('cpu-hitbox');
    const monBtn = document.getElementById('monitor-btn-3d');
    const monHitbox = document.getElementById('monitor-hitbox');
    const monScreen = document.getElementById('monitor-screen-3d');
    const kb3d = document.getElementById('keyboard-3d');
    const mouse3d = document.getElementById('mouse-3d');
    const posterFront = document.getElementById('wall-poster-front');
    const posterRight = document.getElementById('wall-poster-right');

    if (cpuBtn) cpuBtn.addEventListener('click', () => this.clickCpuPower());
    if (cpuHitbox) cpuHitbox.addEventListener('click', () => this.clickCpuPower());
    if (monBtn) monBtn.addEventListener('click', () => this.clickMonitorPower());
    if (monHitbox) monHitbox.addEventListener('click', () => this.clickMonitorPower());

    if (monScreen) {
      monScreen.addEventListener('click', () => {
        if (this.cpuPowerOn && this.monitorPowerOn) {
          this.openWindows11Screen();
        } else {
          this.clickMonitorPower();
        }
      });
    }

    if (posterFront) posterFront.addEventListener('click', () => this.openPosterModal());
    if (posterRight) posterRight.addEventListener('click', () => this.openPosterModal());

    if (kb3d) {
      kb3d.addEventListener('click', () => {
        this.showToast('💡', 'Đây là Bàn phím. Nhớ gõ phím bằng hai tay như tranh treo trên tường nghe!');
        Voice.speak('Đây là bàn phím máy tính đó em. Em nhớ đặt hai tay lên hàng phím cơ sở như bức tranh treo trên tường lớp mình nghe!');
      });
    }
    if (mouse3d) {
      mouse3d.addEventListener('click', () => {
        this.showToast('💡', 'Đây là Chuột máy tính giúp em điều khiển con trỏ trên màn hình.');
        Voice.speak('Đây là con chuột máy tính giúp em điều khiển mũi tên trên màn hình Windows 11 đó nghe.');
      });
    }
  },

  resetCameraLook(yawDeg = 0, pitchDeg = -3) {
    const camEl = document.getElementById('main-camera');
    if (camEl && camEl.components && camEl.components['look-controls']) {
      const lc = camEl.components['look-controls'];
      if (lc.pitchObject) lc.pitchObject.rotation.x = (pitchDeg * Math.PI) / 180;
      if (lc.yawObject) lc.yawObject.rotation.y = (yawDeg * Math.PI) / 180;
    }
  },

  moveCamera(target) {
    const rig = document.getElementById('camera-rig');
    document.querySelectorAll('.btn-cam').forEach(b => b.classList.remove('active'));

    if (target === 'room') {
      this.resetCameraLook(0, -2);
      rig.setAttribute('animation', 'property: position; to: 0 1.45 1.2; dur: 750; easing: easeInOutQuad');
      document.getElementById('cam-room').classList.add('active');
    } else if (target === 'desk') {
      this.resetCameraLook(0, -4);
      rig.setAttribute('animation', 'property: position; to: 0 1.24 -0.20; dur: 750; easing: easeInOutQuad');
      document.getElementById('cam-desk').classList.add('active');
    } else if (target === 'monitor') {
      this.resetCameraLook(0, -2);
      rig.setAttribute('animation', 'property: position; to: 0.08 1.12 -0.65; dur: 700; easing: easeInOutQuad');
      document.getElementById('cam-monitor').classList.add('active');
    } else if (target === 'poster') {
      // Quay góc nhìn sang bức tranh lớn bên tường phải
      this.resetCameraLook(-90, 2);
      rig.setAttribute('animation', 'property: position; to: 3.4 1.65 -1.35; dur: 800; easing: easeInOutQuad');
      document.getElementById('cam-poster').classList.add('active');
      Voice.speak('Em nhìn bức tranh trên tường lớp mình kìa: Nhớ gõ phím bằng hai tay bạn nhé! Mỗi ngón tay phụ trách một màu phím đó nghe.');
    }
  },

  openPosterModal() {
    document.getElementById('poster-modal').classList.remove('hidden');
    Voice.speak('Đây là bức tranh hướng dẫn: Nhớ gõ phím bằng hai tay bạn nhé! Em đặt hai ngón trỏ lên hai phím có gai F và J nghe.');
  },

  closePosterModal() {
    document.getElementById('poster-modal').classList.add('hidden');
  },

  uploadCustomPoster(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      ClassroomArtGenerator.tryLoadExternalPoster(e.target.result);
      this.showToast('🖼️', 'Đã cập nhật bức tranh lên tường phòng học 3D!');
    };
    reader.readAsDataURL(file);
  },

  focusHint(part) {
    this.moveCamera('desk');
    if (part === 'cpu') {
      this.showToast('💡', 'Bước 1: Nhấn nút nguồn màu đỏ trên thân máy (CPU).');
      Voice.speak('Bước 1 nè: Em nhìn qua bên trái màn hình, nhấn vô nút nguồn màu đỏ trên thân máy nghe.');
    } else {
      this.showToast('💡', 'Bước 2: Nhấn nút nguồn ở góc dưới bên phải màn hình.');
      Voice.speak('Bước 2 nè: Em nhấn nhẹ vô nút nguồn ở góc dưới bên phải màn hình nghe.');
    }
  },

  testTeacherVoice() {
    Voice.initAudioContext();
    Voice.speak('Thầy chào các em học sinh thân yêu tại Đà Nẵng nghe! Hôm nay thầy trò mình cùng thực hành bật và tắt máy tính Windows 11 thật an toàn và đúng cách nghe!');
    this.showToast('🎙️', 'Đang phát giọng hướng dẫn ấm áp của Thầy giáo Đà Nẵng...');
  },

  replayCurrentInstruction() {
    Voice.replayLast();
  },

  // ==========================================================================
  // HOẠT ĐỘNG 1: BẬT MÁY TÍNH & HIỆU ỨNG WELCOME WINDOWS 11
  // ==========================================================================
  startExploration() {
    Voice.initAudioContext();
    document.getElementById('start-screen').classList.add('hidden');
    this.startTime = Date.now();
    this.startActivity1();
  },

  startActivity1() {
    this.mode = 'act1_poweron';
    this.isFreePractice = false;
    this.resetHardwareOff();

    this.moveCamera('desk');
    document.getElementById('phase-indicator').innerText = 'Hoạt động 1: Bật máy tính';
    document.getElementById('activity-tag').innerText = 'HOẠT ĐỘNG 1';
    document.getElementById('guide-title').innerText = 'BẬT MÁY TÍNH ĐÚNG CÁCH';
    document.getElementById('guide-message').innerHTML =
      '👉 <b>Bước 1:</b> Em hãy nhấn vào <b>nút nguồn trên thân máy (CPU)</b> để khởi động máy tính nghe!';

    document.getElementById('power-on-steps').classList.remove('hidden');
    document.getElementById('btn-quick-cpu').classList.remove('hidden');
    document.getElementById('btn-quick-monitor').classList.add('hidden');
    document.getElementById('btn-act-win11').classList.add('hidden');
    document.getElementById('btn-act-shutdown').classList.add('hidden');
    document.getElementById('btn-act-practice').classList.add('hidden');

    this.updateStepCards(1);
    this.set3DHighlights({ cpu: true, mon: false });

    Voice.speak('Thầy chào em nghe! Đầu tiên mình học cách bật máy tính đúng cách. Bước 1, em hãy nhấn vô nút nguồn màu đỏ trên thân máy tính nghe!');
  },

  // Bước 1: Nhấn nút nguồn trên thân máy (CPU)
  clickCpuPower() {
    if (this.mode === 'act1_poweron') {
      if (!this.cpuPowerOn) {
        this.cpuPowerOn = true;
        document.getElementById('cpu-btn-3d').setAttribute('color', '#00E676');
        document.getElementById('cpu-led-3d').setAttribute('color', '#00E676');
        this.correctSteps++;
        Voice.playTing();
        this.showToast('✅', 'Đúng rồi đó em! Đèn báo trên thân máy (CPU) đã sáng lên.');

        this.updateStepCards(2);
        this.set3DHighlights({ cpu: false, mon: true });
        document.getElementById('btn-quick-cpu').classList.add('hidden');
        document.getElementById('btn-quick-monitor').classList.remove('hidden');

        document.getElementById('guide-message').innerHTML =
          '👉 <b>Bước 2:</b> Bây giờ em hãy nhấn <b>nút nguồn của màn hình</b> (ở góc dưới bên phải màn hình) nghe!';

        Voice.speak('Đúng rồi đó em, giỏi lắm! Đèn thân máy sáng rồi. Bước 2, em nhấn tiếp nút nguồn của màn hình ở góc dưới bên phải nghe!');
        this.updateTeacherStats();
      }
      return;
    }

    if (this.cpuPowerOn && !this.cpuShuttingDownComplete) {
      this.hintsCount++;
      Voice.playHintTone();
      this.showToast('💡', 'Đừng nhấn nút nguồn trên thân máy để tắt nghe! Hãy tắt bằng lệnh Shut down trên màn hình.');
      Voice.speak('Khoan đã nghe em! Mình không nhấn nút nguồn trên thân máy để tắt đột ngột mô, dễ hư máy lắm. Em tắt trên màn hình Windows 11 nghe!');
      this.updateTeacherStats();
    }
  },

  // Bước 2: Nhấn nút nguồn màn hình -> Chạy hiệu ứng Boot & Welcome Windows 11!
  clickMonitorPower() {
    if (this.mode === 'act1_poweron') {
      if (!this.cpuPowerOn) {
        this.hintsCount++;
        Voice.playHintTone();
        this.showToast('💡', 'Hãy tìm nút nguồn trên thân máy tính (CPU) và nhấn trước nghe!');
        Voice.speak('Em ơi, mình nhớ nhấn nút nguồn màu đỏ trên thân máy tính trước rồi mới bật màn hình nghe!');
        this.updateTeacherStats();
        return;
      }

      if (!this.monitorPowerOn) {
        this.monitorPowerOn = true;
        document.getElementById('monitor-btn-3d').setAttribute('color', '#00E676');
        document.getElementById('monitor-led-3d').setAttribute('color', '#00E676');
        document.getElementById('screen-3d-content').setAttribute('visible', 'true');
        this.correctSteps++;

        this.updateStepCards(3);
        this.set3DHighlights({ cpu: false, mon: false });
        document.getElementById('btn-quick-monitor').classList.add('hidden');

        this.showToast('✅', 'Em đã bật máy tính đúng cách! Đang vào Windows 11...');
        document.getElementById('guide-title').innerText = '✅ EM ĐÃ BẬT MÁY TÍNH ĐÚNG CÁCH!';
        document.getElementById('guide-message').innerHTML =
          'Máy tính đang hiển thị màn hình <b>Welcome Windows 11</b>. Em hãy quan sát màn hình khởi động nghe!';

        document.getElementById('btn-act-win11').classList.remove('hidden');
        document.getElementById('btn-act-shutdown').classList.remove('hidden');

        // Chạy hiệu ứng chuyển cảnh Boot -> Welcome -> Windows 11 Desktop
        this.playWindows11WelcomeTransition();
        this.updateTeacherStats();
      }
      return;
    }

    // Bước cuối cùng của Tắt máy tính (Sau khi đèn CPU đã tắt)
    if (this.mode === 'act2_shutdown_guided' || this.mode === 'act3_free_practice') {
      if (!this.cpuShuttingDownComplete) {
        this.hintsCount++;
        Voice.playHintTone();
        this.showToast('💡', 'Hãy đóng các chương trình và chọn Start → Power → Shut down trước khi tắt màn hình nghe!');
        Voice.speak('Em nhớ đóng hết phần mềm rồi chọn Shut down trên màn hình trước, đợi đèn thân máy tắt hẳn rồi mới tắt màn hình nghe!');
        this.updateTeacherStats();
        return;
      }

      this.monitorPowerOn = false;
      document.getElementById('monitor-btn-3d').setAttribute('color', '#546E7A');
      document.getElementById('monitor-led-3d').setAttribute('color', '#37474F');
      document.getElementById('screen-3d-content').setAttribute('visible', 'false');
      document.getElementById('btn-quick-monitor').classList.add('hidden');
      this.set3DHighlights({ cpu: false, mon: false });
      this.correctSteps++;
      Voice.playTing();

      if (this.mode === 'act2_shutdown_guided') {
        this.showToast('🎉', 'Chính xác! Em đã hoàn thành 4 bước tắt máy tính đúng cách.');
        document.getElementById('guide-title').innerText = '🌟 ĐÃ TẮT MÁY TÍNH ĐÚNG CÁCH!';
        document.getElementById('guide-message').innerHTML =
          'Em làm giỏi lắm đó! Bây giờ hãy nhấn vào <b>"🎮 Chế độ: Em tự thực hành"</b> để tự mình thao tác và nhận Huy hiệu nghe!';
        document.getElementById('btn-act-practice').classList.remove('hidden');

        Voice.speak('Giỏi quá chừng luôn! Em đã nắm vững bốn bước tắt máy rồi đó. Giờ em bấm qua chế độ Em tự thực hành để nhận huy hiệu khen thưởng của thầy nghe!');
      } else {
        this.finishLesson();
      }
      this.updateTeacherStats();
    }
  },

  // HIỆU ỨNG BOOT LOGO -> MÀN HÌNH WELCOME WINDOWS 11 -> VÀO DESKTOP
  playWindows11WelcomeTransition() {
    this.moveCamera('monitor');
    this.prepareWindows11State();
    this.openWindows11Screen();

    const bootScreen = document.getElementById('win11-boot-screen');
    const welcomeScreen = document.getElementById('win11-welcome-screen');
    const btnStartAct2 = document.getElementById('btn-banner-start-act2');

    if (btnStartAct2) btnStartAct2.classList.remove('hidden');
    bootScreen.classList.remove('hidden');
    welcomeScreen.classList.add('hidden');

    Voice.speak('Tuyệt vời quá! Em đã bật máy tính đúng cách rồi đó. Màn hình đang khởi động vào Windows 11 nghe!');

    // Pha 1 (1.3 giây): Chuyển từ Boot đen sang màn hình Welcome xanh của Windows 11
    setTimeout(() => {
      bootScreen.classList.add('hidden');
      welcomeScreen.classList.remove('hidden');
      Voice.playStartupChime();
    }, 1300);

    // Pha 2 (3.1 giây): Chuyển mượt từ Welcome vào màn hình Desktop Windows 11
    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      document.getElementById('win11-banner-title').innerText = '✅ CHÀO MỪNG EM ĐẾN VỚI WINDOWS 11!';
      document.getElementById('win11-banner-desc').innerHTML =
        'Máy tính đã khởi động xong và mở sẵn 2 phần mềm. Em hãy nhấn nút <b>"🛑 Bắt đầu học Tắt máy"</b> để thực hành Hoạt động 2 nghe!';
    }, 3100);
  },

  // ==========================================================================
  // HOẠT ĐỘNG 2: TẮT MÁY TÍNH ĐÚNG CÁCH TRONG WINDOWS 11
  // ==========================================================================
  startActivity2() {
    this.mode = 'act2_shutdown_guided';
    this.isFreePractice = false;
    this.prepareWindows11State();

    document.getElementById('phase-indicator').innerText = 'Hoạt động 2: Tắt máy tính';
    document.getElementById('activity-tag').innerText = 'HOẠT ĐỘNG 2';
    document.getElementById('power-on-steps').classList.add('hidden');
    document.getElementById('btn-act-win11').classList.add('hidden');
    document.getElementById('btn-act-shutdown').classList.add('hidden');
    document.getElementById('btn-banner-start-act2').classList.add('hidden');
    document.getElementById('mode-pill-win').innerText = 'Chế độ có hướng dẫn';

    document.getElementById('arrow-close-browser').classList.remove('hidden');
    document.getElementById('arrow-close-rapid').classList.remove('hidden');

    this.moveCamera('monitor');
    this.openWindows11Screen();

    document.getElementById('win11-banner-title').innerText = '❓ TRƯỚC KHI TẮT MÁY, EM CẦN LÀM GÌ?';
    document.getElementById('win11-banner-desc').innerHTML =
      'Trên màn hình đang mở <b>Trình duyệt Web</b> và <b>Rapid</b>. Em hãy tìm nút <b>✕</b> ở góc trên bên phải từng cửa sổ để đóng lại nghe!';

    Voice.speak('Trước khi tắt máy, đố em mình cần làm chi nào? Trên màn hình đang mở Trình duyệt Web và phần mềm Rapid. Em nhấn vô dấu nhân màu đỏ ở góc trên bên phải để đóng cả hai cửa sổ lại nghe!');
  },

  // ==========================================================================
  // CHẾ ĐỘ THỰC HÀNH TỰ DO (MỤC 9)
  // ==========================================================================
  startFreePractice() {
    this.closeAllModals();
    this.mode = 'act3_free_practice';
    this.isFreePractice = true;
    this.prepareWindows11State();

    document.getElementById('phase-indicator').innerText = '🎮 Em tự thực hành';
    document.getElementById('activity-tag').innerText = 'TỰ THỰC HÀNH';
    document.getElementById('power-on-steps').classList.add('hidden');
    document.getElementById('btn-act-practice').classList.add('hidden');
    document.getElementById('btn-banner-start-act2').classList.add('hidden');
    document.getElementById('mode-pill-win').innerText = '🎮 EM TỰ THỰC HÀNH';

    document.getElementById('arrow-close-browser').classList.add('hidden');
    document.getElementById('arrow-close-rapid').classList.add('hidden');
    document.getElementById('arrow-start-btn').classList.add('hidden');
    document.getElementById('arrow-power-btn').classList.add('hidden');
    document.getElementById('arrow-shutdown-btn').classList.add('hidden');
    document.getElementById('btn-show-4steps').classList.add('hidden');

    this.moveCamera('monitor');
    this.openWindows11Screen();

    document.getElementById('win11-banner-title').innerText = '🎮 EM TỰ THỰC HÀNH';
    document.getElementById('win11-banner-desc').innerHTML =
      'Em hãy tự thực hiện đúng quy trình: <b>Đóng 2 chương trình ➔ Nhấn Start ➔ Chọn Power ➔ Chọn Shut down ➔ Tắt màn hình</b>.';

    Voice.speak('Bây giờ tới phần Em tự thực hành, thầy không để sẵn mũi tên gợi ý nữa. Em tự tay đóng hai phần mềm rồi tắt máy tính đúng quy trình cho thầy xem nghe!');
    this.updateTeacherStats();
  },

  prepareWindows11State() {
    this.cpuPowerOn = true;
    this.monitorPowerOn = true;
    this.cpuShuttingDownComplete = false;

    this.browserOpen = true;
    this.rapidOpen = true;
    this.startMenuOpen = false;
    this.powerPopupOpen = false;

    document.getElementById('cpu-btn-3d').setAttribute('color', '#00E676');
    document.getElementById('cpu-led-3d').setAttribute('color', '#00E676');
    document.getElementById('monitor-btn-3d').setAttribute('color', '#00E676');
    document.getElementById('monitor-led-3d').setAttribute('color', '#00E676');
    document.getElementById('screen-3d-content').setAttribute('visible', 'true');
    document.getElementById('mini-win-1').setAttribute('visible', 'true');
    document.getElementById('mini-win-2').setAttribute('visible', 'true');

    document.getElementById('win11-boot-screen').classList.add('hidden');
    document.getElementById('win11-welcome-screen').classList.add('hidden');
    document.getElementById('win-app-browser').classList.remove('hidden');
    document.getElementById('win-app-rapid').classList.remove('hidden');
    document.getElementById('tb-icon-browser').classList.add('active');
    document.getElementById('tb-icon-rapid').classList.add('active');
    document.getElementById('win11-start-menu').classList.add('hidden');
    document.getElementById('power-popup-menu').classList.add('hidden');
    document.getElementById('win11-shutting-down').classList.add('hidden');
  },

  openWindows11Screen() {
    document.getElementById('win11-workspace').classList.remove('hidden');
  },

  closeWindows11Screen() {
    document.getElementById('win11-workspace').classList.add('hidden');
  },

  handleDesktopClick() {
    if (this.startMenuOpen) {
      this.startMenuOpen = false;
      this.powerPopupOpen = false;
      document.getElementById('win11-start-menu').classList.add('hidden');
      document.getElementById('power-popup-menu').classList.add('hidden');
    }
  },

  wrongWindowBtn() {
    this.hintsCount++;
    Voice.playHintTone();
    this.showToast('💡', 'Hãy tìm nút X ở góc trên bên phải cửa sổ.');
    Voice.speak('Nút đó là thu nhỏ phóng to thôi em. Em nháy vô nút chữ X màu đỏ ở góc trên bên phải cửa sổ để đóng chương trình nghe!');
    this.updateTeacherStats();
  },

  openAppWindow(appName) {
    if (appName === 'browser' && !this.browserOpen) {
      this.browserOpen = true;
      document.getElementById('win-app-browser').classList.remove('hidden');
    } else if (appName === 'rapid' && !this.rapidOpen) {
      this.rapidOpen = true;
      document.getElementById('win-app-rapid').classList.remove('hidden');
    }
  },

  closeAppWindow(appName) {
    if (this.mode === 'act1_poweron') {
      this.mode = 'act2_shutdown_guided';
      document.getElementById('btn-banner-start-act2').classList.add('hidden');
    }

    if (appName === 'browser' && this.browserOpen) {
      this.browserOpen = false;
      document.getElementById('win-app-browser').classList.add('hidden');
      document.getElementById('tb-icon-browser').classList.remove('active');
      document.getElementById('mini-win-1').setAttribute('visible', 'false');
      this.correctSteps++;
      Voice.playTing();
      this.showToast('✅', 'Tốt lắm! Em đã đóng chương trình Trình duyệt Web.');
    } else if (appName === 'rapid' && this.rapidOpen) {
      this.rapidOpen = false;
      document.getElementById('win-app-rapid').classList.add('hidden');
      document.getElementById('tb-icon-rapid').classList.remove('active');
      document.getElementById('mini-win-2').setAttribute('visible', 'false');
      this.correctSteps++;
      Voice.playTing();
      this.showToast('✅', 'Tốt lắm! Em đã đóng chương trình Rapid.');
    }

    if (this.browserOpen !== this.rapidOpen) {
      Voice.speak('Giỏi lắm đó em! Mình đóng thêm cửa sổ phần mềm còn lại nữa là xong bước một nghe.');
    }

    if (!this.browserOpen && !this.rapidOpen) {
      if (!this.isFreePractice) {
        document.getElementById('btn-show-4steps').classList.remove('hidden');
        document.getElementById('arrow-start-btn').classList.remove('hidden');
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH ĐANG MỞ!';
        document.getElementById('win11-banner-desc').innerHTML =
          '👉 <b>Bước 1:</b> Nháy chuột vào nút <b>Start</b> trên thanh Taskbar ở bên dưới màn hình.';
        this.open4StepsModal();
        Voice.speak('Hay quá! Em đã đóng sạch các chương trình đang mở rồi. Giờ em xem kỹ bốn bước tắt máy tính trên bảng hướng dẫn của thầy nghe!');
      } else {
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH!';
        document.getElementById('win11-banner-desc').innerHTML =
          'Bây giờ em hãy nhấn <b>Start ➔ Power ➔ Shut down</b> nghe!';
        Voice.speak('Đúng rồi đó em! Giờ em nhấn nút Start ở thanh bên dưới, chọn Power rồi bấm Shut down nghe!');
      }
    }
    this.updateTeacherStats();
  },

  clickStartButton(event) {
    if (event) event.stopPropagation();
    this.startMenuOpen = !this.startMenuOpen;
    const menu = document.getElementById('win11-start-menu');

    if (this.startMenuOpen) {
      menu.classList.remove('hidden');
      Voice.playTing();

      if (!this.browserOpen && !this.rapidOpen) {
        this.correctSteps++;
        if (!this.isFreePractice) {
          document.getElementById('arrow-start-btn').classList.add('hidden');
          document.getElementById('arrow-power-btn').classList.remove('hidden');
          document.getElementById('win11-banner-desc').innerHTML =
            '👉 <b>Bước 2:</b> Nháy chuột vào biểu tượng <b>Power (⏻)</b> ở góc dưới bên phải bảng Start.';
          Voice.speak('Chính xác! Qua bước 2, em nháy chuột vô biểu tượng nút nguồn Power ở góc dưới bên phải bảng Start nghe.');
        }
      }
    } else {
      menu.classList.add('hidden');
      document.getElementById('power-popup-menu').classList.add('hidden');
    }
    this.updateTeacherStats();
  },

  clickPowerIcon(event) {
    if (event) event.stopPropagation();

    if (this.browserOpen || this.rapidOpen) {
      this.hintsCount++;
      Voice.playHintTone();
      document.getElementById('win11-start-menu').classList.add('hidden');
      this.startMenuOpen = false;
      document.getElementById('unclosed-warning-modal').classList.remove('hidden');

      Voice.speak('Khoan tắt máy nghe em! Em còn chương trình đang mở trên màn hình kìa. Mình đóng hết các chương trình trước khi tắt máy để khỏi bị mất dữ liệu nghe!');
      this.updateTeacherStats();
      return;
    }

    this.powerPopupOpen = !this.powerPopupOpen;
    const popup = document.getElementById('power-popup-menu');
    if (this.powerPopupOpen) {
      popup.classList.remove('hidden');
      this.correctSteps++;
      Voice.playTing();
      if (!this.isFreePractice) {
        document.getElementById('arrow-power-btn').classList.add('hidden');
        document.getElementById('arrow-shutdown-btn').classList.remove('hidden');
        document.getElementById('win11-banner-desc').innerHTML =
          '👉 <b>Bước 3:</b> Nháy chuột chọn lệnh <b>Shut down</b>.';
        Voice.speak('Giỏi lắm! Bước 3 nè, em nháy chuột chọn dòng chữ Shut down để tắt máy nghe.');
      }
    } else {
      popup.classList.add('hidden');
    }
    this.updateTeacherStats();
  },

  wrongPowerOption() {
    this.hintsCount++;
    Voice.playHintTone();
    this.showToast('💡', 'Hãy quan sát lại hướng dẫn và chọn lệnh Shut down nghe!');
    Voice.speak('Để tắt hẳn máy tính thì mình chọn dòng lệnh Shut down ở giữa nghe em!');
    this.updateTeacherStats();
  },

  clickShutDownOption() {
    if (this.browserOpen || this.rapidOpen) {
      document.getElementById('unclosed-warning-modal').classList.remove('hidden');
      return;
    }

    this.correctSteps++;
    Voice.playTing();
    document.getElementById('power-popup-menu').classList.add('hidden');
    document.getElementById('win11-start-menu').classList.add('hidden');
    document.getElementById('win11-shutting-down').classList.remove('hidden');
    this.showToast('✅', 'Chính xác! Hệ điều hành Windows 11 đang tắt.');

    setTimeout(() => {
      this.closeWindows11Screen();
      this.moveCamera('desk');

      this.cpuPowerOn = false;
      this.cpuShuttingDownComplete = true;
      document.getElementById('cpu-btn-3d').setAttribute('color', '#E53935');
      document.getElementById('cpu-led-3d').setAttribute('color', '#455A64');
      document.getElementById('screen-3d-content').setAttribute('visible', 'false');

      document.getElementById('btn-quick-monitor').classList.remove('hidden');
      if (!this.isFreePractice) {
        this.set3DHighlights({ cpu: false, mon: true });
      }

      document.getElementById('guide-title').innerText = '👉 BƯỚC 4: TẮT CÔNG TẮC MÀN HÌNH';
      document.getElementById('guide-message').innerHTML =
        'Đèn trên thân máy (CPU) đã tắt hẳn! Bây giờ em hãy <b>nhấn nút nguồn của màn hình</b> để hoàn tất nghe.';

      Voice.speak('Em nhìn kìa, đèn trên thân máy đã tắt hẳn rồi đó. Bước cuối cùng, em nhấn nút nguồn để tắt màn hình nữa là xong nghe!');
    }, 2200);

    this.updateTeacherStats();
  },

  finishLesson() {
    this.mode = 'completed';
    const elapsedSec = this.startTime ? Math.max(8, Math.round((Date.now() - this.startTime) / 1000)) : 35;

    document.getElementById('stat-correct').innerText = `${this.correctSteps} bước`;
    document.getElementById('stat-hints').innerText = `${this.hintsCount} lần`;
    document.getElementById('stat-time').innerText = `${elapsedSec} giây`;

    document.getElementById('completion-modal').classList.remove('hidden');
    Voice.playStartupChime();

    Voice.speak('Xuất sắc quá em ơi! Em đã thực hành bật và tắt máy tính đúng chuẩn rồi đó. Thầy khen ngợi và trao tặng em huy hiệu Bé sử dụng máy tính an toàn nghe!');
    this.saveProgress(elapsedSec);
    this.updateTeacherStats();
  },

  updateStepCards(currentStep) {
    for (let i = 1; i <= 2; i++) {
      const card = document.getElementById(`pon-step-${i}`);
      if (!card) continue;
      card.classList.remove('active-step', 'done-step');
      if (i < currentStep) card.classList.add('done-step');
      else if (i === currentStep) card.classList.add('active-step');
    }
  },

  set3DHighlights({ cpu, mon }) {
    document.getElementById('hl-cpu').setAttribute('visible', cpu);
    document.getElementById('hl-monitor').setAttribute('visible', mon);
  },

  resetHardwareOff() {
    this.cpuPowerOn = false;
    this.monitorPowerOn = false;
    this.cpuShuttingDownComplete = false;

    document.getElementById('cpu-btn-3d').setAttribute('color', '#E53935');
    document.getElementById('cpu-led-3d').setAttribute('color', '#455A64');
    document.getElementById('monitor-btn-3d').setAttribute('color', '#546E7A');
    document.getElementById('monitor-led-3d').setAttribute('color', '#37474F');
    document.getElementById('screen-3d-content').setAttribute('visible', 'false');
  },

  showToast(icon, text) {
    const toast = document.getElementById('feedback-toast');
    document.getElementById('toast-icon').innerText = icon;
    document.getElementById('toast-text').innerText = text;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
  },

  toggleSound() {
    Voice.enabled = !Voice.enabled;
    if (!Voice.enabled) Voice.stopSpeaking();
    const icon = Voice.enabled ? '🔊' : '🔇';
    document.getElementById('btn-sound-hud').innerText = icon;
    document.querySelectorAll('.sound-icon').forEach(el => (el.innerText = icon));
    this.showToast(icon, Voice.enabled ? 'Đã bật âm thanh & giọng Thầy giáo Đà Nẵng' : 'Đã tắt âm thanh');
  },

  closeWarningModal() {
    document.getElementById('unclosed-warning-modal').classList.add('hidden');
  },

  closeWarningModalAndHighlight() {
    this.closeWarningModal();
    document.getElementById('arrow-close-browser').classList.remove('hidden');
    document.getElementById('arrow-close-rapid').classList.remove('hidden');
  },

  open4StepsModal() {
    document.getElementById('four-steps-modal').classList.remove('hidden');
  },

  close4StepsModal() {
    document.getElementById('four-steps-modal').classList.add('hidden');
  },

  speakFourSteps() {
    Voice.speak('Thầy đọc bốn bước tắt máy tính đúng cách để em dễ nhớ nghe: Bước 1, đóng hết các chương trình đang mở rồi nháy chuột vô nút Start. Bước 2, nháy chuột vô biểu tượng nút nguồn Power. Bước 3, chọn dòng lệnh Shut down. Và bước 4, đợi đèn trên thân máy tắt hẳn rồi mình mới tắt công tắc màn hình nghe!');
  },

  openHelpModal() {
    document.getElementById('help-modal').classList.remove('hidden');
  },

  closeHelpModal() {
    document.getElementById('help-modal').classList.add('hidden');
  },

  openTeacherModal() {
    this.updateTeacherStats();
    Voice.updateDiagnosticUI();
    document.getElementById('teacher-modal').classList.remove('hidden');
  },

  closeTeacherModal() {
    document.getElementById('teacher-modal').classList.add('hidden');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  },

  returnToClassroom() {
    this.closeAllModals();
    this.closeWindows11Screen();
    this.moveCamera('room');
  },

  restartAll() {
    this.closeAllModals();
    this.closeWindows11Screen();
    this.correctSteps = 0;
    this.hintsCount = 0;
    this.startTime = Date.now();
    this.startActivity1();
  },

  updateTeacherStats() {
    const elapsed = this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0;
    document.getElementById('t-status').innerText =
      this.mode === 'completed' ? '✅ Đã hoàn thành' : '⏳ Đang thực hành';
    document.getElementById('t-correct').innerText = this.correctSteps;
    document.getElementById('t-hints').innerText = this.hintsCount;
    document.getElementById('t-time').innerText = `${elapsed} giây`;
    document.getElementById('t-mode').innerText = this.isFreePractice ? 'Tự thực hành' : 'Có hướng dẫn';
  },

  saveProgress(elapsedSec) {
    try {
      localStorage.setItem(
        'vr_tinhoc_bai4_win11',
        JSON.stringify({
          correctSteps: this.correctSteps,
          hintsCount: this.hintsCount,
          elapsedSec,
          completedAt: new Date().toLocaleString('vi-VN')
        })
      );
    } catch (e) {}
  },

  loadSavedProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('vr_tinhoc_bai4_win11'));
      if (saved) {
        this.correctSteps = saved.correctSteps || 0;
        this.hintsCount = saved.hintsCount || 0;
      }
    } catch (e) {}
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
