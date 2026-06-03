import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Calendar, Users, Building } from 'lucide-react';
import { useState, useEffect } from 'react';

const Trainings = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/trainings')
      .then(res => res.json())
      .then(data => {
        setTrainings(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching trainings:', error);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      ongoing: { color: 'bg-primary text-primary-foreground', label: language === 'hi' ? 'चल रहा' : 'Ongoing' },
      scheduled: { color: 'bg-secondary text-secondary-foreground', label: language === 'hi' ? 'निर्धारित' : 'Scheduled' },
      completed: { color: 'bg-success text-success-foreground', label: language === 'hi' ? 'पूर्ण' : 'Completed' }
    };
    const variant = variants[status];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const filteredTrainings = trainings.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            {language === 'hi' ? 'प्रशिक्षण कार्यक्रम' : 'Training Programs'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hi' 
              ? 'सभी आपदा प्रबंधन प्रशिक्षण गतिविधियों की व्यापक सूची' 
              : 'Comprehensive list of all disaster management training activities'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'hi' ? 'प्रशिक्षण, राज्य, या शहर खोजें...' : 'Search trainings, state, or city...'}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Trainings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
            </div>
          ) : filteredTrainings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'hi' ? 'कोई प्रशिक्षण नहीं मिला' : 'No trainings found'}
            </div>
          ) : (
            filteredTrainings.map((training) => (
            <Card key={training.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{training.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getStatusBadge(training.status)}
                      <Badge variant="outline">{training.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{training.city}, {training.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{training.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{training.participants} {language === 'hi' ? 'प्रतिभागी' : 'participants'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{training.partner}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trainings;
