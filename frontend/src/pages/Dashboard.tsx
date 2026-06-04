import Header from '@/components/Header';
import { API_BASE_URL } from '@/lib/api';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Users, GraduationCap, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const { language } = useLanguage();
  const [trainings, setTrainings] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchTrainings = () => {
      fetch(`${API_BASE_URL}/api/trainings`)
        .then(res => res.json())
        .then(data => {
          if (mounted) setTrainings(data);
        })
        .catch(err => console.error('Error fetching dashboard stats:', err));
    };

    // initial fetch
    fetchTrainings();
    // poll every 5 seconds so charts reflect new trainings
    const id = setInterval(fetchTrainings, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Calculate dynamic stats on top of baseline
  const activeTrainingsCount = 127 + trainings.filter(t => t.status === 'ongoing').length;
  const monthlyConductedCount = (() => {
    // Count trainings whose `createdAt` falls in the current month/year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const countThisMonth = trainings.filter(t => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    return 48 + countThisMonth;
  })();
  const totalParticipants = 15234 + trainings.reduce((acc, t) => acc + (t.participants || 0), 0);

  const stats = [
    {
      title: language === 'hi' ? 'सक्रिय प्रशिक्षण' : 'Active Trainings',
      value: activeTrainingsCount.toString(),
      change: '+12%',
      icon: GraduationCap,
      color: 'text-primary'
    },
    {
      title: language === 'hi' ? 'मासिक संचालित' : 'Monthly Conducted',
      value: monthlyConductedCount.toString(),
      change: '+8%',
      icon: BarChart3,
      color: 'text-secondary'
    },
    {
      title: language === 'hi' ? 'प्रतिभागी' : 'Participants',
      value: totalParticipants.toLocaleString(),
      change: '+23%',
      icon: Users,
      color: 'text-success'
    },
    {
      title: language === 'hi' ? 'पूर्णता दर' : 'Completion Rate',
      // compute completion rate from trainings (fallback to 87% if no data)
      value: (() => {
        const completed = trainings.filter(t => t.status === 'completed').length;
        const total = trainings.length;
        if (total === 0) return '87%';
        const percent = Math.round((completed / total) * 100);
        return `${percent}%`;
      })(),
      change: '+5%',
      icon: TrendingUp,
      color: 'text-primary'
    },
  ];

  // Baseline monthly data
  // Build monthly counts from trainings' createdAt timestamps (fallback to baseline if none)
  const monthNames = [
    language === 'hi' ? 'जन' : 'Jan',
    language === 'hi' ? 'फ़र' : 'Feb',
    language === 'hi' ? 'मार्च' : 'Mar',
    language === 'hi' ? 'अप्रै' : 'Apr',
    language === 'hi' ? 'मई' : 'May',
  ];

  // baseline values for older months
  const baselineMonthly = [35, 42, 38, 45, 48];

  const computedMonthly = baselineMonthly.slice();
  trainings.forEach(t => {
    if (t.createdAt) {
      const d = new Date(t.createdAt);
      const m = d.getMonth(); // 0-11
      // only aggregate for first 5 months shown (Jan-May)
      if (m >= 0 && m < 5) computedMonthly[m] += 1;
    } else {
      // if no timestamp, add to current month (May index 4)
      computedMonthly[4] += 1;
    }
  });

  const monthlyData = monthNames.map((name, idx) => ({ month: name, trainings: computedMonthly[idx] }));

  // Dynamic category distribution (accumulate on top of baseline values)
  const categoryCounts: Record<string, number> = {
    'Capacity Building': 35,
    'Response': 25,
    'Preparedness': 20,
    'Recovery': 20
  };

  trainings.forEach(t => {
    if (t.category) {
      // normalize category names
      let cat = t.category;
      if (cat === 'क्षमता निर्माण') cat = 'Capacity Building';
      if (cat === 'प्रतिक्रिया') cat = 'Response';
      if (cat === 'तैयारी') cat = 'Preparedness';
      if (cat === 'पुनर्प्राप्ति') cat = 'Recovery';

      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat] += 1;
      } else {
        categoryCounts[cat] = 1;
      }
    }
  });

  const categoryData = [
    { name: language === 'hi' ? 'क्षमता निर्माण' : 'Capacity Building', value: categoryCounts['Capacity Building'] },
    { name: language === 'hi' ? 'प्रतिक्रिया' : 'Response', value: categoryCounts['Response'] },
    { name: language === 'hi' ? 'तैयारी' : 'Preparedness', value: categoryCounts['Preparedness'] },
    { name: language === 'hi' ? 'पुनर्प्राप्ति' : 'Recovery', value: categoryCounts['Recovery'] },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--accent))'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-[1800px] py-6 px-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            {language === 'hi' ? 'रीयल-टाइम डैशबोर्ड' : 'Real-Time Dashboard'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'hi'
              ? 'राष्ट्रव्यापी प्रशिक्षण गतिविधियों की व्यापक निगरानी'
              : 'Comprehensive monitoring of training activities nationwide'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: `hsl(var(--primary))` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-success mt-1">
                    {stat.change} {language === 'hi' ? 'पिछले महीने से' : 'from last month'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Trend Chart */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{language === 'hi' ? 'मासिक प्रशिक्षण रुझान' : 'Monthly Training Trends'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trainings" stroke="hsl(var(--primary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{language === 'hi' ? 'श्रेणी वितरण' : 'Category Distribution'}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {language === 'hi' ? 'महत्वपूर्ण अलर्ट' : 'Critical Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-destructive" />
                <span>
                  {language === 'hi'
                    ? 'उत्तर प्रदेश में कम कवरेज - पिछले महीने केवल 12 प्रशिक्षण'
                    : 'Low coverage in Uttar Pradesh - Only 12 trainings last month'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-destructive" />
                <span>
                  {language === 'hi'
                    ? 'बिहार में विलंबित रिपोर्टिंग - 3 राज्य एजेंसियां लंबित'
                    : 'Delayed reporting in Bihar - 3 state agencies pending'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
