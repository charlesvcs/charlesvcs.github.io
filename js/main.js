const emailLink = document.getElementById("email-link");

if (emailLink) {
  const encoded = emailLink.getAttribute("data-contact");

  emailLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "mailto:" + atob(encoded);
  });
}

// The index.html identity card is two stacked faces (front/back) wrapped in
// .flip-card so it can be grabbed and turned all the way over, like a credit
// card flipped to its back. about.html/projects.html have no back face, so
// there .card itself (single-sided) is the thing that gets grabbed.
const grabTarget = document.querySelector(".flip-card") || document.querySelector(".card");

if (grabTarget && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  initGrabbableCard(grabTarget);
}

function initGrabbableCard(card) {
  const DRAG_THRESHOLD = 6; // px before a pointerdown counts as a drag, not a click
  const TILT_SENSITIVITY = 0.22; // deg of depth-tilt per px of drag — unclamped, so
  // dragging far enough rotates the card all the way past 90°/180° to its back face.
  const DRIFT_SENSITIVITY = 0.12; // the card only drifts a fraction of the drag distance —
  // turning it is meant to read as flipping in place, not flying it across the screen.
  const MAX_DRIFT = 46; // px, hard cap on how far off-center that drift can go.
  const STIFFNESS = 140;
  const DAMPING = 22;
  const REST_EPSILON = 0.05;

  // The card never snaps straight to the pointer. tx/ty/rx/ry are the rendered
  // state; target* is where the pointer (while held) or the origin (once
  // released) wants it to be; one continuous damped spring chases the target
  // the whole time, so holding and flipping the card feels like turning
  // something with actual weight, not dragging a cursor-locked plate.
  let tx = 0, ty = 0, rx = 0, ry = 0;
  let vx = 0, vy = 0, vrx = 0, vry = 0;
  let targetTx = 0, targetTy = 0, targetRx = 0, targetRy = 0;
  let rafId = null;
  let lastT = null;

  let dragging = false;
  let moved = false;
  let swallowNextClick = false;
  let pointerId = null;
  let startPx, startPy, startTx, startTy, startRx, startRy;

  function render() {
    card.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }

  function atRest() {
    return (
      Math.abs(tx - targetTx) < REST_EPSILON && Math.abs(ty - targetTy) < REST_EPSILON &&
      Math.abs(rx - targetRx) < REST_EPSILON && Math.abs(ry - targetRy) < REST_EPSILON &&
      Math.abs(vx) < REST_EPSILON && Math.abs(vy) < REST_EPSILON &&
      Math.abs(vrx) < REST_EPSILON && Math.abs(vry) < REST_EPSILON
    );
  }

  function tick(now) {
    const dt = Math.min((now - (lastT ?? now)) / 1000, 0.032);
    lastT = now;

    vx += (-STIFFNESS * (tx - targetTx) - DAMPING * vx) * dt;
    tx += vx * dt;
    vy += (-STIFFNESS * (ty - targetTy) - DAMPING * vy) * dt;
    ty += vy * dt;
    vrx += (-STIFFNESS * (rx - targetRx) - DAMPING * vrx) * dt;
    rx += vrx * dt;
    vry += (-STIFFNESS * (ry - targetRy) - DAMPING * vry) * dt;
    ry += vry * dt;

    render();

    if (!dragging && atRest()) {
      tx = targetTx; ty = targetTy; rx = targetRx; ry = targetRy;
      vx = vy = vrx = vry = 0;
      render();
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function ensureLoopRunning() {
    if (rafId === null) {
      lastT = null;
      rafId = requestAnimationFrame(tick);
    }
  }

  card.style.touchAction = "none";

  // Links and the mascot image are natively draggable in most browsers; that fights
  // with our own pointer-driven drag, so it's switched off inside the card.
  card.addEventListener("dragstart", (event) => event.preventDefault());

  card.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    // Pointer capture is NOT taken here — only a plain click/tap is happening
    // until proven otherwise. Grabbing capture on every pointerdown (even one
    // that never moves) risks swallowing the ordinary click on a link nested
    // inside the card in some browsers; it's deferred to the moment a real
    // drag is confirmed, below.
    dragging = true;
    moved = false;
    pointerId = event.pointerId;

    startPx = event.clientX;
    startPy = event.clientY;
    startTx = targetTx;
    startTy = targetTy;
    startRx = targetRx;
    startRy = targetRy;
  });

  card.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId) return;

    const px = event.clientX;
    const py = event.clientY;
    const dx = px - startPx;
    const dy = py - startPy;

    if (!moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      moved = true;
      card.setPointerCapture(pointerId);
      card.classList.add("is-grabbed");
    }

    event.preventDefault();

    // Horizontal drag leans the card around the vertical axis (rotateY);
    // vertical drag leans it around the horizontal axis (rotateX) — both read as
    // the card tipping into screen depth, not spinning flat like a clock hand.
    // Unclamped: drag far enough and it turns all the way over to its back.
    targetRy = startRy + dx * TILT_SENSITIVITY;
    targetRx = startRx - dy * TILT_SENSITIVITY;

    // Position only drifts a little and is capped — the card stays near center
    // while it turns, so you catch the back face rather than watching it sail off.
    targetTx = clampValue(startTx + dx * DRIFT_SENSITIVITY, -MAX_DRIFT, MAX_DRIFT);
    targetTy = clampValue(startTy + dy * DRIFT_SENSITIVITY, -MAX_DRIFT, MAX_DRIFT);

    ensureLoopRunning();
  });

  function endDrag(event) {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    card.classList.remove("is-grabbed");

    try {
      card.releasePointerCapture(pointerId);
    } catch (err) {
      // pointer capture may already be gone (e.g. after pointercancel)
    }

    if (moved) {
      swallowNextClick = true;
      event.preventDefault();
    }

    // Always home back to front-and-center, carrying whatever velocity the
    // spring had built up into the return swing.
    targetTx = 0;
    targetTy = 0;
    targetRx = 0;
    targetRy = 0;
    ensureLoopRunning();
  }

  card.addEventListener("pointerup", endDrag);
  card.addEventListener("pointercancel", endDrag);

  // Swallow the ghost click that follows a drag so links aren't navigated by accident.
  card.addEventListener(
    "click",
    (event) => {
      if (swallowNextClick) {
        event.preventDefault();
        event.stopPropagation();
        swallowNextClick = false;
      }
    },
    true
  );
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
