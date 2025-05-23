import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Settings as SettingsIcon, 
  Clock, 
  MapPin, 
  Users, 
  Shield,
  Save,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export default function Settings() {
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/settings"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      apiRequest("PATCH", `/api/settings/${key}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Berhasil",
        description: "Pengaturan berhasil disimpan",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: string) => {
    setUnsavedChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    const value = unsavedChanges[key];
    if (value !== undefined) {
      updateSettingMutation.mutate({ key, value });
      setUnsavedChanges(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleSaveAll = () => {
    Object.entries(unsavedChanges).forEach(([key, value]) => {
      updateSettingMutation.mutate({ key, value });
    });
    setUnsavedChanges({});
  };

  const handleReset = (key: string) => {
    setUnsavedChanges(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const getCurrentValue = (key: string) => {
    if (unsavedChanges[key] !== undefined) {
      return unsavedChanges[key];
    }
    const setting = settings.find(s => s.key === key);
    return setting?.value || "";
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Pengaturan Sistem</h1>
        {hasUnsavedChanges && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setUnsavedChanges({})}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveAll}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Semua
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList>
          <TabsTrigger value="operational">Operasional</TabsTrigger>
          <TabsTrigger value="regions">Wilayah</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Jam Operasional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="operational_hours_start">Jam Mulai</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="operational_hours_start"
                      type="time"
                      value={getCurrentValue("operational_hours_start")}
                      onChange={(e) => handleSettingChange("operational_hours_start", e.target.value)}
                    />
                    {unsavedChanges["operational_hours_start"] !== undefined && (
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={() => handleSave("operational_hours_start")}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReset("operational_hours_start")}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operational_hours_end">Jam Selesai</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="operational_hours_end"
                      type="time"
                      value={getCurrentValue("operational_hours_end")}
                      onChange={(e) => handleSettingChange("operational_hours_end", e.target.value)}
                    />
                    {unsavedChanges["operational_hours_end"] !== undefined && (
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={() => handleSave("operational_hours_end")}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReset("operational_hours_end")}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Operasional 24 Jam</Label>
                    <p className="text-sm text-muted-foreground">Aktifkan layanan 24 jam sehari</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Operasional Hari Libur</Label>
                    <p className="text-sm text-muted-foreground">Layanan tetap berjalan di hari libur</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>Pengaturan Umum</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max_order_distance">Jarak Maksimal Order (km)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="max_order_distance"
                    type="number"
                    placeholder="50"
                    value={getCurrentValue("max_order_distance")}
                    onChange={(e) => handleSettingChange("max_order_distance", e.target.value)}
                  />
                  {unsavedChanges["max_order_distance"] !== undefined && (
                    <div className="flex space-x-1">
                      <Button size="sm" onClick={() => handleSave("max_order_distance")}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReset("max_order_distance")}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_commission">Komisi Driver (%)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="driver_commission"
                    type="number"
                    placeholder="80"
                    value={getCurrentValue("driver_commission")}
                    onChange={(e) => handleSettingChange("driver_commission", e.target.value)}
                  />
                  {unsavedChanges["driver_commission"] !== undefined && (
                    <div className="flex space-x-1">
                      <Button size="sm" onClick={() => handleSave("driver_commission")}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReset("driver_commission")}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Wilayah Operasional</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jakarta Pusat</Label>
                    <p className="text-sm text-muted-foreground">Wilayah Jakarta Pusat aktif</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jakarta Barat</Label>
                    <p className="text-sm text-muted-foreground">Wilayah Jakarta Barat aktif</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jakarta Timur</Label>
                    <p className="text-sm text-muted-foreground">Wilayah Jakarta Timur aktif</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jakarta Selatan</Label>
                    <p className="text-sm text-muted-foreground">Wilayah Jakarta Selatan aktif</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jakarta Utara</Label>
                    <p className="text-sm text-muted-foreground">Wilayah Jakarta Utara aktif</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Tambah Wilayah Baru
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Pengaturan Pengguna</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verifikasi Email Customer</Label>
                    <p className="text-sm text-muted-foreground">Wajibkan verifikasi email untuk customer baru</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verifikasi KTP Driver</Label>
                    <p className="text-sm text-muted-foreground">Wajibkan verifikasi KTP untuk driver baru</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Approve Driver</Label>
                    <p className="text-sm text-muted-foreground">Otomatis approve driver yang sudah lengkap</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_failed_login">Maksimal Login Gagal</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="max_failed_login"
                    type="number"
                    placeholder="5"
                    value={getCurrentValue("max_failed_login")}
                    onChange={(e) => handleSettingChange("max_failed_login", e.target.value)}
                  />
                  {unsavedChanges["max_failed_login"] !== undefined && (
                    <div className="flex space-x-1">
                      <Button size="sm" onClick={() => handleSave("max_failed_login")}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReset("max_failed_login")}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Pengaturan Keamanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Aktifkan 2FA untuk admin</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Force HTTPS</Label>
                    <p className="text-sm text-muted-foreground">Paksa penggunaan HTTPS</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Otomatis logout setelah tidak aktif</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_timeout_minutes">Timeout Session (menit)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="session_timeout_minutes"
                    type="number"
                    placeholder="30"
                    value={getCurrentValue("session_timeout_minutes")}
                    onChange={(e) => handleSettingChange("session_timeout_minutes", e.target.value)}
                  />
                  {unsavedChanges["session_timeout_minutes"] !== undefined && (
                    <div className="flex space-x-1">
                      <Button size="sm" onClick={() => handleSave("session_timeout_minutes")}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReset("session_timeout_minutes")}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
