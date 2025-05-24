import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Shield,
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Star,
  Calendar,
  BarChart3,
  Target,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DriverCreditScore {
  driverId: number;
  driverName: string;
  phone: string;
  vehicleType: string;
  creditScore: number;
  creditGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  maxTalanganAmount: number;
  currentTalanganUsed: number;
  availableCredit: number;
  factors: {
    paymentHistory: number; // 0-100
    orderFrequency: number; // 0-100
    completionRate: number; // 0-100
    customerRating: number; // 0-100
    experienceLevel: number; // 0-100
    vehicleOwnership: number; // 0-100
  };
  riskFactors: string[];
  strengthFactors: string[];
  lastAssessment: string;
  nextReview: string;
  talanganHistory: {
    totalRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    averageAmount: number;
    onTimePayments: number;
    latePayments: number;
  };
}

interface CreditApplication {
  id: number;
  driverId: number;
  driverName: string;
  requestedAmount: number;
  purpose: string;
  urgencyLevel: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
  reviewNotes?: string;
  approvedAmount?: number;
  repaymentTerms?: {
    dailyDeduction: number;
    totalDays: number;
    interestRate: number;
  };
}

export default function DriverCreditScoring() {
  const [activeTab, setActiveTab] = useState('scores');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch driver credit scores
  const { data: creditScores = [], isLoading: loadingScores } = useQuery<DriverCreditScore[]>({
    queryKey: ["/api/driver-credit/scores"],
  });

  // Fetch credit applications
  const { data: applications = [], isLoading: loadingApplications } = useQuery<CreditApplication[]>({
    queryKey: ["/api/driver-credit/applications"],
  });

  // Process credit application
  const processApplicationMutation = useMutation({
    mutationFn: (data: { applicationId: number; decision: string; approvedAmount?: number; terms?: any }) =>
      apiRequest("POST", `/api/driver-credit/applications/${data.applicationId}/process`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/driver-credit"] });
      toast({
        title: "💳 Aplikasi Kredit Diproses",
        description: "Keputusan kredit telah disampaikan kepada driver",
      });
    },
  });

  const getCreditGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Very High': return 'bg-red-100 text-red-800';
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

  const filteredScores = creditScores.filter(score => {
    const gradeMatch = filterGrade === 'all' || score.creditGrade === filterGrade;
    const riskMatch = filterRisk === 'all' || score.riskLevel === filterRisk;
    return gradeMatch && riskMatch;
  });

  const pendingApplications = applications.filter(app => app.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">💳 Driver Credit Scoring</h1>
          <p className="text-muted-foreground">
            Sistem penilaian kredit untuk talangan yang lebih besar berdasarkan performa driver
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <CreditCard className="h-3 w-3 mr-1" />
            {creditScores.length} Scored
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
                <p className="text-sm font-medium text-muted-foreground">Avg Credit Score</p>
                <div className="text-2xl font-bold">
                  {Math.round(creditScores.reduce((sum, s) => sum + s.creditScore, 0) / creditScores.length || 0)}
                </div>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Network average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grade A Drivers</p>
                <div className="text-2xl font-bold text-green-600">
                  {creditScores.filter(s => s.creditGrade === 'A').length}
                </div>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Excellent credit rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credit Available</p>
                <div className="text-2xl font-bold">
                  {formatCurrency(creditScores.reduce((sum, s) => sum + s.availableCredit, 0))}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Available for talangan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Drivers</p>
                <div className="text-2xl font-bold text-red-600">
                  {creditScores.filter(s => s.riskLevel === 'High' || s.riskLevel === 'Very High').length}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Require monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="scores">📊 Credit Scores</TabsTrigger>
            <TabsTrigger value="applications">📋 Applications</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-3">
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
                <SelectItem value="D">Grade D</SelectItem>
                <SelectItem value="F">Grade F</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
                <SelectItem value="Very High">Very High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Credit Scores Tab */}
        <TabsContent value="scores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📊 Driver Credit Scores ({filteredScores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingScores ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading credit scores...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredScores.map((score) => (
                    <Card key={score.driverId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          {/* Driver Info & Score */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold">{score.driverName}</h3>
                              <p className="text-sm text-muted-foreground">{score.phone}</p>
                              <p className="text-sm text-muted-foreground">{score.vehicleType}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Credit Score:</span>
                                <span className="text-2xl font-bold text-blue-600">{score.creditScore}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Badge className={getCreditGradeColor(score.creditGrade)}>
                                  Grade {score.creditGrade}
                                </Badge>
                                <Badge className={getRiskLevelColor(score.riskLevel)}>
                                  {score.riskLevel} Risk
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Credit Factors */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-green-600">📊 Credit Factors</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Payment History</span>
                                  <span>{score.factors.paymentHistory}%</span>
                                </div>
                                <Progress value={score.factors.paymentHistory} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Order Frequency</span>
                                  <span>{score.factors.orderFrequency}%</span>
                                </div>
                                <Progress value={score.factors.orderFrequency} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Completion Rate</span>
                                  <span>{score.factors.completionRate}%</span>
                                </div>
                                <Progress value={score.factors.completionRate} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Customer Rating</span>
                                  <span>{score.factors.customerRating}%</span>
                                </div>
                                <Progress value={score.factors.customerRating} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {/* Talangan Status */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-purple-600">💰 Talangan Status</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Max Amount:</span>
                                <span className="font-medium">{formatCurrency(score.maxTalanganAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Used:</span>
                                <span className="font-medium text-orange-600">{formatCurrency(score.currentTalanganUsed)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Available:</span>
                                <span className="font-medium text-green-600">{formatCurrency(score.availableCredit)}</span>
                              </div>
                              
                              <div className="mt-3">
                                <div className="text-xs text-muted-foreground mb-1">Credit Utilization</div>
                                <Progress 
                                  value={(score.currentTalanganUsed / score.maxTalanganAmount) * 100} 
                                  className="h-2" 
                                />
                              </div>
                            </div>
                          </div>

                          {/* Risk Assessment */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-red-600">⚠️ Risk Assessment</h4>
                            
                            <div>
                              <h5 className="text-sm font-medium text-green-600 mb-1">Strengths:</h5>
                              <ul className="text-xs space-y-1">
                                {score.strengthFactors.slice(0, 2).map((factor, index) => (
                                  <li key={index} className="text-green-700">• {factor}</li>
                                ))}
                              </ul>
                            </div>
                            
                            {score.riskFactors.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-red-600 mb-1">Risk Factors:</h5>
                                <ul className="text-xs space-y-1">
                                  {score.riskFactors.slice(0, 2).map((factor, index) => (
                                    <li key={index} className="text-red-700">• {factor}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              <p>Last Review: {score.lastAssessment}</p>
                              <p>Next Review: {score.nextReview}</p>
                            </div>
                            
                            <Button size="sm" variant="outline" className="w-full">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Detailed Report
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

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📋 Credit Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApplications ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
                  <p>Loading applications...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{application.driverName}</h3>
                            <p className="text-sm text-muted-foreground">Application #{application.id}</p>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Requested:</span>
                              <span className="ml-1 font-medium">{formatCurrency(application.requestedAmount)}</span>
                            </p>
                            <Badge className={`${application.urgencyLevel === 'High' ? 'bg-red-100 text-red-800' : 
                                             application.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                             'bg-green-100 text-green-800'}`}>
                              {application.urgencyLevel} Priority
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Purpose:</span>
                              <p className="mt-1">{application.purpose}</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Submitted:</span>
                              <span className="ml-1">{application.submittedDate}</span>
                            </div>
                            <Badge className={getCreditGradeColor(application.status)}>
                              {application.status.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {application.approvedAmount && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Approved Amount:</span>
                                <span className="ml-1 font-medium text-green-600">
                                  {formatCurrency(application.approvedAmount)}
                                </span>
                              </div>
                            )}
                            {application.repaymentTerms && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Daily Deduction:</span>
                                <span className="ml-1 font-medium">
                                  {formatCurrency(application.repaymentTerms.dailyDeduction)}
                                </span>
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
                                  onClick={() => processApplicationMutation.mutate({
                                    applicationId: application.id,
                                    decision: 'approve',
                                    approvedAmount: application.requestedAmount,
                                    terms: {
                                      dailyDeduction: Math.round(application.requestedAmount / 7),
                                      totalDays: 7,
                                      interestRate: 0
                                    }
                                  })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => processApplicationMutation.mutate({
                                    applicationId: application.id,
                                    decision: 'reject'
                                  })}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            <Button size="sm" variant="outline" className="w-full">
                              <Shield className="h-4 w-4 mr-2" />
                              Check Credit Score
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
                <CardTitle>📊 Credit Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['A', 'B', 'C', 'D', 'F'].map(grade => {
                    const count = creditScores.filter(s => s.creditGrade === grade).length;
                    const percentage = (count / creditScores.length) * 100 || 0;
                    return (
                      <div key={grade} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Grade {grade}</span>
                          <span className="text-sm text-muted-foreground">{count} drivers ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💰 Credit Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Credit Limit</span>
                    <span className="font-bold">
                      {formatCurrency(creditScores.reduce((sum, s) => sum + s.maxTalanganAmount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Used</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(creditScores.reduce((sum, s) => sum + s.currentTalanganUsed, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Available Credit</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(creditScores.reduce((sum, s) => sum + s.availableCredit, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Utilization Rate</span>
                    <span className="font-bold">
                      {((creditScores.reduce((sum, s) => sum + s.currentTalanganUsed, 0) / 
                         creditScores.reduce((sum, s) => sum + s.maxTalanganAmount, 0)) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}