import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, DollarSign, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricsGridProps {
  analytics: {
    todayOrders: number;
    activeDrivers: number;
    todayRevenue: number;
    avgRating: number;
  } | undefined;
}

export default function MetricsGrid({ analytics }: MetricsGridProps) {
  if (!analytics) return null;

  const metrics = [
    {
      title: "Total Order Hari Ini",
      value: analytics.todayOrders.toString(),
      subtitle: "+12% dari kemarin",
      icon: Package,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Driver Aktif",
      value: analytics.activeDrivers.toString(),
      subtitle: "+3 driver baru",
      icon: Users,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(analytics.todayRevenue),
      subtitle: "+8% dari kemarin",
      icon: DollarSign,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Rating Rata-rata",
      value: analytics.avgRating.toFixed(1),
      subtitle: "dari 5.0 bintang",
      icon: Star,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="hover-lift">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-green-600">
                  <i className="fas fa-arrow-up"></i> {metric.subtitle}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`${metric.iconColor}`} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
