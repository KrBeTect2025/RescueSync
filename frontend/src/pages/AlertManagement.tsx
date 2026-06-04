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
import { AlertTriangle, Send, X, Clock } from 'lucide-react';

interface Alert {
    id: number;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
    releasedBy: string;
    active: boolean;
}

const AlertManagement = () => {
    const { language, t } = useLanguage();
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        severity: 'Critical',
    });
    const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
    const [history, setHistory] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        try {
            const activeResponse = await fetch(`${API_BASE_URL}/api/alerts/current`);
            const historyResponse = await fetch(`${API_BASE_URL}/api/alerts/history`);

            if (activeResponse.ok) {
                const activeData = await activeResponse.json();
                setActiveAlert(activeData.activeAlert);
            }

            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setHistory(historyData);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast.error(language === 'hi' ? 'सतर्कता लोड करने में विफल' : 'Failed to load alerts');
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleReleaseAlert = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.message) {
            toast.error(language === 'hi' ? 'कृपया सभी फ़ील्ड भरें' : 'Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/alerts/release`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to release alert');
            }

            const newAlert = await response.json();
            setActiveAlert(newAlert);
            setHistory(prev => [newAlert, ...prev]);
            toast.success(
                language === 'hi' ? 'सतर्कता सफलतापूर्वक जारी की गई' : 'Alert released successfully',
                { duration: 5000 }
            );

            setFormData({ title: '', message: '', severity: 'Critical' });
        } catch (error) {
            console.error('Error releasing alert:', error);
            toast.error(language === 'hi' ? 'सतर्कता जारी करने में विफल' : 'Failed to release alert');
        } finally {
            setLoading(false);
        }
    };

    const handleClearAlert = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/alerts/clear`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to clear alert');
            }

            setActiveAlert(null);
            toast.success(
                language === 'hi' ? 'सतर्कता रद्द की गई' : 'Alert cleared'
            );
        } catch (error) {
            console.error('Error clearing alert:', error);
            toast.error(language === 'hi' ? 'सतर्कता रद्द करने में विफल' : 'Failed to clear alert');
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
                                {language === 'hi' ? 'आपातकालीन सतर्कता प्रबंधन' : 'Emergency Alert Management'}
                            </h1>
                            <p className="text-muted-foreground max-w-2xl">
                                {language === 'hi'
                                    ? 'तत्काल आपातकालीन सतर्कता जारी करें जो सभी उपयोगकर्ताओं को प्रभावित करेगी।'
                                    : 'Release emergency alerts that will impact all users immediately.'}
                            </p>
                        </div>
                        <Button onClick={fetchAlerts} variant="outline">
                            {language === 'hi' ? 'रीफ्रेश' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
                    <section className="space-y-6">
                        <Card className="border-destructive/50">
                            <CardHeader className="bg-destructive/10">
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    {language === 'hi' ? 'नई सतर्कता जारी करें' : 'Release New Alert'}
                                </CardTitle>
                                <CardDescription>
                                    {language === 'hi'
                                        ? 'सभी उपयोगकर्ताओं को तत्काल सूचित करने के लिए एक आपातकालीन सतर्कता बनाएं।'
                                        : 'Create an emergency alert to notify all users immediately.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form className="space-y-4" onSubmit={handleReleaseAlert}>
                                    <div className="space-y-2">
                                        <Label htmlFor="alert-title">{language === 'hi' ? 'सतर्कता शीर्षक' : 'Alert Title'} *</Label>
                                        <Input
                                            id="alert-title"
                                            placeholder={language === 'hi' ? 'उदा. बाढ़ की चेतावनी' : 'E.g. Flood Warning'}
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            required
                                            className="text-lg font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="alert-message">{language === 'hi' ? 'विस्तृत संदेश' : 'Detailed Message'} *</Label>
                                        <Textarea
                                            id="alert-message"
                                            placeholder={language === 'hi'
                                                ? 'सतर्कता का विस्तृत विवरण दर्ज करें...'
                                                : 'Enter detailed alert information...'
                                            }
                                            value={formData.message}
                                            onChange={(e) => handleChange('message', e.target.value)}
                                            rows={6}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="severity">{language === 'hi' ? 'गंभीरता स्तर' : 'Severity Level'}</Label>
                                        <Select value={formData.severity} onValueChange={(value) => handleChange('severity', value)}>
                                            <SelectTrigger id="severity">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Critical">{language === 'hi' ? 'गंभीर' : 'Critical'}</SelectItem>
                                                <SelectItem value="High">{language === 'hi' ? 'उच्च' : 'High'}</SelectItem>
                                                <SelectItem value="Medium">{language === 'hi' ? 'मध्यम' : 'Medium'}</SelectItem>
                                                <SelectItem value="Low">{language === 'hi' ? 'कम' : 'Low'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-base font-semibold py-6"
                                    >
                                        <Send className="mr-2 h-5 w-5" />
                                        {loading
                                            ? language === 'hi' ? 'जारी कर रहे हैं...' : 'Releasing...'
                                            : language === 'hi' ? 'सतर्कता जारी करें' : 'Release Alert'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-6">
                        {/* Active Alert Card */}
                        {activeAlert && activeAlert.active ? (
                            <Card className="border-destructive bg-destructive/5">
                                <CardHeader className="bg-destructive/20">
                                    <CardTitle className="text-destructive">
                                        {language === 'hi' ? 'सक्रिय सतर्कता' : 'Active Alert'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            {language === 'hi' ? 'शीर्षक:' : 'Title:'}
                                        </p>
                                        <p className="text-lg font-bold">{activeAlert.title}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            {language === 'hi' ? 'संदेश:' : 'Message:'}
                                        </p>
                                        <p className="text-sm">{activeAlert.message}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Badge variant="destructive" className="text-base px-3 py-1">
                                            {activeAlert.severity}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(activeAlert.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleClearAlert}
                                        variant="outline"
                                        className="w-full text-destructive border-destructive hover:bg-destructive/10"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        {language === 'hi' ? 'सतर्कता रद्द करें' : 'Clear Alert'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-center text-muted-foreground">
                                        {language === 'hi' ? 'कोई सक्रिय सतर्कता नहीं' : 'No active alerts'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Alerts */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {language === 'hi' ? 'हाल की सतर्कताएं' : 'Recent Alerts'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        {language === 'hi' ? 'कोई सतर्कता इतिहास नहीं' : 'No alert history'}
                                    </p>
                                ) : (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {history.slice(0, 5).map((alert) => (
                                            <div key={alert.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <p className="font-semibold text-sm">{alert.title}</p>
                                                    <Badge variant={alert.active ? 'destructive' : 'secondary'} className="text-xs">
                                                        {alert.active ? (language === 'hi' ? 'सक्रिय' : 'Active') : (language === 'hi' ? 'रद्द' : 'Cleared')}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AlertManagement;
