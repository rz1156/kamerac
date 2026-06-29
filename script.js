/**
 * ==========================================================================
 * CYBER ARCHITECT INTERFACE ENGINEERING DRIVER (ES6+)
 * Core Architecture: Canvas Graphics Pipeline, MediaPipe Pipeline Optimization
 * ==========================================================================
 */

class CyberCameraApp {
  constructor() {
    // Pipeline Layer Mappings
    this.dom = {
      initialCard: document.getElementById('initialCard'),
      btnOpenCamera: document.getElementById('btnOpenCamera'),
      loadingHud: document.getElementById('loadingHud'),
      loadingText: document.getElementById('loadingText'),
      progressBar: document.getElementById('progressBar'),
      cameraInterface: document.getElementById('cameraInterface'),
      webcam: document.getElementById('webcam'),
      arCanvas: document.getElementById('arCanvas'),
      errorPanel: document.getElementById('errorPanel'),
      btnTryAgain: document.getElementById('btnTryAgain'),
      hudFps: document.getElementById('hudFps'),
      hudStatus: document.getElementById('hudStatus'),
      hudGesture: document.getElementById('hudGesture'),
      hudTrackingState: document.getElementById('hudTrackingState')
    };

    // Graphics Pipeline Setup
    this.ctx = this.dom.arCanvas.getContext('2d');
    this.bgCanvas = document.getElementById('bgParticles');
    this.bgCtx = this.bgCanvas.getContext('2d');
    
    // Engine State Vectors
    this.particles = [];
    this.fingertipTrails = {}; 
    this.lastFrameTime = performance.now();
    this.fpsCount = 0;
    
    // Cinematic Canvas FX Transitions
    this.blurIntensity = 0; 
    this.currentGesture = "NONE";
    this.mediaPipeHands = null;

    this.initBackgroundEngine();
    this.bindActionListeners();
  }

  /**
   * BACKGROUND FIELD GENERATOR
   */
  initBackgroundEngine() {
    const resizeBg = () => {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeBg);
    resizeBg();

    this.particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * this.bgCanvas.width,
      y: Math.random() * this.bgCanvas.height,
      radius: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.5 + 0.1
    }));

    const renderBgLoop = () => {
      this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
      this.particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = this.bgCanvas.height;
          p.x = Math.random() * this.bgCanvas.width;
        }
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        this.bgCtx.fill();
      });
      requestAnimationFrame(renderBgLoop);
    };
    requestAnimationFrame(renderBgLoop);
  }

  bindActionListeners() {
    this.dom.btnOpenCamera.addEventListener('click', () => this.bootHardwareSequence());
    this.dom.btnTryAgain.addEventListener('click', () => {
      this.dom.errorPanel.classList.add('hidden');
      this.dom.initialCard.classList.remove('hidden');
      this.dom.initialCard.classList.add('active');
    });
  }

  /**
   * HUD DIAGNOSTIC SEQUENCE EXECUTION
   */
  async bootHardwareSequence() {
    this.dom.initialCard.classList.add('hidden');
    this.dom.initialCard.classList.remove('active');
    this.dom.loadingHud.classList.remove('hidden');

    const executionSteps = [
      { text: "INITIALIZING CAMERA...", duration: 500 },
      { text: "CONNECTING DEVICE...", duration: 500 },
      { text: "LOADING AI MODEL...", duration: 700 },
      { text: "CALIBRATING HAND TRACKER...", duration: 500 },
      { text: "READY", duration: 300 }
    ];

    let totalProgress = 0;
    for (const step of executionSteps) {
      this.dom.loadingText.innerText = step.text;
      totalProgress += (100 / executionSteps.length);
      this.dom.progressBar.style.width = `${totalProgress}%`;
      await this.sleep(step.duration);
    }

    this.dom.loadingHud.classList.add('hidden');
    await this.startHardwareStreaming();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * WEBCAM STREAM ROUTING
   */
  async startHardwareStreaming() {
    try {
      const captureStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      this.dom.webcam.srcObject = captureStream;
      this.dom.cameraInterface.classList.remove('hidden');
      
      this.dom.webcam.onloadedmetadata = () => {
        this.dom.webcam.style.opacity = '1';
        this.syncCanvasDimensions();
        this.initNeuralEnginePipeline();
      };

      window.addEventListener('resize', () => this.syncCanvasDimensions());

    } catch (hardwareError) {
      console.error("Camera pipeline initialization fault:", hardwareError);
      this.dom.loadingHud.classList.add('hidden');
      this.dom.errorPanel.classList.remove('hidden');
    }
  }

  syncCanvasDimensions() {
    this.dom.arCanvas.width = this.dom.webcam.clientWidth;
    this.dom.arCanvas.height = this.dom.webcam.clientHeight;
  }

  /**
   * MEDIAPIPE VISION RUNTIME INFRASTRUCTURE
   */
  initNeuralEnginePipeline() {
    this.mediaPipeHands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.mediaPipeHands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    this.mediaPipeHands.onResults((results) => this.renderGraphicsPipeline(results));

    const streamSource = new Camera(this.dom.webcam, {
      onFrame: async () => {
        await this.mediaPipeHands.send({ image: this.dom.webcam });
      },
      width: 1280,
      height: 720
    });
    
    streamSource.start();
  }

  /**
   * RENDERING PIPELINE & GRAPHICS MATRIX
   */
  renderGraphicsPipeline(results) {
    const width = this.dom.arCanvas.width;
    const height = this.dom.arCanvas.height;

    this.calculateRuntimeFps();
    this.ctx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const points = results.multiHandLandmarks[0];
      
      this.dom.hudTrackingState.innerText = "TRACKING DETECTED";
      this.dom.hudTrackingState.className = "hud-text small font-mono text-green";

      this.currentGesture = this.parseGeometricGesture(points);
      this.updateHudMetrics();
      this.drawNeuralSkeleton(points, width, height);
      this.renderFingertipFX(points, width, height);
    } else {
      this.currentGesture = "NONE";
      this.updateHudMetrics();
      this.dom.hudTrackingState.innerText = "TRACKING IDLE";
      this.dom.hudTrackingState.className = "hud-text small font-mono text-muted";
    }

    this.computeCinematicEffectsTransitions(width, height);
  }

  /**
   * ALGORITMA DETEKSI JARI (GESTURE)
   */
  parseGeometricGesture(lm) {
    const checkExtended = (tipIdx, pipIdx) => lm[tipIdx].y < lm[pipIdx].y;
    
    const indexExtended = checkExtended(8, 6);
    const middleExtended = checkExtended(12, 10);
    const ringExtended = checkExtended(16, 14);
    const pinkyExtended = checkExtended(20, 18);
    const thumbExtended = Math.abs(lm[4].x - lm[2].x) > 0.04;

    // 1. GESTURE PEACE (✌)
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return "PEACE SIGN";
    }
    // 2. GESTURE KEPALAN (👊)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return "CLOSED FIST";
    }
    // 3. GESTURE TELAPAK TANGAN (✋)
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return "OPEN HAND";
    }
    // 4. GESTURE TELUNJUK (☝)
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return "INDEX EXTENDED";
    }
    // 5. GESTURE JEMPOL (👍)
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      if (lm[4].y < lm[9].y) return "THUMBS UP";
    }

    return "NONE";
  }

  updateHudMetrics() {
    if (this.currentGesture === "PEACE SIGN") {
      this.dom.hudGesture.innerText = "PEACE DETECTED";
      this.dom.hudGesture.className = "hud-value font-mono text-green";
      this.dom.hudStatus.innerText = "CAMERA BLURRED";
      this.dom.hudStatus.className = "hud-value font-mono text-muted";
    } else {
      this.dom.hudGesture.innerText = this.currentGesture;
      this.dom.hudGesture.className = "hud-value font-mono";
      this.dom.hudStatus.innerText = "ACTIVE";
      this.dom.hudStatus.className = "hud-value font-mono text-green";
    }
  }

  drawNeuralSkeleton(landmarks, width, height) {
    const connections = [
      [0,1], [1,2], [2,3], [3,4],       
      [0,5], [5,6], [6,7], [7,8],       
      [5,9], [9,10], [10,11], [11,12],  
      [9,13], [13,14], [14,15], [15,16], 
      [13,17], [17,18], [18,19], [19,20], 
      [0,17] 
    ];

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const ptA = landmarks[start];
      const ptB = landmarks[end];
      this.ctx.beginPath();
      this.ctx.moveTo(ptA.x * width, ptA.y * height);
      this.ctx.lineTo(ptB.x * width, ptB.y * height);
      this.ctx.stroke();
    });

    landmarks.forEach((pt) => {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(pt.x * width, pt.y * height, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  renderFingertipFX(landmarks, width, height) {
    const tipIndices = [4, 8, 12, 16, 20];

    tipIndices.forEach((idx) => {
      const pt = landmarks[idx];
      const cx = pt.x * width;
      const cy = pt.y * height;

      if (!this.fingertipTrails[idx]) this.fingertipTrails[idx] = [];
      this.fingertipTrails[idx].push({ x: cx, y: cy });

      if (this.fingertipTrails[idx].length > 12) this.fingertipTrails[idx].shift();

      this.ctx.save();
      const activeTrail = this.fingertipTrails[idx];
      if (activeTrail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(activeTrail[0].x, activeTrail[0].y);
        for (let i = 1; i < activeTrail.length; i++) {
          this.ctx.lineTo(activeTrail[i].x, activeTrail[i].y);
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
      }

      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  computeCinematicEffectsTransitions(width, height) {
    const transitionStep = 0.08;
    if (this.currentGesture === "PEACE SIGN") {
      this.blurIntensity = Math.min(1, this.blurIntensity + transitionStep);
    } else {
      this.blurIntensity = Math.max(0, this.blurIntensity - transitionStep);
    }

    if (this.blurIntensity > 0) {
      const targetBlur = this.blurIntensity * 12; 
      const targetBrightness = 100 - (this.blurIntensity * 20); 
      const targetContrast = 100 + (this.blurIntensity * 25); 

      this.dom.webcam.style.filter = `blur(${targetBlur}px) brightness(${targetBrightness}%) contrast(${targetContrast}%)`;

      this.ctx.save();
      const vignetteGradient = this.ctx.createRadialGradient(
        width / 2, height / 2, width * 0.3,
        width / 2, height / 2, width * 0.75
      );
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${this.blurIntensity * 0.6})`);
      this.ctx.fillStyle = vignetteGradient;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.restore();
    } else {
      this.dom.webcam.style.filter = 'none';
    }
  }

  calculateRuntimeFps() {
    const timeNow = performance.now();
    this.fpsCount++;
    if (!this.lastFrameTime) this.lastFrameTime = timeNow;
    
    if (timeNow >= this.lastFrameTime + 1000) {
      const trackedFps = Math.round((this.fpsCount * 1000) / (timeNow - this.lastFrameTime));
      this.dom.hudFps.innerText = `FPS: ${String(trackedFps).padStart(2, '0')}`;
      this.fpsCount = 0;
      this.lastFrameTime = timeNow;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.CyberCameraSystemInstance = new CyberCameraApp();
});
