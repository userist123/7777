import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  Car,
  FileText,
  Star,
  Package,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  Euro,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Mock admin data
const mockStats = {
  totalRevenue: 125000,
  totalProjects: 156,
  activeProjects: 12,
  totalCustomers: 89,
  newCustomers: 8,
  averageRating: 4.8,
  pendingQuotes: 5,
  monthlyGrowth: 15,
};

const recentProjects = [
  {
    id: 1,
    customer: 'Alexandru Ionescu',
    vehicle: 'BMW M4 Competition',
    service: 'Full Wrap',
    status: 'in_progress',
    value: 3200,
    progress: 65,
  },
  {
    id: 2,
    customer: 'Maria Popescu',
    vehicle: 'Mercedes AMG GT',
    service: 'PPF Full',
    status: 'pending_approval',
    value: 2800,
    progress: 0,
  },
  {
    id: 3,
    customer: 'Andrei Mihai',
    vehicle: 'Porsche 911 GT3',
    service: 'Full Wrap + PPF',
    status: 'completed',
    value: 4500,
    progress: 100,
  },
];

const pendingReviews = [
  {
    id: 1,
    customer: 'Elena Dumitrescu',
    rating: 5,
    text: 'Servicii excelente! Recomand cu incredere.',
    date: '2024-01-18',
  },
  {
    id: 2,
    customer: 'Mihai Stanescu',
    rating: 5,
    text: 'Profesionalism de top, rezultat impecabil.',
    date: '2024-01-17',
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'in_progress':
      return <Badge className="bg-primary/20 text-primary">In progres</Badge>;
    case 'completed':
      return <Badge className="bg-green-500/20 text-green-400">Finalizat</Badge>;
    case 'pending_approval':
      return <Badge className="bg-yellow-500/20 text-yellow-400">Asteapta aprobare</Badge>;
    default:
      return null;
  }
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border hidden lg:block">
        <div className="p-6">
          <Link to="/" className="font-heading font-bold text-2xl gradient-text">
            CrissCustoms
          </Link>
          <Badge className="ml-2 bg-primary/20 text-primary text-xs">Admin</Badge>
        </div>

        <nav className="px-4 space-y-2">
          <Button 
            variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button 
            variant={activeSection === 'projects' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('projects')}
          >
            <Car className="w-4 h-4 mr-3" />
            Proiecte
          </Button>
          <Button 
            variant={activeSection === 'customers' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('customers')}
          >
            <Users className="w-4 h-4 mr-3" />
            Clienti
          </Button>
          <Button 
            variant={activeSection === 'quotes' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('quotes')}
          >
            <FileText className="w-4 h-4 mr-3" />
            Oferte
            {mockStats.pendingQuotes > 0 && (
              <Badge className="ml-auto bg-primary text-primary-foreground text-xs">
                {mockStats.pendingQuotes}
              </Badge>
            )}
          </Button>
          <Button 
            variant={activeSection === 'reviews' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('reviews')}
          >
            <Star className="w-4 h-4 mr-3" />
            Recenzii
          </Button>
          <Button 
            variant={activeSection === 'inventory' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('inventory')}
          >
            <Package className="w-4 h-4 mr-3" />
            Inventar
          </Button>
          <Button 
            variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('settings')}
          >
            <Settings className="w-4 h-4 mr-3" />
            Setari
          </Button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start mb-2">
              <Home className="w-4 h-4 mr-3" />
              Inapoi la site
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Deconectare
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Bine ai venit, {user?.name || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border-border hover:border-primary/30 transition-all card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Venituri totale</p>
                    <p className="text-2xl font-heading font-bold text-foreground">
                      {mockStats.totalRevenue.toLocaleString()} €
                    </p>
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +{mockStats.monthlyGrowth}% luna aceasta
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/10">
                    <Euro className="w-6 h-6 text-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/30 transition-all card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proiecte active</p>
                    <p className="text-2xl font-heading font-bold text-foreground">
                      {mockStats.activeProjects}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      din {mockStats.totalProjects} total
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/30 transition-all card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Clienti</p>
                    <p className="text-2xl font-heading font-bold text-foreground">
                      {mockStats.totalCustomers}
                    </p>
                    <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +{mockStats.newCustomers} noi
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border hover:border-primary/30 transition-all card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Rating mediu</p>
                    <p className="text-2xl font-heading font-bold text-foreground">
                      {mockStats.averageRating}
                    </p>
                    <p className="text-xs text-gold flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-gold" />
                      Excelent
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/10">
                    <Star className="w-6 h-6 text-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent projects */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Proiecte recente
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Vezi toate
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-all"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{project.customer}</p>
                        <p className="text-xs text-muted-foreground">{project.vehicle} • {project.service}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gold">{project.value} €</span>
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending reviews */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold" />
                  Recenzii de aprobat
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  Vezi toate
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div 
                      key={review.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground text-sm">{review.customer}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-gold text-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">"{review.text}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-green-400 border-green-500/30 hover:bg-green-500/10">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aproba
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                            Respinge
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card className="bg-card/50 border-border mt-6">
            <CardHeader>
              <CardTitle className="font-heading">Actiuni rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:border-primary/30">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="text-sm">Proiect nou</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:border-primary/30">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Client nou</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:border-primary/30">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Oferta noua</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border hover:border-primary/30">
                  <Package className="w-5 h-5 text-gold" />
                  <span className="text-sm">Adauga stoc</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
