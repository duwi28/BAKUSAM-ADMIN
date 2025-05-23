import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  PlusCircle, 
  BookOpen, 
  Lightbulb, 
  Trophy, 
  Smile, 
  Calendar,
  Tag,
  ThumbsUp,
  Star,
  Filter,
  Search,
  TrendingUp,
  Users,
  Zap,
  Target,
  Coffee,
  Clock,
  MapPin,
  Car,
  Shield
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface DriverStory {
  id: number;
  driverId: number;
  title: string;
  content: string;
  category: string;
  mood: string;
  tags: string[];
  imageUrl?: string;
  isAnonymous: boolean;
  isApproved: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  driver?: {
    id: number;
    fullName: string;
    vehicleType: string;
    rating: string;
  };
  isLiked?: boolean;
}

interface DriverTip {
  id: number;
  driverId: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  driver?: {
    id: number;
    fullName: string;
    vehicleType: string;
  };
  isHelpful?: boolean;
}

export default function DriverStories() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateTipOpen, setIsCreateTipOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    content: "",
    category: "experience",
    mood: "positive",
    tags: "",
    isAnonymous: false
  });
  const [newTip, setNewTip] = useState({
    title: "",
    content: "",
    category: "navigation",
    difficulty: "beginner"
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Query for stories
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["/api/driver-stories"],
  });

  // Query for tips
  const { data: tips, isLoading: tipsLoading } = useQuery({
    queryKey: ["/api/driver-tips"],
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: (storyData: any) => apiRequest('/api/driver-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...storyData,
        tags: storyData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        driverId: 1 // Mock driver ID
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-stories'] });
      setIsCreateStoryOpen(false);
      setNewStory({ title: "", content: "", category: "experience", mood: "positive", tags: "", isAnonymous: false });
    },
  });

  // Create tip mutation
  const createTipMutation = useMutation({
    mutationFn: (tipData: any) => apiRequest('/api/driver-tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...tipData,
        driverId: 1 // Mock driver ID
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-tips'] });
      setIsCreateTipOpen(false);
      setNewTip({ title: "", content: "", category: "navigation", difficulty: "beginner" });
    },
  });

  // Like story mutation
  const likeStoryMutation = useMutation({
    mutationFn: (storyId: number) => apiRequest(`/api/driver-stories/${storyId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: 1 }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-stories'] });
    },
  });

  const categoryColors = {
    experience: "bg-blue-100 text-blue-800",
    tips: "bg-green-100 text-green-800", 
    challenge: "bg-orange-100 text-orange-800",
    achievement: "bg-purple-100 text-purple-800",
    funny: "bg-pink-100 text-pink-800"
  };

  const moodIcons = {
    positive: <Smile className="h-4 w-4 text-green-600" />,
    neutral: <Coffee className="h-4 w-4 text-gray-600" />,
    challenging: <Target className="h-4 w-4 text-orange-600" />,
    educational: <Lightbulb className="h-4 w-4 text-blue-600" />
  };

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800"
  };

  const handleCreateStory = () => {
    createStoryMutation.mutate(newStory);
  };

  const handleCreateTip = () => {
    createTipMutation.mutate(newTip);
  };

  const handleLikeStory = (storyId: number) => {
    likeStoryMutation.mutate(storyId);
  };

  const storiesData = Array.isArray(stories) ? stories : [];
  const tipsData = Array.isArray(tips) ? tips : [];

  const filteredStories = storiesData.filter((story: DriverStory) => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Header */}
        <div 
          className={`transform transition-all duration-1000 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    Cerita & Pengalaman Driver
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-orange-500" />
                    Berbagi pengalaman, tips, dan inspirasi sesama driver
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Dialog open={isCreateStoryOpen} onOpenChange={setIsCreateStoryOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Bagikan Cerita
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Bagikan Cerita Pengalaman Anda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Judul Cerita</Label>
                        <Input
                          id="title"
                          placeholder="Contoh: Pengalaman Pertama Kali Mengantar di Hujan Deras"
                          value={newStory.title}
                          onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="content">Cerita Lengkap</Label>
                        <Textarea
                          id="content"
                          placeholder="Ceritakan pengalaman Anda dengan detail..."
                          value={newStory.content}
                          onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                          rows={6}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Kategori</Label>
                          <Select value={newStory.category} onValueChange={(value) => setNewStory({...newStory, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="experience">Pengalaman</SelectItem>
                              <SelectItem value="tips">Tips & Trik</SelectItem>
                              <SelectItem value="challenge">Tantangan</SelectItem>
                              <SelectItem value="achievement">Pencapaian</SelectItem>
                              <SelectItem value="funny">Cerita Lucu</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="mood">Mood</Label>
                          <Select value={newStory.mood} onValueChange={(value) => setNewStory({...newStory, mood: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="positive">Positif</SelectItem>
                              <SelectItem value="neutral">Netral</SelectItem>
                              <SelectItem value="challenging">Menantang</SelectItem>
                              <SelectItem value="educational">Edukatif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                        <Input
                          id="tags"
                          placeholder="Contoh: hujan, tips, pengalaman, customer"
                          value={newStory.tags}
                          onChange={(e) => setNewStory({...newStory, tags: e.target.value})}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="anonymous" 
                          checked={newStory.isAnonymous}
                          onCheckedChange={(checked) => setNewStory({...newStory, isAnonymous: checked})}
                        />
                        <Label htmlFor="anonymous">Posting sebagai anonim</Label>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setIsCreateStoryOpen(false)}>
                          Batal
                        </Button>
                        <Button 
                          onClick={handleCreateStory}
                          disabled={createStoryMutation.isPending}
                          className="bg-gradient-to-r from-orange-500 to-yellow-500"
                        >
                          {createStoryMutation.isPending ? 'Menyimpan...' : 'Bagikan Cerita'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isCreateTipOpen} onOpenChange={setIsCreateTipOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Bagikan Tips
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Bagikan Tips Berguna</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tip-title">Judul Tips</Label>
                        <Input
                          id="tip-title"
                          placeholder="Contoh: Cara Menghemat BBM Saat Mengantar"
                          value={newTip.title}
                          onChange={(e) => setNewTip({...newTip, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tip-content">Penjelasan Tips</Label>
                        <Textarea
                          id="tip-content"
                          placeholder="Jelaskan tips Anda secara detail..."
                          value={newTip.content}
                          onChange={(e) => setNewTip({...newTip, content: e.target.value})}
                          rows={5}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tip-category">Kategori</Label>
                          <Select value={newTip.category} onValueChange={(value) => setNewTip({...newTip, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="navigation">Navigasi</SelectItem>
                              <SelectItem value="customer_service">Layanan Customer</SelectItem>
                              <SelectItem value="vehicle_maintenance">Perawatan Kendaraan</SelectItem>
                              <SelectItem value="safety">Keamanan</SelectItem>
                              <SelectItem value="earnings">Penghasilan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                          <Select value={newTip.difficulty} onValueChange={(value) => setNewTip({...newTip, difficulty: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Pemula</SelectItem>
                              <SelectItem value="intermediate">Menengah</SelectItem>
                              <SelectItem value="advanced">Mahir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setIsCreateTipOpen(false)}>
                          Batal
                        </Button>
                        <Button 
                          onClick={handleCreateTip}
                          disabled={createTipMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          {createTipMutation.isPending ? 'Menyimpan...' : 'Bagikan Tips'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div 
          className={`transform transition-all duration-1000 delay-200 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari cerita atau tips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="experience">Pengalaman</SelectItem>
                    <SelectItem value="tips">Tips & Trik</SelectItem>
                    <SelectItem value="challenge">Tantangan</SelectItem>
                    <SelectItem value="achievement">Pencapaian</SelectItem>
                    <SelectItem value="funny">Cerita Lucu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="stories" className="space-y-6">
          <div 
            className={`transform transition-all duration-1000 delay-400 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-lg">
              <TabsTrigger value="stories" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Cerita Pengalaman
              </TabsTrigger>
              <TabsTrigger value="tips" className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Tips & Trik
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stories" className="space-y-6">
            {storiesLoading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredStories.map((story: DriverStory, index: number) => (
                  <div
                    key={story.id}
                    className={`transform transition-all duration-700 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="group hover:scale-[1.02] transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-yellow-400 text-white">
                                {story.isAnonymous ? '?' : story.driver?.fullName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">
                                  {story.isAnonymous ? 'Driver Anonim' : story.driver?.fullName}
                                </span>
                                {!story.isAnonymous && (
                                  <Badge variant="outline" className="text-xs">
                                    {story.driver?.vehicleType}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(new Date(story.createdAt))}</span>
                                {moodIcons[story.mood as keyof typeof moodIcons]}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={categoryColors[story.category as keyof typeof categoryColors]}>
                              {story.category}
                            </Badge>
                            {story.isApproved && (
                              <Badge className="bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-orange-600 transition-colors">
                          {story.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {story.content.length > 300 ? `${story.content.substring(0, 300)}...` : story.content}
                        </p>
                        
                        {story.tags && story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {story.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{story.viewsCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{story.commentsCount}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeStory(story.id)}
                              className={`${story.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                            >
                              <Heart className={`h-4 w-4 mr-1 ${story.isLiked ? 'fill-current' : ''}`} />
                              <span>{story.likesCount}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            {tipsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-white/80 backdrop-blur-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {tipsData.map((tip: DriverTip, index: number) => (
                  <div
                    key={tip.id}
                    className={`transform transition-all duration-700 ${
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Card className="group hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge className={difficultyColors[tip.difficulty as keyof typeof difficultyColors]}>
                            {tip.difficulty}
                          </Badge>
                          {tip.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {tip.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{tip.driver?.fullName}</span>
                          <Badge variant="outline" className="text-xs">
                            {tip.driver?.vehicleType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {tip.content.length > 200 ? `${tip.content.substring(0, 200)}...` : tip.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {tip.category.replace('_', ' ')}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${tip.isHelpful ? 'text-green-500' : 'text-gray-500'} hover:text-green-500`}
                          >
                            <ThumbsUp className={`h-4 w-4 mr-1 ${tip.isHelpful ? 'fill-current' : ''}`} />
                            <span>{tip.helpfulCount}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}