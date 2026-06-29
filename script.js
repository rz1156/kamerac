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
    this.fingertipTrails = {}; // Structure: { fingerIndex: [{x, y, alpha}] }
    this.lastFrameTime = performance.now();
    this.fpsCount = 0;
    this.fpsDisplayTimer = 0;
    
    // Cinematic Canvas FX Transitions
    this.blurIntensity = 0; // Standardized range [0 to 1]
    this.currentGesture = "NONE";
    this.mediaPipeHands = null;

    this.initBackgroundEngine();
    this.bindActionListeners();
  }

  /**
   * BACKGROUND FIELD GENERATOR
   * Renders lightweight deep ambient spatial vectors behind interface layer
   */
  initBackgroundEngine() {
    const resizeBg = () => {
      this.bgCanvas.width = window.innerWidth;
      this.bgCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeBg);
    resizeBg();

    // Population array
    this.particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * this.bgCanvas.width,
      y: Math.random() * this.bgCanvas.height,
      radius: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.5 + 0.1
    }));

    const renderBgLoop = () => {
      this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
      this.bgCtx.fillStyle = 'rgba(255, 255, 255, ';

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
      this.transitionUIPanel(this.dom.errorPanel, this.dom.initialCard);
    });
  }

  /**
   * UI TRANSITION INTERPOLATOR
   */
  transitionUIPanel(fromPanel, toPanel) {
    fromPanel.classList.add('hidden');
    fromPanel.classList.remove('active');
    toPanel.classList.remove('hidden');
    setTimeout(() => toPanel.classList.add('active'), 50);
  }

  /**
   * HUD DIAGNOSTIC SEQUENCE EXECUTION
   */
  async bootHardwareSequence() {
    this.dom.initialCard.classList.add('hidden');
    this.dom.loadingHud.classList.remove('hidden');

    const executionSteps = [
      { text: "INITIALIZING CAMERA...", duration: 600 },
      { text: "CONNECTING DEVICE...", duration: 700 },
      { text: "LOADING AI MODEL...", duration: 900 },
      { text: "CALIBRATING HAND TRACKER...", duration: 600 },
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
   * WEBCAM STREAM ROUTING & NEURAL MODELS INSTANTIATION
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
    // Dynamic matching of actual layout boundaries for overlay projection mapping
    this.dom.arCanvas.width = this.dom.webcam.clientWidth;
    this.dom.arCanvas.height = this.dom.webcam.clientHeight;
  }

  /**
   * MEDIAPIPE VISION RUNTIME TOPOLOGY INFRASTRUCTURE
   */
  initNeuralEnginePipeline() {
    this.mediaPipeHands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.mediaPipeHands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    this.mediaPipeHands.onResults((results) => this.renderGraphicsPipeline(results));

    // High performance integration via MediaPipe Camera Helper library module
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
   * HIGH-PERFORMANCE RENDERING PIPELINE & POST PROCESSING FX MATRIX
   */
  renderGraphicsPipeline(results) {
    const width = this.dom.arCanvas.width;
    const height = this.dom.arCanvas.height;

    // Track frame rate execution speed
    this.calculateRuntimeFps();

    this.ctx.clearRect(0, 0, width, height);

    // Gestures processing tracking vector switch
    let handDetectedThisFrame = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      handDetectedThisFrame = true;
      const points = results.multiHandLandmarks[0];
      
      this.dom.dom.hudTrackingState.innerText = "TRACKING DETECTED";
      this.dom.dom.hudTrackingState.classList.remove('text-muted');
      this.dom.dom.hudTrackingState.classList.add('text-green');

      // Process raw positions and output current structural state matching algorithms
      this.currentGesture = this.parseGeometricGesture(points);
      
      // Update UI matching structural parameters
      this.updateHudMetrics();

      // Core Geometric Canvas drawing pipeline commands
      this.drawNeuralSkeleton(points, width, height);
      this.renderFingertipFX(points, width, height);
    } else {
      this.currentGesture = "NONE";
      this.updateHudMetrics();
      this.dom.dom.hudTrackingState.innerText = "TRACKING IDLE";
      this.dom.dom.hudTrackingState.classList.remove('text-green');
      this.dom.dom.hudTrackingState.classList.add('text-muted');
    }

    // Dynamic blur execution parameters tracking state 
    this.computeCinematicEffectsTransitions(width, height);
  }

  /**
   * COMPUTATIONAL GEOMETRIC GESTURE INTERPOLATION MATRIX
   * Processes hand orientation positions algorithmically
   */
  parseGeometricGesture(lm) {
    // Boolean checks representing finger extended orientation states
    const checkExtended = (tipIdx, pipIdx) => lm[tipIdx].y < lm[pipIdx].y;
    
    const indexExtended = checkExtended(8, 6);
    const middleExtended = checkExtended(12, 10);
    const ringExtended = checkExtended(16, 14);
    const pinkyExtended = checkExtended(20, 18);
    // Thumb rule uses spatial horizontal distance checks across coordinate space mappings
    const thumbExtended = Math.abs(lm[4].x - lm[2].x) > 0.04;

    // 1. PEACE SIGN (✌) -> Index and Middle extended. Ring and Pinky completely closed
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return "PEACE SIGN";
    }
    // 2. OPEN HAND (✋) -> All fingers extended straight out
    if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      return "OPEN HAND";
    }
    // 3. CLOSED FIST (👊) -> All fingers folded inwards tight
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      return "CLOSED FIST";
    }
    // 4. INDEX POINTING (☝) -> Only index finger extended straight up
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return "INDEX EXTENDED";
    }
    // 5. THUMBS UP (👍) -> Thumb extended out/up, all other fingers closed tight
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      // Confirm thumb is elevated structural position relative to knuckles mapping orientation
      if (lm[4].y < lm[9].y) return "THUMBS UP";
    }

    return "NONE";
  }

  /**
   * HUD METRICS DATA BUS BINDING
   */
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

  /**
   * CORE NEURAL GEOMETRY GRAPHICS PRIMITIVES SKELETON DRAWING
   */
  drawNeuralSkeleton(landmarks, width, height) {
    // Array map connecting points sequentially across hand segments
    const connections = [
      [0,1], [1,2], [2,3], [3,4],       // Thumb
      [0,5], [5,6], [6,7], [7,8],       // Index Finger
      [5,9], [9,10], [10,11], [11,12],  // Middle Finger
      [9,13], [13,14], [14,15], [15,16], // Ring Finger
      [13,17], [17,18], [18,19], [19,20], // Pinky
      [0,17] // Palm closing bounding line
    ];

    this.ctx.save();

    // Pass 1: Render structural link connections pathways
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 1.5;
    
    connections.forEach(([start, end]) => {
      const ptA = landmarks[start];
      const ptB = landmarks[end];
      
      this.ctx.beginPath();
      this.ctx.moveTo(ptA.x * width, ptA.y * height);
      this.ctx.lineTo(ptB.x * width, ptB.y * height);
      this.ctx.stroke();
    });

    // Pass 2: Draw individual specialized tracking dots mapping joints
    landmarks.forEach((pt) => {
      const cx = pt.x * width;
      const cy = pt.y * height;

      // Glow backing node composition circle
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  /**
   * HIGH GRAPHICS QUALITY FINGERTIP TRAIL AND GLOW EFFECTS ENGINE
   */
  renderFingertipFX(landmarks, width, height) {
    // MediaPipe Hands endpoint indices tracking array for fingertips
    const tipIndices = [4, 8, 12, 16, 20];

    tipIndices.forEach((idx) => {
      const pt = landmarks[idx];
      const cx = pt.x * width;
      const cy = pt.y * height;

      // Ensure historical arrays exist per active finger mapping
      if (!this.fingertipTrails[idx]) {
        this.fingertipTrails[idx] = [];
      }

      // Record position tracking elements
      this.fingertipTrails[idx].push({ x: cx, y: cy, opacity: 1.0 });

      // Culling tracking list history bounds length threshold
      if (this.fingertipTrails[idx].length > 15) {
        this.fingertipTrails[idx].shift();
      }

      this.ctx.save();

      // Render historical coordinate trail trace paths lines
      const activeTrail = this.fingertipTrails[idx];
      if (activeTrail.length > 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(activeTrail[0].x, activeTrail[0].y);
        
        for (let i = 1; i < activeTrail.length; i++) {
          this.ctx.lineTo(activeTrail[i].x, activeTrail[i].y);
        }
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
      }

      // Draw active premium fingertip overlay glow target circles
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#ffffff';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  /**
   * GAUSSIAN CINEMATIC ADVANCED CANVAS POST PROCESSOR EFFECT PIPELINE
   */
  computeCinematicEffectsTransitions(width, height) {
    const transitionStep = 0.08; // Equivalent to ~300ms transition standard pacing execution

    // Linear interpolation tracking calculations
    if (this.currentGesture === "PEACE SIGN") {
      this.blurIntensity = Math.min(1, this.blurIntensity + transitionStep);
    } else {
      this.blurIntensity = Math.max(0, this.blurIntensity - transitionStep);
    }

    // Apply adjustments using high performance layout modifications
    if (this.blurIntensity > 0) {
      // Map global compositional filtration styles properties to hardware standard elements
      const targetBlur = this.blurIntensity * 12; // Max 12px blur radius scaling standard
      const targetBrightness = 100 - (this.blurIntensity * 25); // Decrease to 75% depth levels
      const targetContrast = 100 + (this.blurIntensity * 30); // Dynamic elevation scaling boost up to 130%

      // Directly update CSS structural properties running underneath video feed mapping tracking
      this.dom.webcam.style.filter = `blur(${targetBlur}px) brightness(${targetBrightness}%) contrast(${targetContrast}%)`;

      // Draw technical cinematic dark vignetting layer curves
      this.ctx.save();
      const vignetteGradient = this.ctx.createRadialGradient(
        width / 2, height / 2, width * 0.3,
        width / 2, height / 2, width * 0.75
      );
      
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${this.blurIntensity * 0.65})`);
      
      this.ctx.fillStyle = vignetteGradient;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.restore();
    } else {
      this.dom.webcam.style.filter = 'none';
    }
  }

  /**
   * PERFORMANCE FPS DIAGNOSTIC DETECTOR RUNTIME MEASUREMENT BUS
   */
  calculateRuntimeFps() {
    const timeNow = performance.now();
    this.fpsCount++;
    
    if (timeNow >= this.lastFrameTime + 1000) {
      const trackedFps = Math.round((this.fpsCount * 1000) / (timeNow - this.lastFrameTime));
      this.dom.hudFps.innerText = `FPS: ${String(trackedFps).padStart(2, '0')}`;
      this.fpsCount = 0;
      this.lastFrameTime = timeNow;
    }
  }
}

// System Hardware Boot Sequence Trigger Execution
document.addEventListener('DOMContentLoaded', () => {
  window.CyberCameraSystemInstance = new CyberCameraApp();
});
