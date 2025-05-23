import { useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrdersChartProps {
  data?: {
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export default function OrdersChart({ data }: OrdersChartProps) {
  const chartData = {
    labels: ["Selesai", "Dalam Perjalanan", "Menunggu Driver", "Dibatalkan"],
    datasets: [
      {
        data: data ? [data.completed, data.pending, 12, data.cancelled] : [85, 23, 12, 8],
        backgroundColor: [
          "hsl(var(--success))",
          "hsl(var(--accent))", 
          "hsl(var(--primary))",
          "hsl(var(--destructive))",
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: "60%",
  };

  return (
    <div className="h-[300px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
