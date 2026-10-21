/**
 * ============================================================================
 * HỆ THỐNG ĐIỀU KHIỂN PHÒNG HỌC TIN HỌC ẢO 360°
 * Bài 4: Làm việc với máy tính (Bật và tắt máy tính đúng cách trong Windows 11)
 * Đã kiểm thử & tối ưu hóa:
 * - Bỏ bước bật nguồn điện (Trực tiếp Bật thân máy CPU -> Bật màn hình)
 * - Mở rộng vùng chạm 3D (Hitbox) + Nút thao tác nhanh siêu mượt
 * - Tự động căn chỉnh góc nhìn Camera chính diện máy tính
 * ============================================================================
 */

class SoundSystem {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Âm thanh "Ting" khi thao tác đúng
  playTing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // Âm thanh gợi ý nhẹ nhàng khi chưa đúng thứ tự
  playHintTone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.22);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  // Âm thanh khởi động Windows 11 êm dịu
  playStartupChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chords = [261.63, 329.63, 392.00, 523.25];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = this.ctx.currentTime + idx * 0.11;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  }

  // Giọng đọc hướng dẫn tiếng Việt
  speak(text) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = 0.96;
    window.speechSynthesis.speak(utter);
  }
}

const SFX = new SoundSystem();

const App = {
  // 'act1_poweron' | 'act2_shutdown_guided' | 'act3_free_practice' | 'completed'
  mode: 'act1_poweron',
  isFreePractice: false,

  // Trạng thái phần cứng (Chỉ gồm CPU và Màn hình)
  cpuPowerOn: false,
  monitorPowerOn: false,
  cpuShuttingDownComplete: false,

  // Trạng thái phần mềm trên Windows 11
  browserOpen: true,
  rapidOpen: true,
  startMenuOpen: false,
  powerPopupOpen: false,

  // Thống kê kết quả
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

    // Gắn sự kiện cho cả nút 3D và vùng đệm cảm ứng mở rộng (Hitbox)
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
        this.showToast('💡', 'Đây là Bàn phím. Em hãy tìm nút nguồn trên thân máy và màn hình nhé!');
      });
    }
    if (mouse3d) {
      mouse3d.addEventListener('click', () => {
        this.showToast('💡', 'Đây là Chuột máy tính giúp em điều khiển con trỏ trên màn hình.');
      });
    }
  },

  // ==========================================================================
  // ĐIỀU KHIỂN CAMERA VR & TỰ ĐỘNG CĂN CHÍNH DIỆN MÁY TÍNH
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
    } else {
      this.showToast('💡', 'Bước 2: Nhấn nút nguồn ở góc dưới bên phải màn hình.');
    }
  },

  // ==========================================================================
  // KHỞI ĐẦU & HOẠT ĐỘNG 1: BẬT MÁY TÍNH ĐÚNG CÁCH (2 BƯỚC)
  // ==========================================================================
  startExploration() {
    SFX.init();
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
      '👉 <b>Bước 1:</b> Em hãy nhấn <b>nút nguồn trên thân máy (CPU)</b> để khởi động máy tính nhé!';

    document.getElementById('power-on-steps').classList.remove('hidden');
    document.getElementById('btn-quick-cpu').classList.remove('hidden');
    document.getElementById('btn-quick-monitor').classList.add('hidden');
    document.getElementById('btn-act-win11').classList.add('hidden');
    document.getElementById('btn-act-shutdown').classList.add('hidden');
    document.getElementById('btn-act-practice').classList.add('hidden');

    this.updateStepCards(1);
    this.set3DHighlights({ cpu: true, mon: false });
    SFX.speak('Hoạt động 1: Bật máy tính đúng cách. Bước 1: Em hãy nhấn nút nguồn trên thân máy.');
  },

  // Bước 1: Nhấn nút nguồn trên thân máy (CPU)
  clickCpuPower() {
    if (this.mode === 'act1_poweron') {
      if (!this.cpuPowerOn) {
        this.cpuPowerOn = true;
        document.getElementById('cpu-btn-3d').setAttribute('color', '#00E676');
        document.getElementById('cpu-led-3d').setAttribute('color', '#00E676');
        this.correctSteps++;
        SFX.playTing();
        this.showToast('✅', 'Chính xác! Thân máy (CPU) đã bật đèn báo sáng.');

        this.updateStepCards(2);
        this.set3DHighlights({ cpu: false, mon: true });
        document.getElementById('btn-quick-cpu').classList.add('hidden');
        document.getElementById('btn-quick-monitor').classList.remove('hidden');

        document.getElementById('guide-message').innerHTML =
          '👉 <b>Bước 2:</b> Em hãy nhấn <b>nút nguồn của màn hình</b> (ở góc dưới bên phải màn hình) nhé!';
        SFX.speak('Bước 2: Nhấn nút nguồn của màn hình.');
        this.updateTeacherStats();
      }
      return;
    }

    // Nếu đang ở Hoạt động tắt máy mà bấm nút nguồn CPU
    if (this.cpuPowerOn && !this.cpuShuttingDownComplete) {
      this.hintsCount++;
      SFX.playHintTone();
      this.showToast('💡', 'Không nên nhấn nút nguồn trên thân máy để tắt! Hãy tắt bằng lệnh Shut down trên Windows 11.');
      this.updateTeacherStats();
    }
  },

  // Bước 2 (Bật màn hình) HOẶC Bước 4 (Tắt màn hình sau khi CPU tắt)
  clickMonitorPower() {
    // 1. Đang ở Hoạt động 1 (Bật máy tính)
    if (this.mode === 'act1_poweron') {
      if (!this.cpuPowerOn) {
        this.hintsCount++;
        SFX.playHintTone();
        this.showToast('💡', 'Hãy tìm nút nguồn trên thân máy tính (CPU) và nhấn trước nhé!');
        this.updateTeacherStats();
        return;
      }

      if (!this.monitorPowerOn) {
        this.monitorPowerOn = true;
        document.getElementById('monitor-btn-3d').setAttribute('color', '#00E676');
        document.getElementById('monitor-led-3d').setAttribute('color', '#00E676');
        document.getElementById('screen-3d-content').setAttribute('visible', 'true');
        this.correctSteps++;

        SFX.playStartupChime();
        this.updateStepCards(3);
        this.set3DHighlights({ cpu: false, mon: false });
        document.getElementById('btn-quick-monitor').classList.add('hidden');

        this.showToast('✅', 'Em đã bật máy tính đúng cách!');
        document.getElementById('guide-title').innerText = '✅ EM ĐÃ BẬT MÁY TÍNH ĐÚNG CÁCH!';
        document.getElementById('guide-message').innerHTML =
          'Màn hình Windows 11 đã sáng lên! Hãy nhấn nút <b>"🛑 Hoạt động 2: Tắt máy tính đúng cách"</b> bên dưới để thực hành tiếp nhé.';

        document.getElementById('btn-act-win11').classList.remove('hidden');
        document.getElementById('btn-act-shutdown').classList.remove('hidden');

        SFX.speak('Em đã bật máy tính đúng cách!');
        this.updateTeacherStats();
      }
      return;
    }

    // 2. Đang ở bước cuối cùng của Tắt máy tính (Sau khi đèn CPU đã tắt)
    if (this.mode === 'act2_shutdown_guided' || this.mode === 'act3_free_practice') {
      if (!this.cpuShuttingDownComplete) {
        this.hintsCount++;
        SFX.playHintTone();
        this.showToast('💡', 'Hãy đóng các chương trình và chọn Start → Power → Shut down trước khi tắt màn hình nhé!');
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
      SFX.playTing();

      if (this.mode === 'act2_shutdown_guided') {
        this.showToast('🎉', 'Chính xác! Em đã hoàn thành 4 bước tắt máy tính đúng cách.');
        document.getElementById('guide-title').innerText = '🌟 ĐÃ TẮT MÁY TÍNH ĐÚNG CÁCH!';
        document.getElementById('guide-message').innerHTML =
          'Em làm rất tốt! Bây giờ hãy nhấn vào <b>"🎮 Chế độ: Em tự thực hành"</b> để tự mình thao tác và nhận Huy hiệu nhé!';
        document.getElementById('btn-act-practice').classList.remove('hidden');
        SFX.speak('Em làm rất tốt! Bây giờ hãy chuyển sang chế độ Em tự thực hành nhé.');
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
      'Trên màn hình đang mở <b>Trình duyệt Web</b> và <b>Rapid</b>. Em hãy tìm nút <b>✕</b> ở góc trên bên phải từng cửa sổ để đóng lại nhé!';

    SFX.speak('Trước khi tắt máy, em cần làm gì? Hãy tìm nút X ở góc trên bên phải mỗi cửa sổ để đóng chương trình.');
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

    // Ẩn toàn bộ mũi tên gợi ý
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

    SFX.speak('Chế độ Em tự thực hành. Em hãy tự thực hiện lần lượt các bước để tắt máy tính đúng cách nhé.');
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
    SFX.playHintTone();
    this.showToast('💡', 'Hãy tìm nút X ở góc trên bên phải cửa sổ.');
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
      SFX.playTing();
      this.showToast('✅', 'Tốt lắm! Em đã đóng chương trình Trình duyệt Web.');
    } else if (appName === 'rapid' && this.rapidOpen) {
      this.rapidOpen = false;
      document.getElementById('win-app-rapid').classList.add('hidden');
      document.getElementById('tb-icon-rapid').classList.remove('active');
      document.getElementById('mini-win-2').setAttribute('visible', 'false');
      this.correctSteps++;
      SFX.playTing();
      this.showToast('✅', 'Tốt lắm! Em đã đóng chương trình Rapid.');
    }

    if (!this.browserOpen && !this.rapidOpen) {
      if (!this.isFreePractice) {
        document.getElementById('btn-show-4steps').classList.remove('hidden');
        document.getElementById('arrow-start-btn').classList.remove('hidden');
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH ĐANG MỞ!';
        document.getElementById('win11-banner-desc').innerHTML =
          '👉 <b>Bước 1:</b> Nháy chuột vào nút <b>Start</b> trên thanh Taskbar ở bên dưới màn hình.';
        this.open4StepsModal();
      } else {
        document.getElementById('win11-banner-title').innerText = '✅ ĐÃ ĐÓNG HẾT CHƯƠNG TRÌNH!';
        document.getElementById('win11-banner-desc').innerHTML =
          'Bây giờ em hãy nhấn <b>Start ➔ Power ➔ Shut down</b> nhé!';
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
      SFX.playTing();

      if (!this.browserOpen && !this.rapidOpen) {
        this.correctSteps++;
        if (!this.isFreePractice) {
          document.getElementById('arrow-start-btn').classList.add('hidden');
          document.getElementById('arrow-power-btn').classList.remove('hidden');
          document.getElementById('win11-banner-desc').innerHTML =
            '👉 <b>Bước 2:</b> Nháy chuột vào biểu tượng <b>Power (⏻)</b> ở góc dưới bên phải bảng Start.';
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
      SFX.playHintTone();
      document.getElementById('win11-start-menu').classList.add('hidden');
      this.startMenuOpen = false;
      document.getElementById('unclosed-warning-modal').classList.remove('hidden');
      SFX.speak('Em chưa đóng hết các chương trình đang mở. Hãy đóng các chương trình trước khi tắt máy để tránh mất dữ liệu.');
      this.updateTeacherStats();
      return;
    }

    this.powerPopupOpen = !this.powerPopupOpen;
    const popup = document.getElementById('power-popup-menu');
    if (this.powerPopupOpen) {
      popup.classList.remove('hidden');
      this.correctSteps++;
      SFX.playTing();
      if (!this.isFreePractice) {
        document.getElementById('arrow-power-btn').classList.add('hidden');
        document.getElementById('arrow-shutdown-btn').classList.remove('hidden');
        document.getElementById('win11-banner-desc').innerHTML =
          '👉 <b>Bước 3:</b> Nháy chuột chọn lệnh <b>Shut down</b>.';
      }
    } else {
      popup.classList.add('hidden');
    }
    this.updateTeacherStats();
  },

  wrongPowerOption() {
    this.hintsCount++;
    SFX.playHintTone();
    this.showToast('💡', 'Hãy quan sát lại hướng dẫn và chọn lệnh Shut down nhé!');
    this.updateTeacherStats();
  },

  clickShutDownOption() {
    if (this.browserOpen || this.rapidOpen) {
      document.getElementById('unclosed-warning-modal').classList.remove('hidden');
      return;
    }

    this.correctSteps++;
    SFX.playTing();
    document.getElementById('power-popup-menu').classList.add('hidden');
    document.getElementById('win11-start-menu').classList.add('hidden');
    document.getElementById('win11-shutting-down').classList.remove('hidden');
    this.showToast('✅', 'Chính xác! Hệ điều hành Windows 11 đang tắt.');

    // Sau 2.2 giây: Đèn thân máy (CPU) tắt hẳn -> Chuyển về màn hình 3D để tắt nút nguồn màn hình
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
        'Đèn trên thân máy (CPU) đã tắt hẳn! Bây giờ em hãy <b>nhấn nút nguồn của màn hình</b> để hoàn tất nhé.';
      SFX.speak('Đèn trên thân máy đã tắt hẳn, bây giờ em hãy tắt công tắc màn hình.');
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
    SFX.playStartupChime();
    SFX.speak('Hoàn thành! Em đã biết cách bật và tắt máy tính đúng cách và nhận được huy hiệu Bé sử dụng máy tính an toàn.');
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
    this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
  },

  toggleSound() {
    SFX.enabled = !SFX.enabled;
    const icon = SFX.enabled ? '🔊' : '🔇';
    document.getElementById('btn-sound-hud').innerText = icon;
    document.querySelectorAll('.sound-icon').forEach(el => (el.innerText = icon));
    this.showToast(icon, SFX.enabled ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
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
    SFX.speak(
      'Tắt máy tính đúng cách gồm 4 bước: Bước 1: Đóng các chương trình đang mở, nháy chuột vào nút Start. Bước 2: Nháy chuột vào biểu tượng Power. Bước 3: Nháy chuột chọn lệnh Shut down. Bước 4: Đợi đèn trên thân máy tắt hẳn, sau đó tắt công tắc màn hình.'
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
