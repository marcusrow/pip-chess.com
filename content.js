(() => {
  if (!("documentPictureInPicture" in window)) {
    console.warn("[pip-chess] Cần Chrome 116+ để dùng Document PiP.");
    return;
  }

  const findBoard = () =>
    document.querySelector("#board-layout-main") ||
    document.querySelector("wc-chess-board, chess-board");

  const btn = document.createElement("button");
  btn.id = "pipchess-btn";
  btn.textContent = "♟ PiP";
  document.documentElement.appendChild(btn);

  let pipWin = null;
  let stream = null;

  const stopAll = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    pipWin = null;
    btn.textContent = "♟ PiP";
  };

  btn.addEventListener("click", async () => {
    if (pipWin) { pipWin.close(); return; }

    const board = findBoard();
    if (!board) { alert("Không tìm thấy bàn cờ."); return; }

    // 1) Xin quyền chiếu tab hiện tại (chọn tab chess.com trong hộp thoại).
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      });
    } catch (e) {
      console.warn("[pip-chess] Không được cấp quyền chia sẻ tab", e);
      return;
    }

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    // 2) Mở cửa sổ PiP chứa canvas.
    const r0 = board.getBoundingClientRect();
    const ratio0 = r0.height / r0.width;
    const W = Math.min(Math.round(r0.width), 560);
    pipWin = await documentPictureInPicture.requestWindow({
      width: W,
      height: Math.round(W * ratio0),
    });
    btn.textContent = "↩ Thoát PiP";

    const doc = pipWin.document;
    const st = doc.createElement("style");
    st.textContent = `html,body{margin:0;height:100%;background:#262421;overflow:hidden}
      canvas{width:100%;height:100%;display:block;cursor:pointer}`;
    doc.head.appendChild(st);
    const canvas = doc.createElement("canvas");
    doc.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    // 3) Vẽ vùng bàn cờ từ video lên canvas mỗi khung hình.
    const draw = () => {
      if (!pipWin) return;
      const r = board.getBoundingClientRect();
      // Video là ảnh chụp viewport; quy đổi px CSS -> px video.
      const sx = video.videoWidth / window.innerWidth;
      const sy = video.videoHeight / window.innerHeight;
      const cw = Math.max(1, Math.round(r.width * sx));
      const ch = Math.max(1, Math.round(r.height * sy));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      ctx.drawImage(video, r.left * sx, r.top * sy, cw, ch, 0, 0, cw, ch);
      pipWin.requestAnimationFrame(draw);
    };
    pipWin.requestAnimationFrame(draw);

    // 4) Chuyển click/kéo thả trên canvas thành sự kiện trên bàn cờ thật.
    const toPage = (e) => {
      const cr = canvas.getBoundingClientRect();
      const br = board.getBoundingClientRect();
      return {
        x: br.left + ((e.clientX - cr.left) / cr.width) * br.width,
        y: br.top + ((e.clientY - cr.top) / cr.height) * br.height,
      };
    };

    let down = false;
    const fire = (type, e, p, target) => {
      const init = {
        bubbles: true, cancelable: true, composed: true, view: window,
        clientX: p.x, clientY: p.y, screenX: e.screenX, screenY: e.screenY,
        button: 0, buttons: type.endsWith("up") || type === "click" ? 0 : 1,
      };
      const isPointer = type.startsWith("pointer");
      const ev = isPointer
        ? new PointerEvent(type, { ...init, pointerId: 1, pointerType: "mouse", isPrimary: true })
        : new MouseEvent(type, init);
      target.dispatchEvent(ev);
    };

    let dragTarget = null;
    canvas.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const p = toPage(e);
      dragTarget = document.elementFromPoint(p.x, p.y) || board;
      down = true;
      canvas.setPointerCapture(e.pointerId);
      fire("pointerdown", e, p, dragTarget);
      fire("mousedown", e, p, dragTarget);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!down) return;
      const p = toPage(e);
      const t = document.elementFromPoint(p.x, p.y) || document;
      fire("pointermove", e, p, t);
      fire("mousemove", e, p, t);
    });
    canvas.addEventListener("pointerup", (e) => {
      if (!down) return;
      down = false;
      const p = toPage(e);
      const t = document.elementFromPoint(p.x, p.y) || board;
      fire("pointerup", e, p, t);
      fire("mouseup", e, p, t);
      fire("click", e, p, t);
    });

    // Dừng khi đóng PiP hoặc khi người dùng bấm "Stop sharing" của Chrome.
    pipWin.addEventListener("pagehide", stopAll);
    stream.getVideoTracks()[0].addEventListener("ended", () => pipWin && pipWin.close());
  });
})();
