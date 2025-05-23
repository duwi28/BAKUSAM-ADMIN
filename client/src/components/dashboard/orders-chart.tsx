import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrdersChartProps {
  data: { [key: string]: number };
}

export default function OrdersChart({ data }: OrdersChartProps) {
  const statusLabels: { [key: string]: string } = {
    'delivered': 'Selesai',
    'in_transit': 'Dalam Perjalanan', 
    'pending': 'Menunggu Driver',
    'cancelled': 'Dibatalkan'
  };

  const labels = Object.keys(data).map(key => statusLabels[key] || key);
  const values = Object.values(data);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#4CAF50', // Green for completed
          '#FF9800', // Orange for in transit
          '#2196F3', // Blue for pending
          '#F44336', // Red for cancelled
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Status Order
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-sm text-blue-600 font-medium">
            Lihat Detail
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
