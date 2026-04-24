import { useState, useRef, useEffect } from "react";

const MOCK_RESPONSES = [
  (profile) => {
    if (profile.interests?.length > 0) {
      const interest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
      const suggestions = {
        Beach: "Based on your love for beaches, I'd suggest **Goa** in November–February or **Varkala** for a quieter vibe. Want me to build a 5-day itinerary?",
        Mountains: "For mountains, **Manali** in summer or **Spiti Valley** for the adventurous. Shall I plan a road trip route from your home city?",
        Culture: "**Varanasi**, **Hampi**, or **Jaipur** would be perfect for cultural immersion. Want a heritage trail itinerary?",
        Adventure: "**Rishikesh** for rafting & bungee, or **Ladakh** for a bike trip. Want me to suggest the best season to go?",
        Food: "**Mumbai street food trail**, **Kolkata** for sweets, or **Chennai** for authentic South Indian. Want a food-focused 3-day plan?",
        Wellness: "**Kerala Ayurveda retreats** or **Rishikesh yoga ashrams** are top picks. Want me to find options within your budget?",
      };
      return suggestions[interest] || "Tell me more about what kind of trip you're looking for!";
    }
    return "I'd love to help plan your trip! Could you tell me your preferred destination or travel style?";
  },
  () => "Great choice! I can help you with flights, stays, and a day-by-day itinerary. What's your travel duration?",
  () => "Based on current trends, the best time to visit would be October to March. Want me to check availability?",
  () => "I can suggest budget-friendly options or premium experiences depending on your preference. Which would you like?",
  () => "Here are some hidden gems most tourists miss... Want me to add them to your itinerary?",
];

const SUGGESTIONS = [
  "Plan a 5-day trip for me",
  "Best destinations this season",
  "Budget trip ideas",
  "Hidden gems in India",
];

let mockIndex = 0;

function getMockResponse(profile) {
  const fn = MOCK_RESPONSES[mockIndex % MOCK_RESPONSES.length];
  mockIndex++;
  return fn(profile);
}

export default function ChatBot({ profile }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hey${profile.name ? ` ${profile.name.split(" ")[0]}` : ""}! 👋 I'm your Travel AI assistant. Ask me anything about trip planning, destinations, or itineraries!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText) return;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text: getMockResponse(profile) }]);
    }, 1200 + Math.random() * 800);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300 shadow-lg transition hover:bg-cyan-200 hover:scale-105"
        aria-label="Open Travel AI chat"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open ? (
        <div className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-xl sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl border-b border-white/10 bg-slate-900/80 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/20">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Travel AI</p>
              <p className="text-[10px] text-emerald-400">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-300 text-slate-900"
                      : "bg-slate-800/80 text-slate-200"
                  }`}
                >
                  {msg.text.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {typing ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-slate-800/80 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-white/15 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 rounded-xl border border-white/15 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300 transition hover:bg-cyan-200 disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
