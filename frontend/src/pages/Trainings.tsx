import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Search, MapPin, Calendar, Users, Building, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const Trainings = () => {
  const { language } = useLanguage();
  const { role } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTraining, setEditingTraining] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

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

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this training record?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTrainings(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Success', description: 'Training deleted successfully.' });
      } else {
        toast({ title: 'Error', description: 'Failed to delete training.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to connect to server.', variant: 'destructive' });
    }
  };

  const handleEditClick = (training: any) => {
    setEditingTraining(training);
    setEditFormData(training);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trainings/${editingTraining.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTrainings(prev => prev.map(t => t.id === updated.id ? updated : t));
        setEditingTraining(null);
        toast({ title: 'Success', description: 'Training updated successfully.' });
      } else {
        toast({ title: 'Error', description: 'Failed to update training.', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to connect to server.', variant: 'destructive' });
    }
  };

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
                      <Badge variant="outline">{training.category || 'General'}</Badge>
                    </div>
                  </div>
                  {role === 'Admin' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(training)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleDelete(training.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
      
      {/* Edit Dialog */}
      <Dialog open={!!editingTraining} onOpenChange={(open) => !open && setEditingTraining(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Training Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">City</Label>
              <Input
                id="city"
                value={editFormData.city || ''}
                onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">State</Label>
              <Input
                id="state"
                value={editFormData.state || ''}
                onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participants" className="text-right">Participants</Label>
              <Input
                id="participants"
                type="number"
                value={editFormData.participants || ''}
                onChange={(e) => setEditFormData({...editFormData, participants: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTraining(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trainings;
