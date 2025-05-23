import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data: number[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return 'Rp ' + context.parsed.y.toLocaleString('id-ID');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Pendapatan Mingguan
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="default" size="sm" className="text-xs">
              7 Hari
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              30 Hari
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
