import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Handshake,
  Building,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Crown,
  Star,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FranchisePartner {
  id: number;
  partnerName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  province: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  franchiseType: 'premium' | 'standard' | 'basic';
  joinDate: string;
  contractEndDate: string;
  investmentAmount: number;
  monthlyFee: number;
  revenueShare: number;
  performance: {
    totalOrders: number;
    monthlyRevenue: number;
    driverCount: number;
    customerSatisfaction: number;
    marketShare: number;
  };
  territory: {
    coverage: string[];
    exclusiveArea: number; // km radius
    populationServed: number;
  };
}

interface FranchiseApplication {
  id: number;
  applicantName: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  requestedTerritory: string;
  investmentCapacity: number;
  experience: string;
  businessPlan: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export default function FranchiseSystem() {
  const [activeTab, setActiveTab] = useState('partners');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch franchise partners
  const { data: partners = [], isLoading: loadingPartners } = useQuery<FranchisePartner[]>({
    queryKey: ["/api/franchise/partners"],
  });

  // Fetch franchise applications
  const { data: applications = [], isLoading: loadingApplications } = useQuery<FranchiseApplication[]>({
    queryKey: ["/api/franchise/applications"],
  });

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: (data: { applicationId: number; approvalData: any }) =>
      apiRequest("POST", `/api/franchise/applications/${data.applicationId}/approve`, data.approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/franchise"] });
      toast({
        title: "🤝 Aplikasi Franchise Disetujui",
        description: "Partner baru berhasil bergabung dengan jaringan Bakusam Express!",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFranchiseTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredPartners = partners.filter(partner => {
    const statusMatch = filterStatus === 'all' || partner.status === filterStatus;
    const typeMatch = filterType === 'all' || partner.franchiseType === filterType;
    return statusMatch && typeMatch;
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🤝 Franchise System</h1>
          <p className="text-muted-foreground">
            Kelola jaringan partner franchise Bakusam Express di seluruh Indonesia
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Handshake className="h-3 w-3 mr-1" />
            {partners.length} Partners
          </Badge>
          <Badge className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            {pendingApplications.length} Pending
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Partners</p>
                <div className="text-2xl font-bold">
                  {partners.filter(p => p.status === 'active').length}
                </div>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((partners.filter(p => p.status === 'active').length / partners.length) * 100 || 0).toFixed(1)}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Revenue</p>
                <div className="text-2xl font-bold">
                  {formatCurrency(partners.reduce((sum, p) => sum + p.performance.monthlyRevenue, 0))}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Monthly from all partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Territory Coverage</p>
                <div className="text-2xl font-bold">
                  {partners.reduce((sum, p) => sum + p.territory.coverage.length, 0)}
                </div>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Areas covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Satisfaction</p>
                <div className="text-2xl font-bold">
                  {(partners.reduce((sum, p) => sum + p.performance.customerSatisfaction, 0) / partners.length || 0).toFixed(1)}%
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="partners">🏢 Partners</TabsTrigger>
            <TabsTrigger value="applications">📋 Applications</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏢 Franchise Partners ({filteredPartners.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPartners ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading partners data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPartners.map((partner) => (
                    <Card key={partner.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Partner Info */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{partner.partnerName}</h3>
                                <p className="text-sm text-muted-foreground">{partner.ownerName}</p>
                                <p className="text-sm text-muted-foreground">{partner.city}, {partner.province}</p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Badge className={getStatusColor(partner.status)}>
                                {partner.status.toUpperCase()}
                              </Badge>
                              <Badge className={getFranchiseTypeColor(partner.franchiseType)}>
                                {partner.franchiseType.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-blue-600">📊 Performance</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Orders:</span>
                                <span className="font-medium">{partner.performance.totalOrders}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Revenue:</span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(partner.performance.monthlyRevenue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Drivers:</span>
                                <span className="font-medium">{partner.performance.driverCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Satisfaction:</span>
                                <span className="font-medium text-yellow-600">
                                  {partner.performance.customerSatisfaction}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Territory Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-purple-600">📍 Territory</h4>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-muted-foreground">Coverage:</span>
                                <div className="mt-1">
                                  {partner.territory.coverage.slice(0, 2).map((area, index) => (
                                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                                      {area}
                                    </Badge>
                                  ))}
                                  {partner.territory.coverage.length > 2 && (
                                    <Badge variant="outline">+{partner.territory.coverage.length - 2} more</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span>Radius:</span>
                                <span className="font-medium">{partner.territory.exclusiveArea} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Population:</span>
                                <span className="font-medium">{partner.territory.populationServed.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Financial Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-green-600">💰 Financial</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Investment:</span>
                                <span className="font-medium">{formatCurrency(partner.investmentAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Monthly Fee:</span>
                                <span className="font-medium">{formatCurrency(partner.monthlyFee)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Revenue Share:</span>
                                <span className="font-medium">{partner.revenueShare}%</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Contract: {partner.joinDate} - {partner.contractEndDate}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-3">
                              <Button size="sm" variant="outline" className="flex-1">
                                <FileText className="h-4 w-4 mr-1" />
                                Contract
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Analytics
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Franchise Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApplications ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading applications...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{application.businessName}</h3>
                            <p className="text-sm text-muted-foreground">{application.applicantName}</p>
                            <p className="text-sm text-muted-foreground">{application.phone}</p>
                            <p className="text-sm text-muted-foreground">{application.email}</p>
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-1 font-medium">{application.city}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Territory:</span>
                              <span className="ml-1 font-medium">{application.requestedTerritory}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Investment:</span>
                              <span className="ml-1 font-medium">{formatCurrency(application.investmentCapacity)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="ml-1">{application.experience}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Submitted:</span>
                              <span className="ml-1">{application.submittedDate}</span>
                            </div>
                            {application.reviewedBy && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Reviewed by:</span>
                                <span className="ml-1">{application.reviewedBy}</span>
                              </div>
                            )}
                            {application.reviewNotes && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="mt-1 text-gray-700">{application.reviewNotes}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {application.status === 'pending' && (
                              <div className="space-y-2">
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => approveApplicationMutation.mutate({
                                    applicationId: application.id,
                                    approvalData: { approved: true }
                                  })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            <Button size="sm" variant="outline" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📈 Franchise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Partners</span>
                    <span className="font-bold">{partners.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Partners</span>
                    <span className="font-bold text-green-600">
                      {partners.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Network Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(partners.reduce((sum, p) => sum + p.performance.monthlyRevenue, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Investment</span>
                    <span className="font-bold">
                      {formatCurrency(partners.reduce((sum, p) => sum + p.investmentAmount, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏆 Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partners
                    .filter(p => p.status === 'active')
                    .sort((a, b) => b.performance.monthlyRevenue - a.performance.monthlyRevenue)
                    .slice(0, 5)
                    .map((partner, index) => (
                      <div key={partner.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium">{partner.partnerName}</span>
                            <p className="text-xs text-muted-foreground">{partner.city}</p>
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(partner.performance.monthlyRevenue)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}