import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  from: 'me' | 'them'
  text: string
  time: string
}

interface Contact {
  id: number
  name: string
  initials: string
  goal: string
  online: boolean
  lastMessage: string
  lastTime: string
  unread: number
  messages: Message[]
}

const CONTACTS: Contact[] = [
  {
    id: 1,
    name: 'Rohan Mehta',
    initials: 'RM',
    goal: 'Muscle Gain',
    online: true,
    lastMessage: "Thanks! I'll follow the updated plan",
    lastTime: '2m ago',
    unread: 0,
    messages: [
      { id: 1,  from: 'them', text: "Hi, I wanted to ask about increasing my protein intake this week.", time: '10:05 AM' },
      { id: 2,  from: 'me',   text: "Sure Rohan! Since you've hit your Week 4 milestone, we can push it to 200g/day.", time: '10:07 AM' },
      { id: 3,  from: 'them', text: 'Should I spread it equally across meals?', time: '10:08 AM' },
      { id: 4,  from: 'me',   text: "Yes — try 40g per meal across 5 meals. Post-workout meal is the most important, aim for 50g there.", time: '10:10 AM' },
      { id: 5,  from: 'them', text: 'Got it! Also, can I have a cheat meal on Sunday?', time: '10:12 AM' },
      { id: 6,  from: 'me',   text: "Yes, one cheat meal is fine. Keep it within 800 kcal extra and avoid alcohol. Stay hydrated!", time: '10:14 AM' },
      { id: 7,  from: 'them', text: 'My weight was 75.2 kg this morning — up from 74 last week!', time: '10:20 AM' },
      { id: 8,  from: 'me',   text: "Great progress! That's clean muscle gain. Keep it up and log everything in the app.", time: '10:21 AM' },
      { id: 9,  from: 'them', text: "Thanks! I'll follow the updated plan", time: '10:22 AM' },
    ],
  },
  {
    id: 2,
    name: 'Sneha Iyer',
    initials: 'SI',
    goal: 'PCOS Management',
    online: true,
    lastMessage: "I've been feeling much better this week!",
    lastTime: '1h ago',
    unread: 2,
    messages: [
      { id: 1,  from: 'them', text: 'Good morning! I had a question about the spearmint tea recommendation.', time: '9:00 AM' },
      { id: 2,  from: 'me',   text: 'Morning Sneha! Yes — 2 cups a day is ideal. Morning and evening, not right before sleep.', time: '9:05 AM' },
      { id: 3,  from: 'them', text: 'Okay noted. Also my bloating has reduced a lot this week!', time: '9:10 AM' },
      { id: 4,  from: 'me',   text: "That's the low-GI plan working. Your body is stabilising insulin levels. Excellent sign!", time: '9:12 AM' },
      { id: 5,  from: 'them', text: 'Should I continue avoiding dairy?', time: '9:15 AM' },
      { id: 6,  from: 'me',   text: 'You can introduce low-fat curd and buttermilk in moderate amounts. Full cream dairy is still off.', time: '9:17 AM' },
      { id: 7,  from: 'them', text: "I've been feeling much better this week!", time: '9:45 AM' },
      { id: 8,  from: 'them', text: 'My energy levels are way up compared to last month', time: '9:46 AM' },
    ],
  },
  {
    id: 3,
    name: 'Anjali Singh',
    initials: 'AS',
    goal: 'Weight Loss',
    online: false,
    lastMessage: "I'll check my thyroid report and share it.",
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1,  from: 'me',   text: 'Hi Anjali! How did your blood test go?', time: 'Jun 5, 11:00 AM' },
      { id: 2,  from: 'them', text: "The doctor said TSH is slightly high — 5.2. Should I change my diet?", time: 'Jun 5, 11:30 AM' },
      { id: 3,  from: 'me',   text: "At 5.2 we should be more careful. I'll update your plan to reduce goitrogens and increase selenium-rich foods.", time: 'Jun 5, 11:35 AM' },
      { id: 4,  from: 'them', text: 'Okay, what foods should I avoid now?', time: 'Jun 5, 11:38 AM' },
      { id: 5,  from: 'me',   text: 'Avoid raw cabbage, broccoli, cauliflower. Cooked is fine. Add Brazil nuts, eggs, sunflower seeds.', time: 'Jun 5, 11:42 AM' },
      { id: 6,  from: 'them', text: 'Should I also share the full report PDF?', time: 'Jun 5, 11:45 AM' },
      { id: 7,  from: 'me',   text: 'Yes please, share it when you get the digital copy.', time: 'Jun 5, 11:46 AM' },
      { id: 8,  from: 'them', text: "I'll check my thyroid report and share it.", time: 'Jun 5, 11:50 AM' },
    ],
  },
  {
    id: 4,
    name: 'Vikram Singh',
    initials: 'VS',
    goal: 'Weight Loss',
    online: false,
    lastMessage: "Understood, I'll cut out the evening snacks.",
    lastTime: 'Jun 5',
    unread: 1,
    messages: [
      { id: 1,  from: 'them', text: 'Hello, I have been struggling with evening cravings. Any tips?', time: 'Jun 5, 6:00 PM' },
      { id: 2,  from: 'me',   text: "Hi Vikram! Evening cravings are common. Try roasted makhana or a small handful of nuts — these are on your plan.", time: 'Jun 5, 6:05 PM' },
      { id: 3,  from: 'them', text: "I was eating biscuits — didn't realise it was so many calories!", time: 'Jun 5, 6:08 PM' },
      { id: 4,  from: 'me',   text: "Biscuits are calorie-dense and spike blood sugar — especially important to avoid with your pre-diabetic status.", time: 'Jun 5, 6:10 PM' },
      { id: 5,  from: 'them', text: "Understood, I'll cut out the evening snacks.", time: 'Jun 5, 6:12 PM' },
      { id: 6,  from: 'them', text: 'Also my morning blood sugar was 108 today — is that okay?', time: 'Jun 5, 6:13 PM' },
    ],
  },
  {
    id: 5,
    name: 'Priya Sharma',
    initials: 'PS',
    goal: 'Diabetes Management',
    online: false,
    lastMessage: 'Thank you so much for your guidance',
    lastTime: 'Apr 20',
    unread: 0,
    messages: [
      { id: 1,  from: 'them', text: 'Hi, I completed the program last week. I just wanted to say thank you!', time: 'Apr 20, 3:00 PM' },
      { id: 2,  from: 'me',   text: "So happy to hear that Priya! Your dedication was incredible. HbA1c improvement was remarkable.", time: 'Apr 20, 3:05 PM' },
      { id: 3,  from: 'them', text: 'My doctor was very happy with my report too!', time: 'Apr 20, 3:07 PM' },
      { id: 4,  from: 'me',   text: "That's the best news! Please continue the low-GI approach and we'll do a check-in in 2 months.", time: 'Apr 20, 3:10 PM' },
      { id: 5,  from: 'them', text: 'Thank you so much for your guidance', time: 'Apr 20, 3:12 PM' },
    ],
  },
]

export default function DietitianChat() {
  const [contacts, setContacts]   = useState(CONTACTS)
  const [activeId, setActiveId]   = useState<number>(CONTACTS[0].id)
  const [input, setInput]         = useState('')
  const [search, setSearch]       = useState('')
  const bottomRef                 = useRef<HTMLDivElement>(null)

  const active = contacts.find(c => c.id === activeId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, active.messages.length])

  const selectContact = (id: number) => {
    setActiveId(id)
    setContacts(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    const newMsg: Message = { id: Date.now(), from: 'me', text, time }
    setContacts(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastTime: 'Just now' }
        : c
    ))
    setInput('')
  }

  const filteredContacts = contacts.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0)

  return (
    <div className="ch-root">

      {/* ── Contact sidebar ── */}
      <div className="ch-sidebar">
        <div className="ch-sidebar-header">
          <div className="ch-sidebar-title-row">
            <h2 className="ch-sidebar-title">Messages</h2>
            {totalUnread > 0 && <span className="ch-total-unread">{totalUnread}</span>}
          </div>
          <div className="ch-search-wrap">
            <i className="fa-solid fa-magnifying-glass ch-search-icon" />
            <input
              className="ch-search"
              placeholder="Search clients…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ch-contact-list">
          {filteredContacts.map(c => (
            <button
              key={c.id}
              className={`ch-contact${activeId === c.id ? ' ch-contact--active' : ''}`}
              onClick={() => selectContact(c.id)}
            >
              <div className="ch-contact-avatar-wrap">
                <div className="ch-contact-avatar">{c.initials}</div>
                {c.online && <span className="ch-online-dot" />}
              </div>
              <div className="ch-contact-info">
                <div className="ch-contact-top">
                  <span className="ch-contact-name">{c.name}</span>
                  <span className="ch-contact-time">{c.lastTime}</span>
                </div>
                <div className="ch-contact-bottom">
                  <span className="ch-contact-preview">{c.lastMessage}</span>
                  {c.unread > 0 && <span className="ch-unread-badge">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
          {filteredContacts.length === 0 && (
            <p className="ch-no-results">No clients found</p>
          )}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="ch-window">

        {/* Header */}
        <div className="ch-win-header">
          <div className="ch-win-header-left">
            <div className="ch-win-avatar-wrap">
              <div className="ch-win-avatar">{active.initials}</div>
              {active.online && <span className="ch-online-dot ch-online-dot--lg" />}
            </div>
            <div>
              <p className="ch-win-name">{active.name}</p>
              <p className="ch-win-status">
                <span className={`ch-status-dot${active.online ? ' ch-status-dot--on' : ''}`} />
                {active.online ? 'Online' : 'Offline'}&nbsp;· {active.goal}
              </p>
            </div>
          </div>
          <div className="ch-win-actions">
            <button className="ch-win-action-btn" title="Video call"><i className="fa-solid fa-video" /></button>
            <button className="ch-win-action-btn" title="Phone call"><i className="fa-solid fa-phone" /></button>
            <button className="ch-win-action-btn" title="Client info"><i className="fa-solid fa-circle-info" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="ch-messages">
          {active.messages.map((msg, idx) => {
            const isMe = msg.from === 'me'
            const prevMsg = active.messages[idx - 1]
            const showAvatar = !isMe && (idx === 0 || prevMsg?.from === 'me')
            return (
              <div key={msg.id} className={`ch-msg-row${isMe ? ' ch-msg-row--me' : ''}`}>
                {!isMe && (
                  <div className={`ch-msg-avatar${showAvatar ? '' : ' ch-msg-avatar--hidden'}`}>
                    {active.initials}
                  </div>
                )}
                <div className={`ch-bubble${isMe ? ' ch-bubble--me' : ' ch-bubble--them'}`}>
                  <p className="ch-bubble-text">{msg.text}</p>
                  <span className="ch-bubble-time">
                    {msg.time}
                    {isMe && <i className="fa-solid fa-check-double ch-read-tick" />}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="ch-input-bar">
          <button className="ch-input-action" title="Attach file"><i className="fa-solid fa-paperclip" /></button>
          <button className="ch-input-action" title="Send diet plan"><i className="fa-solid fa-bowl-food" /></button>
          <input
            className="ch-input"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button className="ch-input-action" title="Emoji"><i className="fa-regular fa-face-smile" /></button>
          <button
            className={`ch-send-btn${input.trim() ? ' ch-send-btn--active' : ''}`}
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  )
}
