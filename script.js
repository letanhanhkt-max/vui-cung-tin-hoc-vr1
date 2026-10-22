/**
 * ============================================================================
 * HỆ THỐNG ĐIỀU KHIỂN PHÒNG HỌC TIN HỌC ẢO 360° & GIỌNG THẦY GIÁO ĐÀ NẴNG ẤM ÁP
 * Bài 4: Làm việc với máy tính (Bật và tắt máy tính đúng cách trong Windows 11)
 * ============================================================================
 */

class DaNangTeacherVoiceEngine {
  constructor() {
    this.enabled = true;
    this.daNangWarmStyle = true; // true: Phong cách Thầy giáo Đà Nẵng ấm áp, thân thương
    this.ctx = null;
    this.viVoice = null;
    this.isMaleViVoice = false;
    this.cloudAudio = null;
    this.lastSpokenText = '';

    this.initVoices();
  }

  // Khởi tạo và lắng nghe danh sách giọng đọc tiếng Việt trên trình duyệt
  initVoices() {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      // Chỉ lọc các giọng đọc Tiếng Việt thật sự (Chặn tuyệt đối giọng Tiếng Anh đọc lơ lớ)
      const viVoices = voices.filter(
        v =>
          v.lang.toLowerCase().includes('vi') ||
          v.name.toLowerCase().includes('viet') ||
          v.name.toLowerCase().includes('namminh') ||
          v.name.toLowerCase().includes('hoaimy') ||
          v.name.toLowerCase().includes(' microsoft an')
      );

      if (viVoices.length > 0) {
        // Ưu tiên số 1: Giọng Nam Tiếng Việt tự nhiên (Microsoft NamMinh / Microsoft An / Male)
        const maleVoice = viVoices.find(
          v =>
            v.name.toLowerCase().includes('namminh') ||
            v.name.toLowerCase().includes(' an ') ||
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('nam')
        );

        if (maleVoice) {
          this.viVoice = maleVoice;
          this.isMaleViVoice = true;
        } else {
          // Nếu máy chỉ có giọng Tiếng Việt chung, chọn và hạ trầm Pitch để tạo âm sắc ấm áp của Thầy giáo
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
      diagEl.innerHTML = `✅ Đã kích hoạt giọng Tiếng Việt bản địa: <b>${this.viVoice.name}</b> (${
        this.isMaleViVoice ? 'Giọng Nam Thầy giáo chuẩn' : 'Đã tinh chỉnh âm trầm ấm Thầy giáo'
      }) – Chế độ: <b>${this.daNangWarmStyle ? 'Thầy giáo Đà Nẵng ấm áp' : 'Tiếng Việt phổ thông'}</b>.`;
    } else {
      diagEl.innerHTML = `🌐 Thiết bị chưa cài gói giọng Tiếng Việt offline. Đã tự động bật <b>Luồng Giọng Đọc Tiếng Việt Đám Mây Ấm Áp</b> (Gợi ý: Mở bằng trình duyệt Microsoft Edge trên Windows 11 để có giọng Thầy NamMinh Neural siêu thực).`;
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

  // Chuyển hóa lời dẫn sang âm hưởng Thầy giáo Đà Nẵng ấm áp, nhẹ nhàng, khích lệ
  localizeDaNangTeacherText(standardText, daNangText) {
    return this.daNangWarmStyle && daNangText ? daNangText : standardText;
  }

  // Phát giọng nói Thầy giáo Tiếng Việt (Không bao giờ dùng giọng Tiếng Anh)
  speak(standardText, daNangText = null) {
    const textToSpeak = this.localizeDaNangTeacherText(standardText, daNangText);
    this.lastSpokenText = textToSpeak;

    if (!this.enabled) return;

    // Dừng âm thanh đang đọc trước đó
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.cloudAudio) {
      this.cloudAudio.pause();
      this.cloudAudio = null;
    }

    // Tầng 1: Nếu thiết bị có sẵn giọng Tiếng Việt (vi-VN)
    if (this.viVoice && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.voice = this.viVoice;
      utter.lang = 'vi-VN';

      // Tinh chỉnh nhịp điệu chậm rãi, trầm ấm của người thầy Đà Nẵng
      utter.rate = 0.92;
      utter.pitch = this.isMaleViVoice ? 0.94 : 0.78; // Hạ pitch trầm ấm nếu là giọng trung tính
      utter.volume = 1.0;

      window.speechSynthesis.speak(utter);
      return;
    }

    // Tầng 2: Nếu trình duyệt chỉ có giọng Tiếng Anh -> Chặn giọng Anh, dùng Cloud Tiếng Việt ấm áp
    try {
      const encoded = encodeURIComponent(textToSpeak);
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&dt=t&q=${encoded}`;
      this.cloudAudio = new Audio(url);
      // Điều chỉnh tốc độ và độ trầm để tạo cảm giác giọng thầy giáo điềm đạm
      this.cloudAudio.preservesPitch = false;
      this.cloudAudio.mozPreservesPitch = false;
      this.cloudAudio.webkitPreservesPitch = false;
      this.cloudAudio.playbackRate = 0.91;
      this.cloudAudio.play().catch(() => {});
    } catch (e) {}
  }

  replayLast() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, this.lastSpokenText);
    }
  }

  // Âm thanh "Ting" dịu nhẹ khi học sinh thao tác đúng
  playTing() {
    if (!this.enabled) return;
    this.initAudioContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5 ấm hơn
    osc.frequency.setValueAtTime(783.99, now + 0.09); // G5
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Âm thanh gợi ý nhẹ nhàng
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

  // Âm thanh khởi động Windows 11 êm ái
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

const App = {
  // 'act1_poweron' | 'act2_shutdown_guided' | 'act3_free_practice' | 'completed'
  mode: 'act1_poweron',
  isFreePractice: false,

  // Trạng thái phần cứng (CPU & Màn hình)
  cpuPowerOn: false,
  monitorPowerOn: false,
  cpuShuttingDownComplete: false,

  // Trạng thái cửa sổ trên Windows 11
  browserOpen: true,
  rapidOpen: true,
  startMenuOpen: false,
  powerPopupOpen: false,

  // Thống kê học tập
  correctSteps: 0,
  hintsCount: 0,
  startTime: null,

  init() {
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
    if (kb3d) {
      kb3d.addEventListener('click', () => {
        this.showToast('💡', 'Đây là Bàn phím. Mình tìm nút nguồn trên thân máy và màn hình trước nghe!');
        Voice.speak(
          'Đây là bàn phím máy tính. Em hãy tìm nút nguồn trên thân máy trước nhé.',
          'Đây là bàn phím máy tính đó em. Mình tìm nút nguồn trên thân máy để bật trước nghe!'
        );
      });
    }
    if (mouse3d) {
      mouse3d.addEventListener('click', () => {
        this.showToast('💡', 'Đây là Chuột máy tính giúp em điều khiển con trỏ trên màn hình.');
        Voice.speak(
          'Đây là chuột máy tính giúp em điều khiển con trỏ trên màn hình.',
          'Đây là con chuột máy tính giúp em điều khiển mũi tên trên màn hình đó nghe.'
        );
      });
    }
  },

  // ==========================================================================
  // ĐIỀU KHIỂN CAMERA VR MƯỢT MÀ
  // ==========================================================================
  resetCameraLook() {
    const camEl = document.getElementById('main-camera');
    if (camEl && camEl.components && camEl.components['look-controls']) {
      const lc = camEl.components['look-controls'];
      if (lc.pitchObject) lc.pitchObject.rotation.x = -0.06;
      if (lc.yawObject) lc.yawObject.rotation.y = 0;
    }
  },

  moveCamera(target) {
    const rig = document.getElementById('camera-rig');
    document.querySelectorAll('.btn-cam').forEach(b => b.classList.remove('active'));
    this.resetCameraLook();

    if (target === 'room') {
      rig.setAttribute('animation', 'property: position; to: 0 1.45 1.1; dur: 750; easing: easeInOutQuad');
      document.getElementById('cam-room').classList.add('active');
    } else if (target === 'desk') {
      rig.setAttribute('animation', 'property: position; to: 0 1.24 -0.20; dur: 750; easing: easeInOutQuad');
      document.getElementById('cam-desk').classList.add('active');
    } else if (target === 'monitor') {
      rig.setAttribute('animation', 'property: position; to: 0.08 1.12 -0.65; dur: 700; easing: easeInOutQuad');
      document.getElementById('cam-monitor').classList.add('active');
    }
  },

  focusHint(part) {
    this.moveCamera('desk');
    if (part === 'cpu') {
      this.showToast('💡', 'Bước 1: Nhấn nút nguồn màu đỏ trên thân máy (CPU) ở bên trái màn hình.');
      Voice.speak(
        'Bước 1: Em hãy nhấn nút nguồn màu đỏ trên thân máy tính nhé.',
        'Bước 1 nè: Em nhìn qua bên trái màn hình, nhấn vô nút nguồn màu đỏ trên thân máy nghe.'
      );
    } else {
      this.showToast('💡', 'Bước 2: Nhấn nút nguồn ở góc dưới bên phải màn hình.');
      Voice.speak(
        'Bước 2: Em hãy nhấn nút nguồn của màn hình.',
        'Bước 2 nè: Em nhấn nhẹ vô nút nguồn ở góc dưới bên phải màn hình nghe.'
      );
    }
  },

  testTeacherVoice() {
    Voice.initAudioContext();
    Voice.speak(
      'Thầy chào các em! Hôm nay thầy trò chúng mình cùng thực hành bật và tắt máy tính đúng cách trong Windows 11 nhé.',
      'Thầy chào các em nghe! Hôm nay thầy trò mình tại Đà Nẵng cùng khám phá phòng học Tin học ảo, thực hành bật và tắt máy tính Windows 11 thật an toàn và đúng cách nghe!'
    );
    this.showToast('🎙️', 'Đang phát giọng hướng dẫn ấm áp của Thầy giáo...');
  },

  toggleDialectStyle() {
    Voice.daNangWarmStyle = !Voice.daNangWarmStyle;
    const btn = document.getElementById('btn-voice-style');
    if (btn) {
      btn.innerText = Voice.daNangWarmStyle
        ? '🎙️ Giọng Thầy: Đà Nẵng ấm áp'
        : '🎙️ Giọng Thầy: Phổ thông';
    }
    Voice.updateDiagnosticUI();
    this.testTeacherVoice();
  },

  replayCurrentInstruction() {
    Voice.replayLast();
  },

  // ==========================================================================
  // KHỞI ĐẦU & HOẠT ĐỘNG 1: BẬT MÁY TÍNH ĐÚNG CÁCH (2 BƯỚC)
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

    Voice.speak(
      'Hoạt động 1: Bật máy tính đúng cách. Bước 1: Em hãy nhấn nút nguồn trên thân máy tính nhé.',
      'Thầy chào em nghe! Đầu tiên mình học cách bật máy tính đúng cách. Bước 1, em hãy nhấn vô nút nguồn màu đỏ trên thân máy tính nghe!'
    );
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

        Voice.speak(
          'Tốt lắm! Thân máy đã bật. Bước 2: Em hãy nhấn nút nguồn của màn hình nhé.',
          'Đúng rồi đó em, giỏi lắm! Đèn thân máy sáng rồi. Bước 2, em nhấn tiếp nút nguồn của màn hình ở góc dưới bên phải nghe!'
        );
        this.updateTeacherStats();
      }
      return;
    }

    // Nếu đang ở Hoạt động tắt máy mà bấm nút nguồn CPU
    if (this.cpuPowerOn && !this.cpuShuttingDownComplete) {
      this.hintsCount++;
      Voice.playHintTone();
      this.showToast('💡', 'Đừng nhấn nút nguồn trên thân máy để tắt nghe! Hãy tắt bằng lệnh Shut down trên màn hình.');
      Voice.speak(
        'Em không nên nhấn nút nguồn trên thân máy để tắt đột ngột. Hãy tắt trên màn hình Windows 11 nhé.',
        'Khoan đã nghe em! Mình không nhấn nút nguồn trên thân máy để tắt đột ngột mô, dễ hư máy lắm. Em tắt trên màn hình Windows 11 nghe!'
      );
      this.updateTeacherStats();
    }
  },

  // Bước 2 (Bật màn hình) HOẶC Bước 4 (Tắt màn hình sau khi CPU tắt)
  clickMonitorPower() {
    // 1. Đang ở Hoạt động 1 (Bật máy tính)
    if (this.mode === 'act1_poweron') {
      if (!this.cpuPowerOn) {
        this.hintsCount++;
        Voice.playHintTone();
        this.showToast('💡', 'Hãy tìm nút nguồn trên thân máy tính (CPU) và nhấn trước nghe!');
        Voice.speak(
          'Hãy tìm nút nguồn trên thân máy tính và nhấn trước nhé.',
          'Em ơi, mình nhớ nhấn nút nguồn màu đỏ trên thân máy tính trước rồi mới bật màn hình nghe!'
        );
        this.updateTeacherStats();
        return;
      }

      if (!this.monitorPowerOn) {
        this.monitorPowerOn = true;
        document.getElementById('monitor-btn-3d').setAttribute('color', '#00E676');
        document.getElementById('monitor-led-3d').setAttribute('color', '#00E676');
        document.getElementById('screen-3d-content').setAttribute('visible', 'true');
        this.correctSteps++;

        Voice.playStartupChime();
        this.updateStepCards(3);
        this.set3DHighlights({ cpu: false, mon: false });
        document.getElementById('btn-quick-monitor').classList.add('hidden');

        this.showToast('✅', 'Em đã bật máy tính đúng cách!');
        document.getElementById('guide-title').innerText = '✅ EM ĐÃ BẬT MÁY TÍNH ĐÚNG CÁCH!';
        document.getElementById('guide-message').innerHTML =
          'Màn hình Windows 11 đã sáng lên rồi! Em hãy nhấn nút <b>"🛑 Hoạt động 2: Tắt máy tính đúng cách"</b> bên dưới để thực hành tiếp nghe.';

        document.getElementById('btn-act-win11').classList.remove('hidden');
        document.getElementById('btn-act-shutdown').classList.remove('hidden');

        Voice.speak(
          'Chúc mừng! Em đã bật máy tính đúng cách. Bây giờ chúng mình chuyển sang Hoạt động 2: Tắt máy tính đúng cách nhé.',
          'Tuyệt vời quá! Rứa là em đã bật máy tính đúng cách rồi đó. Bây giờ thầy trò mình qua Hoạt động 2: Tắt máy tính đúng cách nghe!'
        );
        this.updateTeacherStats();
      }
      return;
    }

    // 2. Đang ở bước cuối cùng của Tắt máy tính (Sau khi đèn CPU đã tắt)
    if (this.mode === 'act2_shutdown_guided' || this.mode === 'act3_free_practice') {
      if (!this.cpuShuttingDownComplete) {
        this.hintsCount++;
        Voice.playHintTone();
        this.showToast('💡', 'Hãy đóng các chương trình và chọn Start → Power → Shut down trước khi tắt màn hình nghe!');
        Voice.speak(
          'Em hãy đóng các chương trình và chọn lệnh Shut down trước khi tắt màn hình nhé.',
          'Em nhớ đóng hết phần mềm rồi chọn Shut down trên màn hình trước, đợi đèn thân máy tắt hẳn rồi mới tắt màn hình nghe!'
        );
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

        Voice.speak(
          'Em làm rất tốt! Bây giờ hãy chuyển sang chế độ Em tự thực hành để nhận huy hiệu nhé.',
          'Giỏi quá chừng luôn! Em đã nắm vững bốn bước tắt máy rồi đó. Giờ em bấm qua chế độ Em tự thực hành để nhận huy hiệu khen thưởng của thầy nghe!'
        );
      } else {
        this.finishLesson();
      }
      this.updateTeacherStats();
    }
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
    document.getElementById('mode-pill-win').innerText = 'Chế độ có hướng dẫn';

    document.getElementById('arrow-close-browser').classList.remove('hidden');
    document.getElementById('arrow-close-rapid').classList.remove('hidden');

    this.moveCamera('monitor');
    this.openWindows11Screen();

    document.getElementById('win11-banner-title').innerText = '❓ TRƯỚC KHI TẮT MÁY, EM CẦN LÀM GÌ?';
    document.getElementById('win11-banner-desc').innerHTML =
      'Trên màn hình đang mở <b>Trình duyệt Web</b> và <b>Rapid</b>. Em hãy tìm nút <b>✕</b> ở góc trên bên phải từng cửa sổ để đóng lại nghe!';

    Voice.speak(
      'Trước khi tắt máy, em cần làm gì? Hãy tìm nút X ở góc trên bên phải mỗi cửa sổ để đóng các chương trình đang mở nhé.',
      'Trước khi tắt máy, đố em mình cần làm chi nào? À, trên màn hình đang mở Trình duyệt Web và phần mềm luyện gõ phím. Em nhấn vô dấu nhân màu đỏ ở góc trên bên phải để đóng cả hai cửa sổ lại nghe!'
    );
  },

  // ==========================================================================
  // CHẾ ĐỘ THỰC HÀNH TỰ DO (MỤC 9 - KHÔNG HIỆN MŨI TÊN CHỈ DẪN)
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

    Voice.speak(
      'Chế độ Em tự thực hành bắt đầu. Em hãy tự thực hiện lần lượt các bước để tắt máy tính đúng cách nhé.',
      'Bây giờ tới phần Em tự thực hành, thầy không để sẵn mũi tên gợi ý nữa. Em tự tay đóng hai phần mềm rồi tắt máy tính đúng quy trình cho thầy xem nghe!'
    );
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

    document.getElementById('win-app-browser').classList.remove('hidden');
    document.getElementById('win-app-rapid').classList.remove('hidden');
    document.getElementById('tb-icon-browser').classList.add('active');
    document.getElementById('tb-icon-rapid').classList.add('active');
    document.getElementById('win11-start-menu').classList.add('hidden');
    document.getElementById('power-popup-menu').classList.add('hidden');
    document.getElementById('win11-shutting-down').classList.add('hidden');
  },

  // ==========================================================================
  // XỬ LÝ TƯƠNG TÁC TRÊN GIAO DIỆN WINDOWS 11
  // ==========================================================================
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
    Voice.speak(
      'Hãy tìm nút X ở góc trên bên phải cửa sổ để đóng chương trình nhé.',
      'Nút đó là thu nhỏ phóng to thôi em. Em nháy vô nút chữ X màu đỏ ở góc trên bên phải cửa sổ để đóng chương trình nghe!'
    );
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

    // Nếu mới đóng 1 cửa sổ, khích lệ đóng cửa sổ còn lại
    if (this.browserOpen !== this.rapidOpen) {
      Voice.speak(
        'Tốt lắm! Em đã đóng được một chương trình. Hãy đóng tiếp chương trình còn lại nhé.',
        'Giỏi lắm đó em! Mình đóng thêm cửa sổ phần mềm còn lại nữa là xong bước một nghe.'
      );
    }

    // Khi đã đóng hết cả 2 chương trình
    if (!this.browserOpen && !this.rapidOpen) {
      if (!this.isFreePractice) {
        document.getElementById('btn-show-4steps').classList.remove('hidden');
        document.getElementById('arrow-start-btn').classList.remove('hidden');
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH ĐANG MỞ!';
        document.getElementById('win11-banner-desc').innerHTML =
          '👉 <b>Bước 1:</b> Nháy chuột vào nút <b>Start</b> trên thanh Taskbar ở bên dưới màn hình.';
        this.open4StepsModal();
        Voice.speak(
          'Em đã đóng hết các chương trình đang mở. Hãy quan sát bảng 4 bước tắt máy tính đúng cách nhé.',
          'Hay quá! Em đã đóng sạch các chương trình đang mở rồi. Giờ em xem kỹ bốn bước tắt máy tính trên bảng hướng dẫn của thầy nghe!'
        );
      } else {
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH!';
        document.getElementById('win11-banner-desc').innerHTML =
          'Bây giờ em hãy nhấn <b>Start ➔ Power ➔ Shut down</b> nghe!';
        Voice.speak(
          'Tốt lắm! Bây giờ em hãy nhấn nút Start, chọn Power và chọn Shut down nhé.',
          'Đúng rồi đó em! Giờ em nhấn nút Start ở thanh bên dưới, chọn Power rồi bấm Shut down nghe!'
        );
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
          Voice.speak(
            'Bước 2: Em hãy nháy chuột vào biểu tượng Power hình vòng tròn có gạch dọc nhé.',
            'Chính xác! Qua bước 2, em nháy chuột vô biểu tượng nút nguồn Power ở góc dưới bên phải bảng Start nghe.'
          );
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

    // KIỂM TRA TRƯỚC KHI TẮT MÁY: NẾU CÒN CHƯƠNG TRÌNH ĐANG MỞ
    if (this.browserOpen || this.rapidOpen) {
      this.hintsCount++;
      Voice.playHintTone();
      document.getElementById('win11-start-menu').classList.add('hidden');
      this.startMenuOpen = false;
      document.getElementById('unclosed-warning-modal').classList.remove('hidden');

      Voice.speak(
        'Em chưa đóng hết các chương trình đang mở. Hãy đóng các chương trình trước khi tắt máy để tránh mất dữ liệu nhé.',
        'Khoan tắt máy nghe em! Em còn chương trình đang mở trên màn hình kìa. Mình đóng hết các chương trình trước khi tắt máy để khỏi bị mất dữ liệu nghe!'
      );
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
        Voice.speak(
          'Bước 3: Em hãy nháy chuột chọn lệnh Shut down.',
          'Giỏi lắm! Bước 3 nè, em nháy chuột chọn dòng chữ Shut down để tắt máy nghe.'
        );
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
    Voice.speak(
      'Hãy quan sát lại hướng dẫn và chọn lệnh Shut down để tắt máy tính nhé.',
      'Để tắt hẳn máy tính thì mình chọn dòng lệnh Shut down ở giữa nghe em!'
    );
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

      Voice.speak(
        'Đèn trên thân máy đã tắt hẳn, bây giờ em hãy nhấn nút nguồn để tắt màn hình nhé.',
        'Em nhìn kìa, đèn trên thân máy đã tắt hẳn rồi đó. Bước cuối cùng, em nhấn nút nguồn để tắt màn hình nữa là xong nghe!'
      );
    }, 2200);

    this.updateTeacherStats();
  },

  // ==========================================================================
  // HOÀN THÀNH & TRAO HUY HIỆU
  // ==========================================================================
  finishLesson() {
    this.mode = 'completed';
    const elapsedSec = this.startTime ? Math.max(8, Math.round((Date.now() - this.startTime) / 1000)) : 35;

    document.getElementById('stat-correct').innerText = `${this.correctSteps} bước`;
    document.getElementById('stat-hints').innerText = `${this.hintsCount} lần`;
    document.getElementById('stat-time').innerText = `${elapsedSec} giây`;

    document.getElementById('completion-modal').classList.remove('hidden');
    Voice.playStartupChime();

    Voice.speak(
      'Hoàn thành! Em đã biết cách bật và tắt máy tính đúng cách. Thầy trao tặng em huy hiệu Bé sử dụng máy tính an toàn.',
      'Xuất sắc quá em ơi! Em đã thực hành bật và tắt máy tính đúng chuẩn rồi đó. Thầy khen ngợi và trao tặng em huy hiệu Bé sử dụng máy tính an toàn nghe!'
    );
    this.saveProgress(elapsedSec);
    this.updateTeacherStats();
  },

  // ==========================================================================
  // HÀM BỔ TRỢ GIAO DIỆN
  // ==========================================================================
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
    const icon = Voice.enabled ? '🔊' : '🔇';
    document.getElementById('btn-sound-hud').innerText = icon;
    document.querySelectorAll('.sound-icon').forEach(el => (el.innerText = icon));
    this.showToast(icon, Voice.enabled ? 'Đã bật âm thanh & giọng Thầy giáo' : 'Đã tắt âm thanh');
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
    Voice.speak(
      'Tắt máy tính đúng cách gồm 4 bước: Bước 1: Đóng các chương trình đang mở, nháy chuột vào nút Start. Bước 2: Nháy chuột vào biểu tượng Power. Bước 3: Nháy chuột chọn lệnh Shut down. Bước 4: Đợi đèn trên thân máy tắt hẳn, sau đó tắt công tắc màn hình.',
      'Thầy đọc bốn bước tắt máy tính đúng cách để em dễ nhớ nghe: Bước 1, đóng hết các chương trình đang mở rồi nháy chuột vô nút Start. Bước 2, nháy chuột vô biểu tượng nút nguồn Power. Bước 3, chọn dòng lệnh Shut down. Và bước 4, đợi đèn trên thân máy tắt hẳn rồi mình mới tắt công tắc màn hình nghe!'
    );
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
