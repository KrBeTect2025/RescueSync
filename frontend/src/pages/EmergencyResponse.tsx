import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertCircle, Phone, ShieldCheck } from 'lucide-react';

interface EmergencyIncident {
    id: number;
    title: string;
    state: string;
    city: string;
    severity: string;
    priority: string;
    category: string;
    contact: string;
    description: string;
    status: string;
    createdAt: string;
}

const initialFormData = {
    title: '',
    state: '',
    city: '',
    severity: '',
    priority: '',
    category: '',
    contact: '',
    description: '',
};

const EmergencyResponse = () => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState(initialFormData);
    const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
    const [loading, setLoading] = useState(false);
    const [nearestStationInfo, setNearestStationInfo] = useState<string>('');

    const emergencyContacts = [
        {
            name: language === 'hi' ? 'राज्य समन्वयक' : 'State Coordinator',
            phone: '+91-11-1234-5678',
            description: language === 'hi' ? 'आपातकालीन समन्वय' : 'Emergency coordination',
        },
        {
            name: language === 'hi' ? 'राष्ट्रीय आपदा प्राधिकरण' : 'NDMA HQ',
            phone: '+91-11-2464-4880',
            description: language === 'hi' ? '4x7 आपातकालीन सहायता' : '24/7 emergency support',
        },
        {
            name: language === 'hi' ? 'राज्य आपदा प्रबंधन प्राधिकरण' : 'State SDMA',
            phone: '+91-44-2345-6789',
            description: language === 'hi' ? 'राज्य स्तर पर प्रतिक्रिया' : 'State-level response',
        },
    ];

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/emergencies`);
            if (!response.ok) {
                throw new Error('Failed to load emergencies');
            }
            const data = await response.json();
            setIncidents(data);
        } catch (error) {
            console.error('Error fetching emergencies:', error);
            toast.error(
                language === 'hi'
                    ? 'आपातकालीन घटनाओं को लोड करने में त्रुटि'
                    : 'Failed to load emergency incidents'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const findNearestStation = () => {
        const stations = [
            { state: 'Maharashtra', city: 'Mumbai', name: 'Mumbai Emergency Response Station', phone: '+91-22-4000-1234' },
            { state: 'Maharashtra', city: 'Pune', name: 'Pune Emergency Response Station', phone: '+91-20-4123-5678' },
            { state: 'Kerala', city: 'Thiruvananthapuram', name: 'Thiruvananthapuram Emergency Station', phone: '+91-471-234-5678' },
            { state: 'Delhi', city: 'New Delhi', name: 'Delhi Emergency Response Station', phone: '+91-11-3344-5566' },
            { state: 'Tamil Nadu', city: 'Chennai', name: 'Chennai Emergency Response Station', phone: '+91-44-5566-7788' },
        ];

        const match = stations.find((station) =>
            station.state === formData.state && station.city.toLowerCase() === formData.city.trim().toLowerCase()
        );

        if (match) {
            setNearestStationInfo(
                language === 'hi'
                    ? `निकटतम स्टेशन: ${match.name} (${match.phone})`
                    : `Nearest station: ${match.name} (${match.phone})`
            );
            return;
        }

        const stateMatch = stations.find((station) => station.state === formData.state);
        if (stateMatch) {
            setNearestStationInfo(
                language === 'hi'
                    ? `निकटतम स्टेशन: ${stateMatch.name} (${stateMatch.phone})`
                    : `Nearest station: ${stateMatch.name} (${stateMatch.phone})`
            );
            return;
        }

        setNearestStationInfo(
            language === 'hi'
                ? 'निकटतम स्टेशन का डेटा उपलब्ध नहीं है। कृपया शहर और राज्य सही करें।'
                : 'Nearest station data is not available. Please check the city and state.'
        );
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setNearestStationInfo('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.state || !formData.city || !formData.severity || !formData.priority || !formData.contact) {
            toast.error(
                language === 'hi' ? 'कृपया आवश्यक फ़ील्ड भरें' : 'Please complete the required fields'
            );
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/emergencies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit emergency');
            }

            const created = await response.json();
            setIncidents(prev => [created, ...prev]);
            toast.success(
                language === 'hi' ? 'आपातकालीन रिपोर्ट सफलतापूर्वक दर्ज की गई' : 'Emergency incident registered successfully'
            );
            resetForm();
        } catch (error) {
            console.error('Submit emergency error:', error);
            toast.error(
                language === 'hi' ? 'आपातकालीन रिपोर्ट दर्ज करने में विफल' : 'Failed to register emergency incident'
            );
        }
    };

    const handleResolve = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/emergencies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'resolved' }),
            });
            if (!response.ok) {
                throw new Error('Failed to update incident');
            }
            const updated = await response.json();
            setIncidents(prev => prev.map(item => item.id === id ? updated : item));
            toast.success(
                language === 'hi' ? 'घटना को हल कर दिया गया' : 'Incident marked resolved'
            );
        } catch (error) {
            console.error('Resolve incident error:', error);
            toast.error(
                language === 'hi' ? 'घटना अपडेट करने में विफल' : 'Failed to update incident'
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container py-8 px-4">
                <div className="mb-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
                                {language === 'hi' ? 'आपातकालीन प्रतिक्रिया प्रणाली' : 'Emergency Response System'}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl">
                                {language === 'hi'
                                    ? 'तत्काल प्रतिक्रिया, घटनाओं की रिपोर्ट और सक्रिय समन्वय के लिए एक केंद्रीकृत पैनल।'
                                    : 'A centralized command panel for rapid incident reporting and coordinated response.'}
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-destructive text-destructive-foreground">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                {language === 'hi' ? 'एल्लोरेट रिपोर्ट करें' : 'Report Emergency'}
                            </Button>
                            <Button variant="outline" onClick={fetchIncidents}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {language === 'hi' ? 'रीफ़्रेश घटनाएँ' : 'Refresh Incidents'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <section className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{language === 'hi' ? 'त्वरित संपर्क' : 'Quick Contacts'}</CardTitle>
                                <CardDescription>
                                    {language === 'hi'
                                        ? 'आपातकालीन समन्वय और रिपोर्टिंग टीमों तक तुरंत पहुंचें।'
                                        : 'Connect immediately with incident coordination teams.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {emergencyContacts.map((contact) => (
                                    <div key={contact.phone} className="rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">{contact.name}</p>
                                                <p className="text-sm text-muted-foreground">{contact.description}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`tel:${contact.phone}`}>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    {language === 'hi' ? 'कॉल करें' : 'Call'}
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{language === 'hi' ? 'सक्रिय घटनाएँ' : 'Active Incidents'}</CardTitle>
                                <CardDescription>
                                    {language === 'hi'
                                        ? 'हाल की रिपोर्ट की गई घटनाएँ और उनकी स्थिति।'
                                        : 'Recently reported incidents and current status.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
                                ) : incidents.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {language === 'hi' ? 'कोई सक्रिय घटना नहीं मिली' : 'No active incidents found'}
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {incidents.map((incident) => (
                                            <div key={incident.id} className="rounded-2xl border p-4 bg-background">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-semibold">{incident.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {incident.city}, {incident.state} • {new Date(incident.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant={incident.status === 'resolved' ? 'secondary' : incident.severity === 'Critical' ? 'destructive' : 'outline'}>
                                                            {incident.status === 'resolved'
                                                                ? language === 'hi' ? 'निपटाया गया' : 'Resolved'
                                                                : incident.severity}
                                                        </Badge>
                                                        {incident.priority && (
                                                            <Badge variant={incident.priority === 'Critical' ? 'destructive' : incident.priority === 'High' ? 'secondary' : 'outline'}>
                                                                {language === 'hi' ? `${incident.priority} प्राथमिकता` : `${incident.priority} priority`}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-sm text-muted-foreground">{incident.description}</p>
                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    <span className="text-sm font-medium">{language === 'hi' ? 'सम्पर्क' : 'Contact'}: {incident.contact}</span>
                                                    {incident.status !== 'resolved' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleResolve(incident.id)}>
                                                            {language === 'hi' ? 'समाधान करें' : 'Resolve'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <section>
                        <Card>
                            <CardHeader>
                                <CardTitle>{language === 'hi' ? 'नई आपातकालीन रिपोर्ट' : 'New Emergency Report'}</CardTitle>
                                <CardDescription>
                                    {language === 'hi'
                                        ? 'घटना की जानकारी दर्ज करें और प्रतिक्रिया टीम को सूचित करें।'
                                        : 'Enter incident details to notify the response team.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="incident-title">{language === 'hi' ? 'घटना शीर्षक' : 'Incident Title'} *</Label>
                                        <Input
                                            id="incident-title"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="state">{language === 'hi' ? 'राज्य' : 'State'} *</Label>
                                            <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                                                <SelectTrigger id="state">
                                                    <SelectValue placeholder={language === 'hi' ? 'राज्य चुनें' : 'Select state'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Maharashtra">{language === 'hi' ? 'महाराष्ट्र' : 'Maharashtra'}</SelectItem>
                                                    <SelectItem value="Kerala">{language === 'hi' ? 'केरल' : 'Kerala'}</SelectItem>
                                                    <SelectItem value="Delhi">{language === 'hi' ? 'दिल्ली' : 'Delhi'}</SelectItem>
                                                    <SelectItem value="Tamil Nadu">{language === 'hi' ? 'तमिलनाडु' : 'Tamil Nadu'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">{language === 'hi' ? 'शहर' : 'City'} *</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="severity">{language === 'hi' ? 'गंभीरता' : 'Severity'} *</Label>
                                            <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                                                <SelectTrigger id="severity">
                                                    <SelectValue placeholder={language === 'hi' ? 'चयन करें' : 'Select severity'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">{language === 'hi' ? 'कम' : 'Low'}</SelectItem>
                                                    <SelectItem value="Medium">{language === 'hi' ? 'मध्यम' : 'Medium'}</SelectItem>
                                                    <SelectItem value="High">{language === 'hi' ? 'उच्च' : 'High'}</SelectItem>
                                                    <SelectItem value="Critical">{language === 'hi' ? 'गंभीर' : 'Critical'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">{language === 'hi' ? 'प्राथमिकता' : 'Priority'} *</Label>
                                            <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                                <SelectTrigger id="priority">
                                                    <SelectValue placeholder={language === 'hi' ? 'चयन करें' : 'Select priority'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Low">{language === 'hi' ? 'कम' : 'Low'}</SelectItem>
                                                    <SelectItem value="Medium">{language === 'hi' ? 'मध्यम' : 'Medium'}</SelectItem>
                                                    <SelectItem value="High">{language === 'hi' ? 'उच्च' : 'High'}</SelectItem>
                                                    <SelectItem value="Critical">{language === 'hi' ? 'गंभीर' : 'Critical'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">{language === 'hi' ? 'घटना श्रेणी' : 'Incident Category'} *</Label>
                                            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder={language === 'hi' ? 'चयन करें' : 'Select category'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Flood">{language === 'hi' ? 'बाढ़' : 'Flood'}</SelectItem>
                                                    <SelectItem value="Storm">{language === 'hi' ? 'तूफ़ान' : 'Storm'}</SelectItem>
                                                    <SelectItem value="Fire">{language === 'hi' ? 'आग' : 'Fire'}</SelectItem>
                                                    <SelectItem value="Other">{language === 'hi' ? 'अन्य' : 'Other'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact">{language === 'hi' ? 'संपर्क व्यक्ति / फोन' : 'Contact Person / Phone'} *</Label>
                                        <Input
                                            id="contact"
                                            value={formData.contact}
                                            onChange={(e) => handleChange('contact', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">{language === 'hi' ? 'घटना विवरण' : 'Incident Description'}</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            rows={5}
                                        />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={findNearestStation}>
                                            {language === 'hi' ? 'निकटतम स्टेशन देखें' : 'Find Nearest Station'}
                                        </Button>
                                        {nearestStationInfo && (
                                            <p className="text-sm text-muted-foreground">
                                                {nearestStationInfo}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button type="submit" className="bg-destructive text-destructive-foreground">
                                            {language === 'hi' ? 'रिपोर्ट सबमिट करें' : 'Submit Report'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            {language === 'hi' ? 'रीसेट करें' : 'Reset'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EmergencyResponse;
