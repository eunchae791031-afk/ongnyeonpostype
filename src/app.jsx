import React, { useEffect, useMemo, useState } from "react";
import sticker from "./assets/sticker.png";
import { supabase } from "./supabase";

const C = {
  bg: "#FFFFFF",
  header: "#FFFFFF",
  headerAlt: "#B3262E",
  headerText: "#FFFFFF",
  card: "#FFFFFF",
  input: "#FAFAFA",
  border: "#E5E5E5",
  ink: "#222222",
  inkSoft: "#666666",
  inkFaint: "#999999",
  tagBg: "#FCEBEC",
  red: "#B3262E",
  green: "#4F7568",
};

const SERIF = "'Noto Serif KR', serif";
const SANS = "'Noto Sans KR', sans-serif";
const MONO = "'IBM Plex Mono', monospace";

const KEYWORDS = [
  "리얼물", "조직물",
  "정략/계약", "청게", "캠게", "인외", "오해", "옹짝황",
  "황짝옹", "수인", "오메가버스", "연예계", "예술계",
  "쌍방삽질", "시대물", "리맨물", "모브있음", "친구>애인",
  "연인", "썰", "SF", "로코", "이별", "사이비", "재회", "쌍방",
];

const TYPES = ["글", "그림"];
const LENGTHS = ["단편", "중편", "장편"];
const ADULTS = ["전연령", "성인"];

const emptyForm = {
  title: "",
  author: "",
  link: "",
  type: "글",
  length: "단편",
  adult: "전연령",
  keywords: [],
  gong_keywords: [],
  su_keywords: [],
};

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function normalize(row) {
  return {
    ...row,
    keywords: arr(row.keywords),
    gong_keywords: arr(row.gong_keywords),
    su_keywords: arr(row.su_keywords),
  };
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: SANS,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        whiteSpace: "nowrap",
        background: active ? C.ink : "transparent",
        color: active ? C.headerText : C.inkSoft,
        border: `1px solid ${active ? C.ink : C.border}`,
      }}
    >
      {children}
    </button>
  );
}

function MultiInput({ label, value, onChange, presets }) {
  const [custom, setCustom] = useState("");

  const toggle = (item) => {
    onChange(
      value.includes(item)
        ? value.filter((v) => v !== item)
        : [...value, item]
    );
  };

  const add = () => {
    const v = custom.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setCustom("");
  };

  return (
    <div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 700,
          color: C.inkSoft,
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {presets.map((p) => (
          <Chip key={p} active={value.includes(p)} onClick={() => toggle(p)}>
            {p}
          </Chip>
        ))}

        {value
          .filter((v) => !presets.includes(v))
          .map((v) => (
            <Chip key={v} active onClick={() => toggle(v)}>
              {v} ×
            </Chip>
          ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="직접 입력 후 Enter"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "8px 10px",
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            background: C.input,
            color: C.ink,
            fontFamily: SANS,
          }}
        />

        <button
          type="button"
          onClick={add}
          style={{
            padding: "0 12px",
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: C.inkSoft,
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
}

function EntryForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial ? { ...emptyForm, ...initial } : { ...emptyForm }
  );

  const set = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const valid =
    form.title.trim() &&
    form.author.trim() &&
    form.link.trim();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              color: C.ink,
            }}
          >
            {initial ? "카드 수정" : "새 카드 등록"}
          </h2>

          <button
            onClick={onClose}
            style={{
              border: 0,
              background: "transparent",
              fontSize: 24,
              color: C.inkSoft,
            }}
          >
            ×
          </button>
        </div>

        {[
          ["title", "제목", "작품 제목"],
          ["author", "작가", "작가명"],
          ["link", "포스타입 링크", "https://postype.com/..."],
        ].map(([key, label, placeholder]) => (
          <div key={key} style={{ marginBottom: 15 }}>
            <label
              style={{
                display: "block",
                fontFamily: MONO,
                fontSize: 12,
                color: C.inkSoft,
                marginBottom: 6,
              }}
            >
              {label} *
            </label>

            <input
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: C.input,
                color: C.ink,
                fontFamily: key === "title" ? SERIF : SANS,
              }}
            />
          </div>
        ))}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
              부문
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {TYPES.map((x) => (
                <Chip
                  key={x}
                  active={form.type === x}
                  onClick={() => set("type", x)}
                >
                  {x}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
              길이
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {LENGTHS.map((x) => (
                <Chip
                  key={x}
                  active={form.length === x}
                  onClick={() => set("length", x)}
                >
                  {x}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>
              연령
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {ADULTS.map((x) => (
                <Chip
                  key={x}
                  active={form.adult === x}
                  onClick={() => set("adult", x)}
                >
                  {x}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <MultiInput
            label="키워드"
            value={form.keywords}
            onChange={(v) => set("keywords", v)}
            presets={KEYWORDS}
          />
        </div>



        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 22,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 15px",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.inkSoft,
            }}
          >
            취소
          </button>

          <button
            disabled={!valid}
            onClick={() => valid && onSave(form)}
            style={{
              padding: "9px 17px",
              borderRadius: 6,
              border: 0,
              background: valid ? C.ink : C.border,
              color: valid ? C.headerText : C.inkFaint,
              fontWeight: 700,
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

function Login({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("이메일 또는 비밀번호가 맞지 않아요.");
      return;
    }

    onLogin(data.user);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 22,
        }}
      >
        <h2 style={{ fontFamily: SERIF, color: C.ink, marginTop: 0 }}>
          관리자 로그인
        </h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
            marginBottom: 8,
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            background: C.input,
          }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: 10,
            borderRadius: 6,
            border: `1px solid ${C.border}`,
            background: C.input,
          }}
        />

        {error && (
          <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 15,
          }}
        >
          <button onClick={onClose}>취소</button>
          <button
            onClick={submit}
            style={{
              background: C.ink,
              color: C.headerText,
              border: 0,
              borderRadius: 6,
              padding: "8px 14px",
            }}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ entry, onClose }) {
  if (!entry) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 430,
          background: C.card,
          border: `2px solid ${C.ink}`,
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: C.inkFaint,
            marginBottom: 8,
          }}
        >
          {entry.type} · {entry.length}
        </div>

        <h2 style={{ fontFamily: SERIF, color: C.ink, margin: "0 0 5px" }}>
          {entry.title}
        </h2>

        <div style={{ color: C.inkSoft, marginBottom: 18 }}>
          {entry.author}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
          <span style={{ padding: "4px 8px", background: C.tagBg, borderRadius: 20, fontSize: 11 }}>
            {entry.adult}
          </span>

          {entry.keywords.map((k) => (
            <span key={k} style={{ padding: "4px 8px", border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 11 }}>
              #{k}
            </span>
          ))}

          {entry.gong_keywords.map((k) => (
            <span key={`g-${k}`} style={{ padding: "4px 8px", border: `1px solid ${C.green}`, borderRadius: 20, fontSize: 11, color: C.green }}>
              공·{k}
            </span>
          ))}

          {entry.su_keywords.map((k) => (
            <span key={`s-${k}`} style={{ padding: "4px 8px", border: `1px solid ${C.red}`, borderRadius: 20, fontSize: 11, color: C.red }}>
              수·{k}
            </span>
          ))}
        </div>

        <a
          href={entry.link}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: 11,
            borderRadius: 6,
            background: C.ink,
            color: C.headerText,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          포스타입에서 열기 ↗
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("전체");
  const [adult, setAdult] = useState("전체");
  const [length, setLength] = useState("전체");
  const [keyword, setKeyword] = useState("전체");

  const [showFilters, setShowFilters] = useState(false);
  const [login, setLogin] = useState(false);
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [random, setRandom] = useState(null);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("eutries")
      .select("*")
      .order("title", { ascending: true });

    if (!error) {
      setEntries((data || []).map(normalize));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadEntries();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (type !== "전체" && entry.type !== type) return false;
      if (adult !== "전체" && entry.adult !== adult) return false;
      if (length !== "전체" && entry.length !== length) return false;
      if (keyword !== "전체" && !entry.keywords.includes(keyword)) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();

        const text = [
          entry.title,
          entry.author,
          ...entry.keywords,
          ...entry.gong_keywords,
          ...entry.su_keywords,
        ]
          .join(" ")
          .toLowerCase();

        if (!text.includes(q)) return false;
      }

      return true;
    });
}, [entries, search, type, adult, length, keyword]);

  const saveEntry = async (formData) => {
    const payload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      link: formData.link.trim(),
      type: formData.type,
      length: formData.length,
      adult: formData.adult,
      keywords: formData.keywords,
      gong_keywords: formData.gong_keywords,
      su_keywords: formData.su_keywords,
    };

    let error;

    if (form?.id) {
      const result = await supabase
        .from("eutries")
        .update(payload)
        .eq("id", form.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("eutries")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      alert("저장하지 못했어요: " + error.message);
      return;
    }

    setForm(null);
    await loadEntries();
  };

  const deleteEntry = async (id) => {
    if (!confirm("이 작품을 삭제할까요?")) return;

    const { error } = await supabase
      .from("eutries")
      .delete()
      .eq("id", id);

    if (error) {
      alert("삭제하지 못했어요: " + error.message);
      return;
    }

    await loadEntries();
  };

  const pickRandom = () => {
    if (!entries.length) return;

    const item =
      entries[Math.floor(Math.random() * entries.length)];

    setRandom(item);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: SANS,
        paddingBottom: 80,
      }}
    >
      <header
        style={{
          background: C.header,
          color: C.headerText,
          padding: "28px 20px 22px",
          position: "sticky",
          top: 0,
          zIndex: 30,
          boxShadow: "0 3px 10px rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.2em",
            color: C.inkFaint,
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          

          {user ? (
            <button
              onClick={logout}
              style={{
                border: 0,
                background: "transparent",
                color: C.green,
              }}
            >
              관리자 · 로그아웃
            </button>
          ) : (
            <button
              onClick={() => setLogin(true)}
              style={{
                border: 0,
                background: "transparent",
                color: C.inkFaint,
              }}
            >
              관리자 로그인
            </button>
          )}
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 25,
            margin: "0 0 13px",
          }}
        >
          옹년 포타 검색기
        </h1>

        <div
  style={{
    position: "relative",
    display: "flex",
    gap: 7,
    paddingTop: 30,
  }}
>
  <img
    src={sticker}
    alt=""
    style={{
      position: "absolute",
      right: 0,
      top: -12,
      width: 125,
      height: 125,
      objectFit: "contain",
      pointerEvents: "none",
    }}
  />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목·작가·키워드로 검색"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "10px 12px",
              borderRadius: 6,
              border: 0,
              background: C.headerAlt,
              color: C.headerText,
            }}
          />

          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              padding: "0 12px",
              border: 0,
              borderRadius: 6,
              background: C.headerAlt,
              color: C.headerText,
            }}
          >
            필터
          </button>

          <button
            onClick={pickRandom}
            disabled={!entries.length}
            style={{
              padding: "0 12px",
              border: 0,
              borderRadius: 6,
              background: entries.length ? C.red : C.headerAlt,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            🦭🦊
          </button>
        </div>
      </header>

      {showFilters && (
        <div
          style={{
            padding: 16,
            background: C.card,
            borderBottom: `1px solid ${C.border}`,
            position: "sticky",
            top: 119,
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {["전체", ...TYPES].map((x) => (
              <Chip key={x} active={type === x} onClick={() => setType(x)}>
                {x}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {["전체", ...ADULTS].map((x) => (
              <Chip key={x} active={adult === x} onClick={() => setAdult(x)}>
                {x}
              </Chip>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["전체", ...LENGTHS].map((x) => (
              <Chip key={x} active={length === x} onClick={() => setLength(x)}>
                {x}
              </Chip>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
  {["전체", ...KEYWORDS].map((x) => (
    <Chip key={x} active={keyword === x} onClick={() => setKeyword(x)}>
      {x}
    </Chip>
  ))}
</div>
        </div>
      )}

      <main style={{ padding: "20px" }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: C.inkFaint,
            marginBottom: 14,
          }}
        >
          {loading ? "서가를 불러오는 중..." : `${filtered.length} / ${entries.length}건`}
        </div>

        {!loading && entries.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "70px 15px",
              color: C.inkSoft,
            }}
          >
            <h2 style={{ fontFamily: SERIF, color: C.ink }}>
              서가가 비어 있어요
            </h2>

            {user ? (
              <>
                <p>읽은 포스타입 작품을 카드로 등록해보세요.</p>

                <button
                  onClick={() => setForm({ ...emptyForm })}
                  style={{
                    background: C.ink,
                    color: C.headerText,
                    border: 0,
                    borderRadius: 6,
                    padding: "10px 18px",
                  }}
                >
                  첫 카드 등록하기
                </button>
              </>
            ) : (
              <p>관리자가 작품을 등록하면 여기에 나타나요.</p>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 15,
            }}
          >
            {filtered.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  padding: 17,
                  boxShadow: "0 2px 5px rgba(0,0,0,.06)",
                }}
              >
                <button
                  onClick={() => setDetail(entry)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    background: "transparent",
                    padding: 0,
                    fontFamily: SERIF,
                    fontSize: 18,
                    fontWeight: 900,
                    color: C.ink,
                  }}
                >
                  {entry.title}
                </button>

                <div
                  style={{
                    marginTop: 6,
                    color: C.inkSoft,
                    fontSize: 13,
                  }}
                >
                  {entry.author}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 5,
                    marginTop: 12,
                  }}
                >
                  <span
                    style={{
                      background: C.tagBg,
                      padding: "4px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                    }}
                  >
                    {entry.type} · {entry.length}
                  </span>

                  <span
                    style={{
                      border: `1px solid ${
                        entry.adult === "성인" ? C.red : C.green
                      }`,
                      color: entry.adult === "성인" ? C.red : C.green,
                      padding: "4px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                    }}
                  >
                    {entry.adult}
                  </span>

                  {entry.keywords.map((k) => (
                    <span
                      key={k}
                      style={{
                        background: C.tagBg,
                        padding: "4px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                      }}
                    >
                      #{k}
                    </span>
                  ))}

                  {entry.gong_keywords.map((k) => (
                    <span
                      key={`g-${k}`}
                      style={{
                        border: `1px solid ${C.green}`,
                        color: C.green,
                        padding: "4px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                      }}
                    >
                      공·{k}
                    </span>
                  ))}

                  {entry.su_keywords.map((k) => (
                    <span
                      key={`s-${k}`}
                      style={{
                        border: `1px solid ${C.red}`,
                        color: C.red,
                        padding: "4px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                      }}
                    >
                      수·{k}
                    </span>
                  ))}
                </div>

                {user && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 10,
                      borderTop: `1px dashed ${C.border}`,
                      marginTop: 12,
                      paddingTop: 10,
                    }}
                  >
                    <button
                      onClick={() => setForm(entry)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: C.inkSoft,
                        fontSize: 12,
                      }}
                    >
                      수정
                    </button>

                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        border: 0,
                        background: "transparent",
                        color: C.red,
                        fontSize: 12,
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {user && (
        <button
          onClick={() => setForm({ ...emptyForm })}
          style={{
            position: "fixed",
            right: 20,
            bottom: 22,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: 0,
            background: C.red,
            color: "#fff",
            fontSize: 27,
            boxShadow: "0 4px 12px rgba(0,0,0,.25)",
            zIndex: 40,
          }}
        >
          +
        </button>
      )}

      {form && (
        <EntryForm
          initial={form.id ? form : null}
          onClose={() => setForm(null)}
          onSave={saveEntry}
        />
      )}

      {login && (
        <Login
          onClose={() => setLogin(false)}
          onLogin={(u) => {
            setUser(u);
            setLogin(false);
          }}
        />
      )}

      <Detail entry={detail} onClose={() => setDetail(null)} />

      {random && (
        <div
          onClick={() => setRandom(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            background: "rgba(0,0,0,.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 430,
              background: C.card,
              border: `2px solid ${C.red}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div
              style={{
                color: C.red,
                fontFamily: MONO,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              ✦ 오늘의 포타 ✦
            </div>

            <h2 style={{ fontFamily: SERIF, color: C.ink }}>
              {random.title}
            </h2>

            <p style={{ color: C.inkSoft }}>
              {random.author}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={pickRandom}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: "transparent",
                }}
              >
                🎲 다시 뽑기
              </button>

              <a
                href={random.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: 10,
                  borderRadius: 6,
                  background: C.ink,
                  color: C.headerText,
                  textDecoration: "none",
                }}
              >
                포스타입 열기 ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
