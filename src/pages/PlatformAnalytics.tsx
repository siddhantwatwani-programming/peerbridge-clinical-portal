import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Users,
  FileText,
  Cpu,
  TrendingUp,
  TrendingDown,
  Heart,
  Moon,
  Brain,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Mock data for charts
const studyTrendData = [
  { month: 'Jan', studies: 45, completed: 38 },
  { month: 'Feb', studies: 52, completed: 45 },
  { month: 'Mar', studies: 61, completed: 54 },
  { month: 'Apr', studies: 58, completed: 52 },
  { month: 'May', studies: 72, completed: 65 },
  { month: 'Jun', studies: 85, completed: 78 },
];

const studyTypeData = [
  { name: '7-Day Holter', value: 156, color: 'hsl(var(--primary))' },
  { name: '14-Day Holter', value: 89, color: 'hsl(var(--chart-2))' },
  { name: '24-Hour Holter', value: 67, color: 'hsl(var(--chart-3))' },
  { name: 'Event Monitor', value: 45, color: 'hsl(var(--chart-4))' },
  { name: 'MCT', value: 32, color: 'hsl(var(--chart-5))' },
];

const aiUsageData = [
  { day: 'Mon', summaries: 24, copilot: 45 },
  { day: 'Tue', summaries: 31, copilot: 52 },
  { day: 'Wed', summaries: 28, copilot: 48 },
  { day: 'Thu', summaries: 35, copilot: 61 },
  { day: 'Fri', summaries: 42, copilot: 73 },
  { day: 'Sat', summaries: 18, copilot: 29 },
  { day: 'Sun', summaries: 12, copilot: 21 },
];

const findingsData = [
  { name: 'Normal Sinus', value: 245 },
  { name: 'AFib/Flutter', value: 67 },
  { name: 'PVCs', value: 89 },
  { name: 'PACs', value: 56 },
  { name: 'Bradycardia', value: 34 },
  { name: 'Tachycardia', value: 45 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
  iconBg?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend, iconBg = 'bg-primary/10' }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend.value}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PlatformAnalytics: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Clinical monitoring insights and performance metrics</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Last updated: 5 min ago
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Studies"
          value={246}
          subtitle="42 started this week"
          icon={Activity}
          trend={{ value: 12, positive: true }}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Active Patients"
          value={1284}
          subtitle="89 new enrollments"
          icon={Users}
          trend={{ value: 8, positive: true }}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Reports Generated"
          value={892}
          subtitle="This month"
          icon={FileText}
          trend={{ value: 15, positive: true }}
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Active Devices"
          value={312}
          subtitle="Peerbridge Cor devices"
          icon={Cpu}
          trend={{ value: 5, positive: true }}
          iconBg="bg-orange-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Study Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={studyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="studies"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  name="Total Studies"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Study Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Study Types Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={studyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {studyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI & Clinical Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Usage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Feature Usage (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Bar dataKey="summaries" fill="hsl(var(--primary))" name="Report Summaries" radius={[4, 4, 0, 0]} />
                <Bar dataKey="copilot" fill="hsl(var(--chart-3))" name="Copilot Queries" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>OSA Detection Accuracy</span>
                <span className="font-medium">91.2%</span>
              </div>
              <Progress value={91.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EF Prediction Confidence</span>
                <span className="font-medium">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Report Summary Satisfaction</span>
                <span className="font-medium">94.8%</span>
              </div>
              <Progress value={94.8} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Copilot Query Resolution</span>
                <span className="font-medium">89.3%</span>
              </div>
              <Progress value={89.3} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Findings & Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Findings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Clinical Findings Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={findingsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device & Transmission Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Device & Transmission Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Transmission Success</span>
                </div>
                <p className="text-2xl font-bold">98.7%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Avg. Upload Time</span>
                </div>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Daily Transmissions</span>
                </div>
                <p className="text-2xl font-bold">1,847</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Pending Review</span>
                </div>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-4 w-4" />
                OSA Screening Results (This Month)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">No OSA Detected</span>
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">156</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mild OSA</span>
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">45</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moderate OSA</span>
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">28</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Severe OSA</span>
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">12</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Turnaround */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Turnaround Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">4.2h</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. AI Summary Generation</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">18h</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Report Completion</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">24h</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Physician Review</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">96%</p>
              <p className="text-sm text-muted-foreground mt-1">SLA Compliance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformAnalytics;
