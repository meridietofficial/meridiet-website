import { useEffect, useRef, useState } from 'react'

const TEAM = [
  {
    name: 'Harmeet Batra',
    designation: 'Founder & CEO',
    photo: '/team-harmeet-batra.jpg',
    linkedin: '',
  },
  {
    name: 'Prashansa Dutt',
    designation: 'Brand Manager',
    photo: '/team-prashansa-dutt.jpg',
    linkedin: '',
  },
  {
    name: 'Simarjeet Kaur',
    designation: 'UI/UX Designer',
    photo: '/team-simarjeet-kaur.jpg',
    linkedin: '',
  },
  {
    name: 'Vikas Pal',
    designation: 'Growth Specialist',
    photo: '/team-vikas-pal.jpg',
    linkedin: '',
  },
  {
    name: 'Manish Kumar',
    designation: 'Software Developer',
    photo: '/team-manish-kumar.jpg',
    linkedin: '',
  },
  {
    name: 'Gaurang Aggarwal',
    designation: 'Graphic Designer',
    photo: '/team-gaurang-aggarwal.jpg',
    linkedin: '',
  },
  {
    name: 'Mohini Saini',
    designation: 'Dietitian',
    photo: '/team-mohini-saini.jpg',
    linkedin: '',
  },
  {
    name: 'Anjani Chaturvedi',
    designation: 'Dietitian',
    photo: '/team-anjani-chaturvedi.jpg',
    linkedin: '',
  },
  {
    name: 'Sagar Pal',
    designation: 'Social Media Manager',
    photo: '/team-sagar-pal.jpg',
    linkedin: '',
  },
  {
    name: 'Shivam Singh',
    designation: 'Ecommerce Manager',
    photo: '/team-shivam-singh.jpg',
    linkedin: '',
  },
]

const AVATAR_COLORS = [
  '#1e8e3e', '#2980b9', '#8e44ad', '#e67e22', '#16a085', '#c0392b',
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function TeamCard({ member, index, visible }: { member: typeof TEAM[0]; index: number; visible: boolean }) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length]

  return (
    <div
      className="ts-card"
      style={{ transitionDelay: `${index * 80}ms` }}
      data-visible={visible}
    >
      <div className="ts-photo-wrap">
        {member.photo && !imgFailed ? (
          <img
            src={member.photo}
            alt={member.name}
            className="ts-avatar-img"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="ts-avatar-initials" style={{ background: `${color}18`, color }}>
            {getInitials(member.name)}
          </span>
        )}
      </div>
      <div className="ts-card-info">
        <h3 className="ts-name">{member.name}</h3>
        <p className="ts-designation">{member.designation}</p>
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="ts-linkedin"
            aria-label={`${member.name} on LinkedIn`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
}

export default function TeamSection() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="ts-section" ref={sectionRef}>
      <div className="container">
        <div className={`ts-header${visible ? ' ts-visible' : ''}`}>
          <span className="section-tag">Our People</span>
          <h2 className="ts-title">Meet the Team</h2>
          <p className="ts-subtitle">The passionate people behind MeriDiet, working to make nutrition accessible for every Indian</p>
        </div>

        <div className="ts-grid">
          {TEAM.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}
