import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Percent, Megaphone, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "Tambah Driver",
      description: "Daftarkan driver baru",
      icon: UserPlus,
      bgColor: "bg-blue-50 hover:bg-blue-100",
      iconBg: "bg-blue-600",
      onClick: () => setLocation("/drivers")
    },
    {
      title: "Buat Promo",
      description: "Tambah voucher diskon",
      icon: Percent,
      bgColor: "bg-orange-50 hover:bg-orange-100",
      iconBg: "bg-orange-600",
      onClick: () => setLocation("/pricing")
    },
    {
      title: "Kirim Notifikasi",
      description: "Broadcast ke semua user",
      icon: Megaphone,
      bgColor: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-600",
      onClick: () => setLocation("/notifications")
    },
    {
      title: "Laporan Detail",
      description: "Analytics mendalam",
      icon: BarChart3,
      bgColor: "bg-purple-50 hover:bg-purple-100",
      iconBg: "bg-purple-600",
      onClick: () => setLocation("/reports")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Aksi Cepat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className={`w-full flex items-center space-x-3 p-4 ${action.bgColor} transition-colors h-auto justify-start`}
              onClick={action.onClick}
            >
              <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <action.icon className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>

        {/* System Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Status Sistem</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Server Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Update Terakhir</span>
              <span className="text-sm text-gray-600">2 menit lalu</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
