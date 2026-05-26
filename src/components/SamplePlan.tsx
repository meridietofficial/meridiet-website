const mealData = [
  {
    icon: 'fa-solid fa-sun', meal: 'Early Morning', time: '6:00 AM',
    color: '#f97316', bg: '#fff4ed',
    img: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=160&h=160&fit=crop&crop=center',
    day1: 'Warm Lemon Water + Soaked Almonds',
    day2: 'Methi Water + Walnuts',
    day3: 'Jeera Water + Anjeer',
  },
  {
    icon: 'fa-solid fa-mug-hot', meal: 'Breakfast', time: '8:00 AM',
    color: '#2d8c4e', bg: '#e8f5ee',
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=160&h=160&fit=crop&crop=center',
    day1: 'Moong Dal Chilla + Green Chutney',
    day2: 'Vegetable Upma + Coconut Chutney',
    day3: 'Besan Cheela + Curd',
  },
  {
    icon: 'fa-solid fa-apple-whole', meal: 'Mid Morning', time: '11:00 AM',
    color: '#e53e3e', bg: '#fff5f5',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=160&h=160&fit=crop&crop=center',
    day1: 'Banana + Buttermilk',
    day2: 'Apple + Handful of Peanuts',
    day3: 'Papaya + Chaas',
  },
  {
    icon: 'fa-solid fa-bowl-food', meal: 'Lunch', time: '1:00 PM',
    color: '#0891b2', bg: '#ecfeff',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=160&h=160&fit=crop&crop=center',
    day1: 'Dal + Brown Rice + Sabzi + Salad',
    day2: 'Rajma + Roti + Raita + Salad',
    day3: 'Chana Dal + Millet Roti + Subji',
  },
  {
    icon: 'fa-solid fa-cookie-bite', meal: 'Evening Snack', time: '5:00 PM',
    color: '#d97706', bg: '#fffbeb',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=160&h=160&fit=crop&crop=center',
    day1: 'Roasted Makhana + Herbal Tea',
    day2: 'Sprouts Chaat + Green Tea',
    day3: 'Dhokla + Mint Tea',
  },
  {
    icon: 'fa-solid fa-moon', meal: 'Dinner', time: '8:00 PM',
    color: '#7c3aed', bg: '#f5f3ff',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160&h=160&fit=crop&crop=center',
    day1: 'Palak Paneer + 1 Roti + Soup',
    day2: 'Khichdi + Curd + Papad',
    day3: 'Vegetable Daliya + Salad',
  },
]

const SamplePlan = () => {
  return (
    <section className="sample-section" id="sample-diet">

      {/* ── Header ── */}
      <div className="sp-header-band">
        <div className="sp-header-icons" aria-hidden="true">
          <i className="fa-solid fa-leaf" />
          <i className="fa-solid fa-bowl-food" />
          <i className="fa-solid fa-heart-pulse" />
          <i className="fa-solid fa-seedling" />
          <i className="fa-solid fa-utensils" />
          <i className="fa-solid fa-wheat-awn" />
          <i className="fa-solid fa-apple-whole" />
          <i className="fa-solid fa-dumbbell" />
        </div>
        <div className="container">
          <div className="sp-header-text">
            <span className="section-tag sp-tag-white">Sample Meal Plan</span>
            <h2 className="section-title sp-title-white">
              See What Your Personalized Meal Plan Looks Like
            </h2>
            <p className="section-sub sp-sub-white">
              A real 3-day Indian diet plan preview — fully customized to your goals,
              body type, and food preferences.
            </p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="container sp-body">
        <div className="sp-table-wrap">
          <table className="sp-table">
            <thead>
              <tr>
                <th className="sp-th-meal">Meal Time</th>
                <th>
                  <div className="sp-day-head">
                    <i className="fa-regular fa-calendar-days" />
                    <span>Day 1</span>
                    <em>Monday</em>
                  </div>
                </th>
                <th>
                  <div className="sp-day-head">
                    <i className="fa-regular fa-calendar-days" />
                    <span>Day 2</span>
                    <em>Tuesday</em>
                  </div>
                </th>
                <th>
                  <div className="sp-day-head">
                    <i className="fa-regular fa-calendar-days" />
                    <span>Day 3</span>
                    <em>Wednesday</em>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {mealData.map((row) => (
                <tr key={row.meal}>
                  <td className="sp-td-meal">
                    <div className="sp-meal-cell">
                      <div className="sp-img-wrap" style={{ '--ring': row.color } as React.CSSProperties}>
                        <img
                          src={row.img}
                          alt={row.meal}
                          className="sp-meal-img"
                          onError={(e) => {
                            const wrap = (e.target as HTMLImageElement).closest('.sp-img-wrap')
                            if (wrap) (wrap as HTMLElement).style.background = row.bg
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        <div className="sp-img-badge" style={{ background: row.color }}>
                          <i className={row.icon} />
                        </div>
                      </div>
                      <div className="sp-meal-info">
                        <span className="sp-meal-name" style={{ color: row.color }}>{row.meal}</span>
                        <span className="sp-meal-time">
                          <i className="fa-regular fa-clock" /> {row.time}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="sp-td-food">{row.day1}</td>
                  <td className="sp-td-food">{row.day2}</td>
                  <td className="sp-td-food">{row.day3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sp-footer">
          <p className="sp-note">
            <i className="fa-solid fa-circle-info" />
            Plans are personalized based on your BMI, health goals, allergies, and food preferences.
          </p>
          <a href="#get-plan" className="btn-primary">
            Get Your Full 7-Day Plan <i className="fa-solid fa-arrow-right" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default SamplePlan
