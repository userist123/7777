import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  MessageSquare, 
  Star,
  LogOut,
  Home,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Euro
} from 'lucide-react';

// Mock data for user projects
const mockProjects = [
  {
    id: 1,
    vehicle: 'BMW M4 Competition 2023',
    service: 'Full Wrap',
    color: 'Satin Midnight Blue',
    status: 'in_progress',
    progress: 65,
    stage: 'Colantare',
    startDate: '2024-01-15',
    estimatedEnd: '2024-01-22',
    totalCost: 3200,
    images: {
      before: 'https://images.unsplash.com/photo-1699078042053-ecd9166d3f26?w=400&q=80',
      during: null,
      after: null,
    }
  },
  {
    id: 2,
    vehicle: 'Mercedes AMG GT 2022',
    service: 'PPF Full',
    color: 'Transparent',
    status: 'completed',
    progress: 100,
    stage: 'Livrat',
    startDate: '2024-01-01',
    estimatedEnd: '2024-01-08',
    totalCost: 2800,
    images: {
      before: 'https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=400&q=80',
      during: null,
      after: 'https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=400&q=80',
    }
  }
];

const stages = [
  'Consultanta',
  'Design',
  'Aprobare',
  'Pregatire',
  'Colantare',
  'Control',
  'Finalizare',
  'Livrare'
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'in_progress':
      return <Badge className="bg-primary/20 text-primary border-primary/30">In progres</Badge>;
    case 'completed':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Finalizat</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In asteptare</Badge>;
    default:
      return null;
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Stats
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(p => p.status === 'in_progress').length;
  const totalInvested = mockProjects.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border hidden lg:block">
        <div className="p-6">
          <Link to="/" className="font-heading font-bold text-2xl gradient-text">
            CrissCustoms
          </Link>
        </div>

        <nav className="px-4 space-y-2">
          <Button 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Prezentare generala
          </Button>
          <Button 
            variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('projects')}
          >
            <Car className="w-4 h-4 mr-3" />
            Proiectele mele
          </Button>
          <Button 
            variant={activeTab === 'invoices' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('invoices')}
          >
            <FileText className="w-4 h-4 mr-3" />
            Facturi
          </Button>
          <Button 
            variant={activeTab === 'messages' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Mesaje
          </Button>
          <Button 
            variant={activeTab === 'reviews' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('reviews')}
          >
            <Star className="w-4 h-4 mr-3" />
            Recenzii
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
                Bine ai venit, {user?.name?.split(' ')[0] || 'Client'}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Dashboard-ul tau pentru proiecte
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proiecte active</p>
                    <p className="text-3xl font-heading font-bold text-foreground">{activeProjects}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total proiecte</p>
                    <p className="text-3xl font-heading font-bold text-foreground">{totalProjects}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total investit</p>
                    <p className="text-3xl font-heading font-bold text-foreground">{totalInvested.toLocaleString()} €</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gold/10">
                    <Euro className="w-6 h-6 text-gold" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects section */}
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Proiectele mele
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Project image */}
                      <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={project.images.before}
                          alt={project.vehicle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Project details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-heading font-semibold text-lg text-foreground">
                              {project.vehicle}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {project.service} • {project.color}
                            </p>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Progres: {project.stage}</span>
                            <span className="text-sm font-medium text-primary">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        {/* Stage indicators */}
                        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
                          {stages.map((stage, index) => {
                            const stageIndex = stages.indexOf(project.stage);
                            const isCompleted = index < stageIndex;
                            const isCurrent = index === stageIndex;
                            
                            return (
                              <div 
                                key={stage}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap ${
                                  isCompleted 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : isCurrent 
                                    ? 'bg-primary/20 text-primary' 
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isCompleted && <CheckCircle className="w-3 h-3" />}
                                {isCurrent && <Clock className="w-3 h-3" />}
                                {stage}
                              </div>
                            );
                          })}
                        </div>

                        {/* Dates and cost */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Start: {new Date(project.startDate).toLocaleDateString('ro-RO')}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Estimat: {new Date(project.estimatedEnd).toLocaleDateString('ro-RO')}
                          </span>
                          <span className="flex items-center gap-1 text-gold">
                            <Euro className="w-4 h-4" />
                            {project.totalCost.toLocaleString()} €
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
