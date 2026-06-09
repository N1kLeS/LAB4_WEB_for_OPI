function App() {
  useSessionBootstrap();
  useViewportMode();
  const user = useSelector(s => s.auth.user);
  const form = useSelector(s => s.form);
  return (
      <div className="page">
        {user && <FormPreview form={form}/>}
        <div className="topbar">
          <div className="brand">WEB LAB 4</div>
          <div className="badge">Лежнев Н.С. · P3212 · Вариант 477934</div>
        </div>
        {user ? <MainPage/> : <StartPage/>}
      </div>
  );
}

function FormPreview({form}) {
  if (!form || (form.x === null && !form.y && form.r === 2)) return null;
  
  const parts = [];
  if (form.x !== null) parts.push(`X: ${form.x}`);
  if (form.y) parts.push(`Y: ${form.y}`);
  if (form.r !== 2) parts.push(`R: ${form.r}`);
  
  if (parts.length === 0) return null;
  
  return (
      <div className="form-preview">
        <div className="form-preview-content">
          {parts.map((p, i) => (
              <span key={i} className="form-preview-item">{p}</span>
          ))}
        </div>
      </div>
  );
}

function FloatingInput({value, onChange, placeholder, type = "text", autoComplete, maxLength, dataTestId}) {
  const [focused, setFocused] = useState(false);
  const strValue = value != null ? String(value) : "";
  const hasValue = strValue.trim().length > 0;
  const isFloating = focused || hasValue;

  return (
      <div className="floating-input-wrapper">
        <input 
          className="input floating-input" 
          value={value || ""}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type={type}
          autoComplete={autoComplete}
          maxLength={maxLength}
          data-testid={dataTestId}
        />
        <label className={`floating-label ${isFloating ? "floating" : ""}`}>
          {placeholder}
        </label>
      </div>
  );
}

function StartPage() {
  const dispatch = useDispatch();
  const auth = useSelector(s => s.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(actions.authStart());
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({username, password})
      });
      if (!res.ok) {
        const msg = await res.text();
        dispatch(actions.authError(msg || "Неверный логин или пароль"));
        return;
      }
      const data = await res.json();
      dispatch(actions.authSuccess(data.username));
      loadResults(dispatch);
    } catch (err) {
      dispatch(actions.authError("Ошибка сети"));
    }
  };

  return (
      <div className="card">
        <div className="login-header">
          <h2 className="section-title">{mode === "login" ? "Вход в приложение" : "Регистрация"}</h2>
          <p className="muted">Авторизация обязательна для доступа к расчётам</p>
        </div>
        <form className="fields" onSubmit={handleSubmit}>
          <div className="field">
            <FloatingInput 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              autoComplete="username"
              type="text"
              dataTestId="username-input"
            />
          </div>
          <div className="field">
            <FloatingInput 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
              type="password"
              dataTestId="password-input"
            />
          </div>
          {auth.error && <div className="error">{auth.error}</div>}
          <button className="btn" type="submit" disabled={auth.loading}
                  data-testid={mode === "login" ? "login-button" : "register-button"}
                  onClick={(e) => {
                    if (!auth.loading) createRipple(e);
                  }}>
            {auth.loading ? "..." : (mode === "login" ? "Войти" : "Зарегистрироваться")}
          </button>
          <div className="hint">
            {mode === "login" ? (
                React.createElement(React.Fragment, null,
                    "Нет аккаунта? ",
                    React.createElement("a", {
                      href: "#",
                      "data-testid": "switch-to-register",
                      onClick: e => { e.preventDefault(); setMode("register"); }
                    }, "Зарегистрироваться")
                )
            ) : (
                React.createElement(React.Fragment, null,
                    "Есть аккаунт? ",
                    React.createElement("a", {
                      href: "#",
                      "data-testid": "switch-to-login",
                      onClick: e => { e.preventDefault(); setMode("login"); }
                    }, "Войти")
                )
            )}
          </div>
        </form>
      </div>
  );
}

function MainPage() {
  const dispatch = useDispatch();
  const mode = useSelector(s => s.ui.mode);
  const results = useSelector(s => s.results.items);
  const user = useSelector(s => s.auth.user);
  const form = useSelector(s => s.form);

  const logout = async () => {
    await apiFetch("/api/auth/logout", {method: "POST"});
    dispatch(actions.logout());
  };

  useEffect(() => {
    if (results.length === 0) {
      loadResults(dispatch);
    }
  }, [dispatch]);

  const onSubmit = async () => {
    if (!isFormValid(form)) return;
    const payload = {x: Number(form.x), y: Number(form.y), r: Number(form.r)};
    const res = await apiFetch("/api/results", {method: "POST", body: JSON.stringify(payload)});
    if (res.ok) {
      const data = await res.json();
      dispatch(actions.resultAdd(normalizeResult(data)));
    }
  };

  const onCanvasClick = async (coords) => {
    dispatch(actions.formSet({x: coords.x, y: coords.y}));
    const payload = {x: coords.x, y: coords.y, r: Number(form.r)};
    const res = await apiFetch("/api/results", {method: "POST", body: JSON.stringify(payload)});
    if (res.ok) {
      const data = await res.json();
      dispatch(actions.resultAdd(normalizeResult(data)));
    }
  };

  return (
      <div className="main-layout">
        <div className="card stack">
          <div>
            <div className="section-title">Параметры точки</div>
            <div className="mode">Режим: {mode}</div>
          </div>
          <Controls form={form}/>
          <button className="btn" data-testid="check-button" onClick={(e) => {
            createRipple(e);
            onSubmit();
          }} disabled={!isFormValid(form)}>Проверить</button>
          <div className="logout">
            <div className="status"><span className="dot"/> {user}</div>
            <button className="btn btn-ghost" data-testid="logout-button" onClick={(e) => {
              createRipple(e);
              logout();
            }}>Выйти</button>
          </div>
        </div>
        <div className="card graph-card">
          <div className="section-title">Область попадания</div>
          <CanvasPanel r={form.r} results={results} onClickCanvas={onCanvasClick}/>
        </div>
        <div className="card history-card">
          <div className="section-title">История проверок</div>
          <ResultsTable results={results}/>
        </div>
      </div>
  );
}

function Controls({form}) {
  const dispatch = useDispatch();
  const xValues = [-3,-2,-1,0,1,2,3,4,5];
  const rValues = [1,2,3,4,5];

  return (
      <div className="fields">
        <div className="field">
          <div className="pill-group">
            {xValues.map(v => (
                <button key={v}
                        type="button"
                        data-testid={`x-button-${v}`}
                        className={["btn-pill", form.x === v ? "active" : ""].join(" ")}
                        onClick={(e) => {
                          createRipple(e);
                          dispatch(actions.formSet({x: v}));
                        }}>
                  {v}
                </button>
            ))}
          </div>
        </div>
        <div className="field">
          <FloatingInput 
            value={form.y} 
            maxLength={5}
            onChange={e => dispatch(actions.formSet({y: e.target.value}))}
            placeholder="y"
            type="text"
            dataTestId="y-input"
          />
          {!isYValid(form.y) && <div className="error">Введите число от -3 до 3</div>}
        </div>
        <div className="field">
          <div className="pill-group">
            {rValues.map(v => (
                <button key={v}
                        type="button"
                        data-testid={`r-button-${v}`}
                        className={["btn-pill", form.r === v ? "active" : ""].join(" ")}
                        onClick={(e) => {
                          createRipple(e);
                          dispatch(actions.formSet({r: v}));
                        }}>
                  {v}
                </button>
            ))}
          </div>
        </div>
      </div>
  );
}

function CanvasPanel({r, results, onClickCanvas}) {
  const canvasRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null);
  const size = 800;
  const padding = 50;
  const graphSize = size - 2 * padding;

  const draw = (showCrosshair = false, crosshairX = null, crosshairY = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const cx = w / 2;
    const cy = h / 2;
    const maxX = 5;
    const maxY = 3;
    const unitX = (graphSize / 2) / maxX;
    const unitY = (graphSize / 2) / maxY;
    const unit = Math.min(unitX, unitY);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.5;
    for (let i = -maxX; i <= maxX; i += 0.5) {
      if (Math.abs(i) < 0.1) continue;
      ctx.beginPath();
      ctx.moveTo(cx + i * unit, cy - maxY * unit);
      ctx.lineTo(cx + i * unit, cy + maxY * unit);
      ctx.stroke();
    }
    for (let i = -maxY; i <= maxY; i += 0.5) {
      if (Math.abs(i) < 0.1) continue;
      ctx.beginPath();
      ctx.moveTo(cx - maxX * unit, cy - i * unit);
      ctx.lineTo(cx + maxX * unit, cy - i * unit);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - maxX * unit, cy);
    ctx.lineTo(cx + maxX * unit, cy);
    ctx.moveTo(cx, cy - maxY * unit);
    ctx.lineTo(cx, cy + maxY * unit);
    ctx.stroke();

    ctx.fillStyle = "rgba(79,157,255,0.55)";
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * unit, -Math.PI / 2, 0, false);
    ctx.lineTo(cx, cy);
    ctx.fill();
    
    ctx.fillRect(cx, cy, (r / 2.0) * unit, r * unit);
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - r * unit, cy);
    ctx.lineTo(cx, cy + (r / 2.0) * unit);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "bold 13px Inter";
    ctx.textAlign = "center";
    ctx.fillText("R", cx + r * unit, cy - 10);
    ctx.fillText("R/2", cx + (r / 2.0) * unit, cy - 10);
    ctx.fillText("-R", cx - r * unit, cy - 10);
    ctx.fillText("-R/2", cx - (r / 2.0) * unit, cy - 10);
    ctx.textAlign = "left";
    ctx.fillText("R", cx + 10, cy - r * unit);
    ctx.fillText("R/2", cx + 10, cy - (r / 2.0) * unit);
    ctx.fillText("-R", cx + 10, cy + r * unit);
    ctx.fillText("-R/2", cx + 10, cy + (r / 2.0) * unit);

    results.filter(res => Math.abs(res.r - r) < 0.01).forEach(res => {
      const px = cx + res.x * unit;
      const py = cy - res.y * unit;
      ctx.fillStyle = res.hit ? "#3bd671" : "#ff6b6b";
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    if (showCrosshair && crosshairX !== null && crosshairY !== null) {
      const px = cx + crosshairX * unit;
      const py = cy - crosshairY * unit;
      
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      const crosshairSize = 20;
      
      ctx.beginPath();
      ctx.moveTo(px - crosshairSize, py);
      ctx.lineTo(px + crosshairSize, py);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(px, py - crosshairSize);
      ctx.lineTo(px, py + crosshairSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "bold 12px Inter";
      ctx.textAlign = "left";
      ctx.fillText(`(${crosshairX.toFixed(2)}, ${crosshairY.toFixed(2)})`, px + 15, py - 15);
    }
  };

  useEffect(() => {
    draw(hoverPos !== null, hoverPos ? hoverPos.x : null, hoverPos ? hoverPos.y : null);
  }, [r, results, hoverPos]);

  const getGraphCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const clickX = (clientX - rect.left) * scaleX;
    const clickY = (clientY - rect.top) * scaleY;
    
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const maxX = 5;
    const maxY = 3;
    const unitX = (graphSize / 2) / maxX;
    const unitY = (graphSize / 2) / maxY;
    const unit = Math.min(unitX, unitY);
    
    const gx = (clickX - cx) / unit;
    const gy = (cy - clickY) / unit;
    
    const clampedX = Math.max(-3, Math.min(5, Number(gx.toFixed(2))));
    const clampedY = Math.max(-3, Math.min(3, Number(gy.toFixed(2))));
    return {x: clampedX, y: clampedY};
  };

  const onMouseMove = (e) => {
    const coords = getGraphCoords(e.clientX, e.clientY);
    setHoverPos(coords);
  };

  const onMouseLeave = () => {
    setHoverPos(null);
  };

  const onClick = (e) => {
    const coords = getGraphCoords(e.clientX, e.clientY);
    onClickCanvas(coords);
  };

  return (
      <div className="canvas-shell">
        <canvas 
          ref={canvasRef} 
          width={size} 
          height={size} 
          onClick={onClick}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          data-testid="area-canvas"
          style={{cursor: "crosshair"}}
        />
      </div>
  );
}

function ResultsTable({results}) {
  if (!results.length) {
    return <div className="muted" data-testid="results-table-empty">Пока нет проверок</div>;
  }
  return (
      <div style={{overflowX: "auto"}} data-testid="results-table-wrapper">
        <table data-testid="results-table">
          <thead>
          <tr>
            <th>X</th><th>Y</th><th>R</th><th>Статус</th><th>Время</th>
          </tr>
          </thead>
          <tbody>
          {results.map(r => (
              <tr key={r.id || `${r.x}-${r.y}-${r.time}`}>
                <td>{formatNum(r.x)}</td>
                <td>{formatNum(r.y)}</td>
                <td>{formatNum(r.r)}</td>
                <td><span className={`pill ${r.hit ? "hit" : "miss"}`}>{r.hit ? "ПОПАДАНИЕ" : "ПРОМАХ"}</span></td>
                <td>{formatTime(r.time)}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}

const isYValid = (y) => {
  if (y === "" || y === null || y === undefined) return false;
  const num = Number(y);
  return !Number.isNaN(num) && num >= -3 && num <= 3;
};

const isFormValid = (form) => form.x !== null && isYValid(form.y) && form.r >= 1 && form.r <= 5;

const formatNum = (n) => Number(n).toFixed(2);

const formatTime = (t) => {
  if (!t) return "";
  try {
    const d = new Date(t);
    return d.toLocaleString("ru-RU");
  } catch (e) {
    return t;
  }
};

function createRipple(event) {
  const button = event.currentTarget;
  if (!button || button.disabled) return;
  
  const rect = button.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const existingRipple = button.querySelector(".ripple");
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(circle);
  
  setTimeout(() => {
    if (circle.parentNode) {
      circle.remove();
    }
  }, 600);
}
